import {
  BadRequestException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateReservaDto } from './dto/create-reserva.dto';
import { Etiqueta, StatusLivro, TipoMembro } from 'src/generated/prisma/enums';
import { Reserva } from 'src/generated/prisma/client';
import { Cron, CronExpression } from '@nestjs/schedule';
import { MembrosService } from 'src/membros/membros.service';
import { LivrosService } from 'src/livros/livros.service';
import { console } from 'node:inspector/promises';

@Injectable()
export class ReservasService {
  private readonly logger = new Logger(LivrosService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly membroService: MembrosService,
  ) { }

  async createReserva(body: CreateReservaDto): Promise<{ message: string }> {
    try {
      const membro = await this.membroService.getMembroByMatricula(
        body.matricula,
      );
      if (!membro) {
        throw new Error('Membro não encontrado');
      }
      if (membro.ativo === false) {
        throw new BadRequestException(
          'Membro está inativo não pode realizar reservas.',
        );
      }

      const livro = await this.prisma.livro.findUnique({
        where: { id: body.livroId },
        include: {
          exemplares: true,
          _count: {
            select: {
              exemplares: { where: { status: StatusLivro.DISPONIVEL } },
            },
          },
        },
      });

      if (!livro) {
        throw new Error('Livro não encontrado');
      }
      if (livro.etiqueta === Etiqueta.VERMELHO)
        throw new BadRequestException(
          'Este livro é apenas para consulta local e não pode ser reservado.',
        );
      if (livro._count.exemplares > 1) {
        throw new BadRequestException(
          'Existem exemplares disponíveis na estante. Dirija-se à biblioteca para realizar o empréstimo.',
        );
      }

      const emprestimoAtivo = await this.prisma.emprestimo.findFirst({
        where: {
          membroId: membro.id,
          exemplar: { livroId: livro.id },
          dataDevolucao: null,
        },
      });
      if (emprestimoAtivo) {
        throw new BadRequestException(
          'Você já possui um exemplar deste livro em sua posse.',
        );
      }

      const reservaExistente = await this.prisma.reserva.findFirst({
        where: { membroId: membro.id, livroId: body.livroId, ativa: true },
      });

      if (reservaExistente) {
        throw new BadRequestException(
          'Já existe uma reserva ativa para este livro.',
        );
      }

      const ultimaReserva = await this.prisma.reserva.findFirst({
        where: { livroId: body.livroId, ativa: true },
        orderBy: { posicao: 'desc' },
      });
      const posicao = ultimaReserva ? ultimaReserva.posicao + 1 : 1;

      if (ultimaReserva && ultimaReserva.paraData) {
        const dataMinimaPermitida = new Date(ultimaReserva.paraData);
        dataMinimaPermitida.setDate(dataMinimaPermitida.getDate() + 7);
      }

      await this.prisma.reserva.create({
        data: {
          membroId: membro.id,
          livroId: body.livroId,
          posicao: posicao,
        },
      });

      return {
        message: `Reserva para o livro "${livro.titulo}" criada com sucesso! Posição na fila: ${posicao}`,
      };
    } catch (error) {
      throw error instanceof HttpException
        ? error
        : new InternalServerErrorException('Erro ao criar reserva');
    }
  }

