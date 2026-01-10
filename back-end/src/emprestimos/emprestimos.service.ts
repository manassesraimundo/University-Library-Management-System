import {
  BadRequestException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateEmprestimoDto } from './dto/create-emprestimo.dto';
import { StatusLivro, TipoMembro } from 'src/generated/prisma/enums';
import { Emprestimo, Reserva } from 'src/generated/prisma/client';

@Injectable()
export class EmprestimosService {
  constructor(private readonly prisma: PrismaService) {}

  async createEmprestimo(body: CreateEmprestimoDto): Promise<Object> {
    try {
      await this.prisma.$transaction(async (tx) => {
        const membroExisted = await tx.membro.findUnique({
          where: { id: body.membroId },
          include: {
            emprestimos: {
              where: { multa: { paga: false } },
              include: { multa: true },
            },
            _count: {
              select: { emprestimos: { where: { dataDevolucao: null } } },
            },
          },
        });

        if (!membroExisted) {
          throw new NotFoundException('Membro não encontrado');
        }

        if (membroExisted.ativo === false) {
          throw new BadRequestException(
            'Membro inativo não pode realizar empréstimos',
          );
        }

        const multasPendentes = membroExisted.emprestimos
          .filter((e) => e.multa != null)
          .map((e) => e.multa);

        if (multasPendentes.length > 0) {
          const totalDevido = multasPendentes.reduce(
            (sum, multa) => sum + (multa?.valor ?? 0),
            0,
          );
          throw new BadRequestException(
            `Bloqueado: O membro possui ${multasPendentes.length} multa(s) pendente(s). Total: ${totalDevido} Kz`,
          );
        }

        const limite = membroExisted.tipo === TipoMembro.ESTUDANTE ? 3 : 5;

        if (membroExisted._count.emprestimos >= limite) {
          throw new BadRequestException(
            'Membro atingiu o limite máximo de empréstimos simultâneos',
          );
        }

        const livro = await tx.livro.findUnique({
          where: { id: body.livroId },
        });

        if (!livro) {
          throw new NotFoundException('Livro não encontrado');
        }

        if (livro.status !== StatusLivro.DISPONIVEL) {
          throw new BadRequestException('Livro indisponível para empréstimo');
        }

        const dataPrevista = new Date();
        dataPrevista.setDate(dataPrevista.getDate() + 7); // Adiciona 7 dias para a data prevista de devolução

        await tx.emprestimo.create({
          data: {
            membroId: body.membroId,
            livroId: body.livroId,
            dataPrevista,
          },
        });

        await tx.livro.update({
          where: { id: body.livroId },
          data: { status: StatusLivro.EMPRESTADO },
        });

        await tx.historicoLeitura.create({
          data: {
            membroId: body.membroId,
            livroId: body.livroId,
          },
        });
      });

      return { message: 'Empréstimo criado com sucesso' };
    } catch (error) {
      throw error instanceof HttpException
        ? error
        : new InternalServerErrorException('Erro ao criar empréstimo');
    }
  }

  async findAllEmprestimos(): Promise<Emprestimo[]> {
    try {
      const emprestimos = await this.prisma.emprestimo.findMany({
        include: {
          membro: true,
          livro: true,
        },
      });
      return emprestimos;
    } catch (error) {
      throw error instanceof HttpException
        ? error
        : new InternalServerErrorException('Erro ao buscar empréstimos');
    }
  }

  async returnEmprestimo(emprestimoId: number): Promise<Object> {
    try {
      await this.prisma.$transaction(async (tx) => {
        const emprestimo = await tx.emprestimo.findUnique({
          where: { id: emprestimoId },
          include: { livro: true },
        });

        if (!emprestimo) {
          throw new NotFoundException('Empréstimo não encontrado');
        }

        if (emprestimo.dataDevolucao) {
          throw new BadRequestException('Empréstimo já foi devolvido');
        }

        const dataDevolucao = new Date();

        await tx.emprestimo.update({
          where: { id: emprestimoId },
          data: { dataDevolucao },
        });

        const atrasoMs =
          dataDevolucao.getTime() - emprestimo.dataPrevista.getTime();
        const atrasoDias = Math.ceil(atrasoMs / (1000 * 60 * 60 * 24));

        if (atrasoDias > 0) {
          const valorMulta = atrasoDias * 500;

          await tx.multa.create({
            data: {
              emprestimoId: emprestimo.id,
              valor: valorMulta,
            },
          });
        }

        const reservaAtiva = await tx.reserva.findMany({
          where: {
            livroId: emprestimo.livroId,
            ativa: true,
          },
          orderBy: { posicao: 'asc' },
        });

        const reservaAtivaExists =
          reservaAtiva.length > 0
            ? StatusLivro.RESERVADO
            : StatusLivro.DISPONIVEL;
        await tx.livro.update({
          where: { id: emprestimo.livroId },
          data: { status: reservaAtivaExists },
        });
      });

      return { message: 'Empréstimo devolvido com sucesso' };
    } catch (error) {
      throw error instanceof HttpException
        ? error
        : new InternalServerErrorException('Erro ao devolver empréstimo');
    }
  }

  async findReserva(): Promise<Reserva[]> {
    try {
      const reservas = await this.prisma.reserva.findMany({
        include: {
          membro: true,
          livro: true,
        },
      });
      return reservas;
    } catch (error) {
      throw error instanceof HttpException
        ? error
        : new InternalServerErrorException('Erro ao buscar reservas');
    }
  }
}
