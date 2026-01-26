import {
  BadRequestException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateReservaDto } from './dto/create-reserva.dto';
import { StatusLivro } from 'src/generated/prisma/enums';
import { Reserva } from 'src/generated/prisma/client';
import { Cron, CronExpression } from '@nestjs/schedule';
import { MembrosService } from 'src/membros/membros.service';

@Injectable()
export class ReservasService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly membroService: MembrosService,
  ) {}

  async createReserva(body: CreateReservaDto): Promise<{ message: string }> {
    try {
      const membro = await this.membroService.getMembroByMatricula(
        body.matricula,
      );

      if (!membro) {
        throw new Error('Membro não encontrado');
      }

      const livro = await this.prisma.livro.findUnique({
        where: { id: body.livroId },
      });

      if (!livro) {
        throw new Error('Livro não encontrado');
      }

      if (livro.status === StatusLivro.DISPONIVEL)
        throw new BadRequestException(
          'Livro está disponível, não pode ser reservado',
        );

      const reservaExistente = await this.prisma.reserva.findFirst({
        where: {
          membroId: membro.id,
          livroId: body.livroId,
          ativa: true,
        },
      });

      if (reservaExistente) {
        throw new BadRequestException(
          'Já existe uma reserva ativa para este livro e membro',
        );
      }

      const emprestimoAtivo = await this.prisma.emprestimo.findFirst({
        where: {
          membroId: membro.id,
          livroId: body.livroId,
          dataDevolucao: null,
        },
      });

      if (emprestimoAtivo) {
        throw new BadRequestException(
          'Membro possui um empréstimo ativo deste livro',
        );
      }

      const ultimaReserva = await this.prisma.reserva.findFirst({
        where: { livroId: body.livroId, ativa: true },
        orderBy: { posicao: 'desc' },
      });

      if (ultimaReserva && ultimaReserva.paraData) {
        const dataMinimaPermitida = new Date(ultimaReserva.paraData);
        dataMinimaPermitida.setDate(dataMinimaPermitida.getDate() + 7);
      }
      const posicao = ultimaReserva ? ultimaReserva.posicao + 1 : 1;

      await this.prisma.reserva.create({
        data: {
          membroId: membro.id,
          livroId: body.livroId,
          posicao: posicao,
        },
      });

      return { message: 'Reserva criada com sucesso' };
    } catch (error) {
      throw error instanceof HttpException
        ? error
        : new InternalServerErrorException('Erro ao criar reserva');
    }
  }

  async getReservas(status: boolean): Promise<Reserva[]> {
    try {
      const reservas = await this.prisma.reserva.findMany({
        where: { ativa: status },
        include: {
          membro: { include: { usuario: true } },
          livro: true,
        },
        orderBy: { criadaEm: 'desc' },
      });
      return reservas;
    } catch (error) {
      throw new InternalServerErrorException('Erro ao buscar reservas');
    }
  }

  async getReservasByMatricula(matricula: string): Promise<Reserva[]> {
    try {
      const reservas = await this.prisma.reserva.findMany({
        where: { membro: { matricula } },
        include: {
          membro: true,
          livro: true,
        },
        orderBy: { criadaEm: 'desc' },
      });
      return reservas;
    } catch (error) {
      throw new InternalServerErrorException('Erro ao buscar reservas');
    }
  }

  async cancelarReserva(reservaId: number): Promise<{ message: string }> {
    try {
      await this.prisma.$transaction(async (tx) => {
        const reserva = await tx.reserva.findUnique({
          where: { id: reservaId },
        });

        if (!reserva || !reserva.ativa) {
          throw new BadRequestException(
            'Reserva não encontrada ou já cancelada',
          );
        }

        await tx.reserva.update({
          where: { id: reservaId },
          data: { ativa: false, posicao: 0 },
        });

        await tx.reserva.updateMany({
          where: {
            livroId: reserva.livroId,
            posicao: { gt: reserva.posicao },
            ativa: true,
          },
          data: { posicao: { decrement: 1 } },
        });
      });

      return { message: 'Reserva cancelada com sucesso' };
    } catch (error) {
      throw error instanceof HttpException
        ? error
        : new InternalServerErrorException('Erro ao cancelar reserva');
    }
  }

  async confirmarReservaParaEmprestimo(
    reservaId: number,
  ): Promise<{ message: string }> {
    try {
      return await this.prisma.$transaction(async (tx) => {
        // 1. Buscar a reserva com os dados do livro
        const reserva = await tx.reserva.findUnique({
          where: { id: reservaId },
          include: { livro: true },
        });

        if (!reserva || !reserva.ativa) {
          throw new NotFoundException('Reserva não encontrada ou inativa');
        }

        // 2. Regra de Negócio: Apenas o primeiro da fila pode levantar
        if (reserva.posicao !== 1) {
          throw new BadRequestException(
            'Aguarde sua vez na fila. Existem membros à sua frente.',
          );
        }

        // 3. Verificar se a data já chegou (Pode ser hoje ou depois)
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);

        if (!reserva.paraData) {
          throw new BadRequestException(
            'Data de levantamento não definida para esta reserva.',
          );
        }

        const dataReserva = new Date(reserva.paraData);
        dataReserva.setHours(0, 0, 0, 0);

        const dataPrevista = new Date();
        dataPrevista.setDate(dataPrevista.getDate() + 7);

        await tx.emprestimo.create({
          data: {
            membroId: reserva.membroId,
            livroId: reserva.livroId,
            dataPrevista,
          },
        });

        // 5. Finalizar esta reserva e reordenar a fila
        await tx.reserva.update({
          where: { id: reservaId },
          data: { ativa: false, posicao: 0 },
        });

        await tx.reserva.updateMany({
          where: {
            livroId: reserva.livroId,
            posicao: { gt: 1 },
            ativa: true,
          },
          data: { posicao: { decrement: 1 } },
        });

        // 6. Atualizar histórico
        await tx.historicoLeitura.create({
          data: {
            membroId: reserva.membroId,
            livroId: reserva.livroId,
          },
        });

        return {
          message: 'Empréstimo realizado com sucesso a partir da reserva!',
        };
      });
    } catch (error) {
      throw error instanceof HttpException
        ? error
        : new InternalServerErrorException(
            'Erro ao processar levantamento de reserva',
          );
    }
  }

  @Cron(CronExpression.EVERY_HOUR)
  async handleExpiredReservations(): Promise<void> {
    console.log('Verificando reservas expiradas...');

    const limiteExpiracao = new Date();
    limiteExpiracao.setHours(limiteExpiracao.getHours() - 48);

    try {
      const reservasExpiradas = await this.prisma.reserva.findMany({
        where: {
          ativa: true,
          posicao: 1,
          paraData: { lt: limiteExpiracao },
        },
      });

      for (const reserva of reservasExpiradas) {
        await this.cancelarEPassarVez(reserva.id);
      }
    } catch (error) {
      throw error instanceof HttpException
        ? error
        : new InternalServerErrorException(
            'Erro ao processar reservas expiradas',
          );
    }
  }

  private async cancelarEPassarVez(reservaId: number) {
    try {
      await this.prisma.$transaction(async (tx) => {
        const reserva = await tx.reserva.findUnique({
          where: { id: reservaId },
        });
        if (!reserva) return;

        await tx.reserva.update({
          where: { id: reservaId },
          data: { ativa: false, posicao: 0 },
        });

        await tx.reserva.updateMany({
          where: {
            livroId: reserva.livroId,
            posicao: { gt: reserva.posicao },
            ativa: true,
          },
          data: { posicao: { decrement: 1 } },
        });

        const totalReservasAtivas = await tx.reserva.count({
          where: {
            livroId: reserva.livroId,
            ativa: true,
          },
        });

        if (totalReservasAtivas === 0) {
          await tx.livro.update({
            where: { id: reserva.livroId },
            data: { status: StatusLivro.DISPONIVEL },
          });
        }

        // Aqui você pode adicionar lógica para notificar o próximo membro na fila, se necessário
      });
    } catch (error) {
      throw error instanceof HttpException
        ? error
        : new InternalServerErrorException('Erro ao cancelar reserva expirada');
    }
  }
}