  async getReservasByStatus(status: boolean): Promise<Reserva[]> {
    try {
      const reservas = await this.prisma.reserva.findMany({
        where: { ativa: status },
        include: {
          membro: {
            include: {
              usuario: { select: { nome: true, email: true, id: true } },
            },
          },
          livro: {
            include: {
              _count: {
                select: {
                  exemplares: { where: { status: StatusLivro.DISPONIVEL } },
                },
              },
              exemplares: true,
            },
          },
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
          membro: { include: { usuario: { select: { nome: true, email: true, role: true, ativo: true, criadoEm: true } } } },
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
          include: { livro: { select: { titulo: true } } },
        });

        if (!reserva || !reserva.ativa) {
          throw new BadRequestException(
            'Reserva não encontrada ou já cancelada',
          );
        }

        const titulo = reserva.livro.titulo;

        await tx.reserva.update({
          where: { id: reservaId },
          data: { ativa: false, posicao: 0, paraData: null }, 
        });

        await tx.reserva.updateMany({
          where: {
            livroId: reserva.livroId,
            posicao: { gt: reserva.posicao },
            ativa: true,
          },
          data: { posicao: { decrement: 1 } },
        });

        if (reserva.posicao === 1) {
          const novoPrimeiro = await tx.reserva.findFirst({
            where: {
              livroId: reserva.livroId,
              ativa: true,
              posicao: 1,
            },
          });

          if (novoPrimeiro) {
            const dataLimite = new Date();
            dataLimite.setDate(dataLimite.getDate() + 2);

            await tx.reserva.update({
              where: { id: novoPrimeiro.id },
              data: { paraData: dataLimite },
            });

            const dataFormatada = dataLimite.toLocaleString('pt-PT', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            });

            // Notificar
            await tx.notificacao.create({
              data: {
                membroId: novoPrimeiro.membroId,
                mensagem: `A reserva anterior do livro "${titulo}" foi cancelada. Agora é a sua vez! Você tem até ${dataFormatada} para levantá-lo.`,
              },
            });
          } else {
            const exemplarReservado = await tx.exemplar.findFirst({
              where: {
                livroId: reserva.livroId,
                status: StatusLivro.INDISPONIVEL,
              },
            });

            if (exemplarReservado) {
              await tx.exemplar.update({
                where: { id: exemplarReservado.id },
                data: { status: StatusLivro.DISPONIVEL },
              });
            }
          }
        }
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
        const reserva = await tx.reserva.findUnique({
          where: { id: reservaId },
          include: {
            livro: { include: { autor: true, categoria: true } },
            membro: {
              include: {
                usuario: {
                  select: { nome: true, email: true, role: true, ativo: true },
                },
              },
            },
          },
        });
        if (!reserva || !reserva.ativa) {
          throw new NotFoundException('Reserva não encontrada ou inativa');
        }
        if (reserva.posicao !== 1) {
          throw new BadRequestException(
            'Aguarde sua vez na fila. Existem membros à sua frente.',
          );
        }
        if (reserva.paraData && new Date() > reserva.paraData) {
          throw new BadRequestException(
            'O prazo de 48h para levantar este livro expirou.',
          );
        }

        const exemplarDisponivel = await tx.exemplar.findFirst({
          where: {
            livroId: reserva.livroId,
            status: StatusLivro.DISPONIVEL,
          },
        });

        if (!exemplarDisponivel) {
          throw new BadRequestException(
            'Não há exemplares físicos disponíveis no momento para atender esta reserva.',
          );
        }

        const totalDisponiveis = await tx.exemplar.count({
          where: { livroId: reserva.livroId, status: StatusLivro.DISPONIVEL },
        });

        if (totalDisponiveis < 2) {
          throw new BadRequestException(
            'Apenas um exemplar disponível na estante. Reservas só podem ser levantadas se houver mais de um exemplar para manter a consulta local.',
          );
        }

        const membro = reserva.membro;
        const livro = reserva.livro;
        const dataPrevista = new Date();

        if (livro.etiqueta === Etiqueta.BRANCO) {
          const diasAdicionais = membro.tipo === TipoMembro.PROFESSOR ? 15 : 5;
          dataPrevista.setDate(dataPrevista.getDate() + diasAdicionais);
        } else if (livro.etiqueta === Etiqueta.AMARELO)
          dataPrevista.setDate(dataPrevista.getDate() + 1);

        await tx.emprestimo.create({
          data: {
            membroId: reserva.membroId,
            exemplarId: exemplarDisponivel.id,
            dataPrevista,
          },
        });

        await tx.exemplar.update({
          where: { id: exemplarDisponivel.id },
          data: { status: StatusLivro.INDISPONIVEL },
        });

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

        await tx.historicoLeitura.create({
          data: {
            membroId: reserva.membroId,
            exemplarId: exemplarDisponivel.id,
            livroId: reserva.livroId,
          },
        });

        return {
          message: `Empréstimo do livro "${reserva.livro.titulo}" (Exemplar: ${exemplarDisponivel.codigoBarras}) realizado com sucesso!`,
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

  @Cron(CronExpression.EVERY_30_MINUTES)
  async handleExpiredReservations(): Promise<void> {
    this.logger.log('Iniciando limpeza de reservas...');

    const limiteExpiracao = new Date();
    limiteExpiracao.setHours(limiteExpiracao.getHours() - 48);

    try {
      const reservasExpiradas = await this.prisma.reserva.findMany({
        where: {
          ativa: true,
          posicao: 1,
          paraData: {
            not: null,
           lte: new Date(),
          },
        },
      });

      for (const reserva of reservasExpiradas) {
        await this.cancelarEPassarVez(reserva.id);
      }
    } catch (error) {
      console.error('Erro ao processar reservas expiradas:', error);
    }
  }

  private async cancelarEPassarVez(reservaId: number) {
    try {
      await this.prisma.$transaction(async (tx) => {
        const reserva = await tx.reserva.findUnique({
          where: { id: reservaId },
          include: {livro: {select: {titulo: true}}}
        });
        if (!reserva) return;

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

        const proximoMembro = await tx.reserva.findFirst({
          where: { livroId: reserva.livroId, ativa: true, posicao: 1 },
        });

        if (proximoMembro) {
          const novoPrazo = new Date();
          novoPrazo.setDate(novoPrazo.getDate() + 2);

          await tx.reserva.update({
            where: { id: proximoMembro.id },
            data: { paraData: novoPrazo },
          });

          await tx.notificacao.create({
            data: {
              membroId: proximoMembro.membroId,
              mensagem: `O livro \"${reserva.livro.titulo}\" que você reservou está disponível! Como o membro anterior não compareceu, agora é a sua vez. Você tem 48h.`,
            },
          });
        } else {
          const exemplarReservado = await tx.exemplar.findFirst({
            where: {
              livroId: reserva.livroId,
              status: StatusLivro.INDISPONIVEL,
            },
          });

          if (exemplarReservado) {
            await tx.exemplar.update({
              where: { id: exemplarReservado.id },
              data: { status: StatusLivro.DISPONIVEL },
            });
          }
        }
      });
    } catch (error) {
      console.error(`Erro ao passar vez da reserva ${reservaId}:`, error);
    }
  }
}
