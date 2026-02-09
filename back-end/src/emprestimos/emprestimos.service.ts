import {
  BadRequestException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateEmprestimoDto } from './dto/create-emprestimo.dto';
import { Etiqueta, StatusLivro, TipoMembro } from 'src/generated/prisma/enums';
import { Emprestimo } from 'src/generated/prisma/client';
import { RenovarEmprestimoDto } from './dto/renovar-emprestimo.dto';

@Injectable()
export class EmprestimosService {
  constructor(private readonly prisma: PrismaService) {}

  async createEmprestimo(
    body: CreateEmprestimoDto,
  ): Promise<{ message: string }> {
    try {
      await this.prisma.$transaction(async (tx) => {
        // 1. Validar Membro e Limites
        const membro = await tx.membro.findUnique({
          where: { matricula: body.matricula },
          include: {
            _count: {
              select: { emprestimos: { where: { dataDevolucao: null } } },
            },
          },
        });

        if (!membro) throw new NotFoundException('Membro não encontrado');
        if (!membro.ativo) throw new BadRequestException('Membro inativo');

        // Verificar Limite de Quantidade
        const limite = membro.tipo === TipoMembro.ESTUDANTE ? 3 : 5;
        if (membro._count.emprestimos >= limite) {
          throw new BadRequestException(
            `Limite de ${limite} empréstimos atingido.`,
          );
        }

        // Verificar Multas (Usando uma query direta mais eficiente)
        const possuiMulta = await tx.multa.findFirst({
          where: { emprestimo: { membroId: membro.id }, paga: false },
        });
        if (possuiMulta)
          throw new BadRequestException('Membro possui multas pendentes');

        // 2. Validar Exemplar e Livro
        const exemplar = await tx.exemplar.findUnique({
          where: { codigoBarras: body.codigoBarras },
          include: { livro: true },
        });

        if (!exemplar) throw new NotFoundException('Exemplar não encontrado');
        if (exemplar.status !== StatusLivro.DISPONIVEL) {
          throw new BadRequestException(
            'Este exemplar já está emprestado ou indisponível.',
          );
        }

        const livro = exemplar.livro;
        if (livro.etiqueta === Etiqueta.VERMELHO) {
          throw new BadRequestException(
            'Livros de etiqueta VERMELHA são apenas para consulta local.',
          );
        }

        // 3. Regra do Quadrado (Mínimo 1 exemplar disponível na estante)
        const exemplaresDisponiveis = await tx.exemplar.count({
          where: { livroId: livro.id, status: StatusLivro.DISPONIVEL },
        });

        const reservaExistente = await tx.reserva.findFirst({
          where: { livroId: exemplar.livroId, ativa: true },
        });

        if (exemplaresDisponiveis < 2) {
          throw new BadRequestException(
            'Este é o último exemplar disponível. Deve permanecer para consulta local.',
          );
        }

        if (
          reservaExistente &&
          exemplaresDisponiveis === 2 &&
          reservaExistente?.membroId !== membro.id
        ) {
          throw new BadRequestException(
            'Exite reserva pendente para este livro.',
          );
        }

        // 4. Lógica de Data Prevista
        const dataPrevista = new Date();
        if (livro.etiqueta === Etiqueta.AMARELO) {
          dataPrevista.setDate(dataPrevista.getDate() + 1);
        } else {
          const dias = membro.tipo === TipoMembro.PROFESSOR ? 15 : 5;
          dataPrevista.setDate(dataPrevista.getDate() + dias);
        }

        // 5. Executar Operações (Ordem correta)
        await tx.emprestimo.create({
          data: {
            membroId: membro.id,
            exemplarId: exemplar.id,
            dataPrevista,
          },
        });

        // Mudar status para INDISPONIVEL
        await tx.exemplar.update({
          where: { id: exemplar.id },
          data: { status: StatusLivro.INDISPONIVEL },
        });

        await tx.historicoLeitura.create({
          data: {
            membroId: membro.id,
            exemplarId: exemplar.id,
            livroId: livro.id,
          },
        });

        if (reservaExistente) {
          await tx.reserva.update({
            where: { id: reservaExistente.id },
            data: { ativa: false },
          });
        }
      });

      return { message: 'Empréstimo criado com sucesso' };
    } catch (error) {
      throw error instanceof HttpException
        ? error
        : new InternalServerErrorException('Erro ao criar empréstimo');
    }
  }

  async getAllEmprestimosEntreges(): Promise<Emprestimo[]> {
    try {
      const emprestimos = await this.prisma.emprestimo.findMany({
        include: {
          membro: { include: { usuario: { omit: { senha: true } } } },
          exemplar: { include: { livro: true } },
          multa: true,
        },
        orderBy: { dataEmprestimo: 'desc' },
        take: 10,
      });

      const resul = emprestimos.filter((e) => e.dataDevolucao !== null);

      return resul;
    } catch (error) {
      throw error instanceof HttpException
        ? error
        : new InternalServerErrorException('Erro ao carregar empréstimos');
    }
  }

  async getAllEmprestimos(etiqueta?: string): Promise<any[]> {
    try {
      const where: any = {
        dataDevolucao: null,
        dataPrevista: { gte: new Date() },
      };

      if (etiqueta) {
        where.exemplar = {
          livro: {
            etiqueta: Etiqueta[etiqueta.toUpperCase() as keyof typeof Etiqueta],
          },
        };
      }

      const emprestimos = await this.prisma.emprestimo.findMany({
        where,
        include: {
          exemplar: {
            include: {
              livro: {
                include: {
                  categoria: true,
                  _count: {
                    select: {
                      exemplares: true,
                      reservas: { where: { ativa: true } },
                    },
                  },
                  exemplares: {
                    where: { status: StatusLivro.DISPONIVEL },
                    select: { id: true },
                  },
                },
              },
            },
          },
        },
        orderBy: { dataEmprestimo: 'desc' },
      });

      const livrosVistos = new Set();

      return emprestimos.reduce((acc: any, e) => {
        const livro = e.exemplar.livro;
        if (!livrosVistos.has(livro.id)) {
          livrosVistos.add(livro.id);
          acc.push({
            id: e.id,
            livroId: livro.id,
            titulo: livro.titulo,
            categoria: livro.categoria.nome,
            etiqueta: livro.etiqueta,
            quantidadeExemplares: livro._count.exemplares,
            quantidadeDisponiveis: livro.exemplares.length,
            quantidadeReservado: livro._count.reservas,
          });
        }
        return acc;
      }, []);
    } catch (error) {
      throw new InternalServerErrorException('Erro ao buscar empréstimos');
    }
  }

  async getAllEmprestimos2(): Promise<any[]> {
    try {
      const where: any = {
        dataDevolucao: null,
        dataPrevista: { gte: new Date() },
      };

      // if (etiqueta) {
      //   where.exemplar = { livro: { etiqueta: Etiqueta[etiqueta.toUpperCase() as keyof typeof Etiqueta] } };
      // }

      const emprestimos = await this.prisma.emprestimo.findMany({
        where,
        include: {
          membro: { include: { usuario: { select: { nome: true } } } },
          exemplar: {
            include: {
              livro: {
                include: {
                  categoria: true,
                  _count: {
                    select: {
                      exemplares: true,
                      reservas: { where: { ativa: true } },
                    },
                  },
                  exemplares: {
                    where: { status: StatusLivro.DISPONIVEL },
                    select: { id: true },
                  },
                },
              },
            },
          },
        },
        orderBy: { dataEmprestimo: 'desc' },
      });

      return emprestimos;
    } catch (error) {
      throw new InternalServerErrorException('Erro ao buscar empréstimos');
    }
  }

  async getAllEmprestimosAtraso() {
    try {
      const emprestimos = await this.prisma.emprestimo.findMany({
        where: { dataPrevista: { lt: new Date() }, dataDevolucao: null },
        include: {
          exemplar: { include: { livro: true } },
          multa: true,
          membro: { include: { usuario: { omit: { senha: true } } } },
        },
        orderBy: { dataEmprestimo: 'desc' },
      });

      return emprestimos;
    } catch (error) {
      throw error instanceof HttpException
        ? error
        : new InternalServerErrorException(
            'Erro ao buscar empréstimos em atrasos.',
          );
    }
  }

  async getHistorico() {
    try {
      const historico = await this.prisma.emprestimo.findMany({
        orderBy: { dataDevolucao: 'desc' },
        include: {
          membro: {
            include: { usuario: { select: { nome: true, email: true } } },
          },
          exemplar: { include: { livro: true } },
          multa: true,
        },
      });

      return historico.filter((his) => his.dataDevolucao);
    } catch (error) {
      throw error instanceof HttpException
        ? error
        : new InternalServerErrorException('Erro ao buscar Historico.');
    }
  }

  async getAllEmprestimosByMembro(matricula: string) {
    try {
      const emprestimos = await this.prisma.emprestimo.findMany({
        where: { membro: { matricula } },
        include: {
          exemplar: { include: { livro: true } },
          multa: true,
          membro: { include: { usuario: { omit: { senha: true } } } },
        },
        orderBy: { dataEmprestimo: 'desc' },
      });

      return emprestimos.filter((f) => f.dataDevolucao === null);
    } catch (error) {
      throw error instanceof HttpException
        ? error
        : new InternalServerErrorException('Erro ao buscar empréstimos.');
    }
  }

  async getAllEmprestimosByMembroAtraso(matricula: string) {
    try {
      const emprestimos = await this.prisma.emprestimo.findMany({
        where: {
          membro: { matricula },
          dataPrevista: { lt: new Date() },
          dataDevolucao: null,
        },
        include: {
          exemplar: { include: { livro: true } },
          multa: true,
          membro: { include: { usuario: { omit: { senha: true } } } },
        },
        orderBy: { dataEmprestimo: 'desc' },
      });

      return emprestimos;
    } catch (error) {
      throw error instanceof HttpException
        ? error
        : new InternalServerErrorException('Erro ao buscar empréstimos.');
    }
  }

  async getAllEmprestimosByMembroHistorico(matricula: string) {
    try {
      const historico = await this.prisma.emprestimo.findMany({
        where: { membro: { matricula } },
        orderBy: { dataDevolucao: 'desc' },
        include: {
          membro: {
            include: { usuario: { select: { nome: true, email: true } } },
          },
          exemplar: { include: { livro: true } },
          multa: true,
        },
      });

      return historico.filter((f) => f.dataDevolucao !== null);
    } catch (error) {
      throw error instanceof HttpException
        ? error
        : new InternalServerErrorException('Erro ao buscar empréstimos.');
    }
  }

  async totalEmprestimosAtivos() {
    try {
      const totalEmprestimos = await this.prisma.emprestimo.count({
        where: { dataDevolucao: null },
      });

      return { totalEmprestimos };
    } catch (error) {
      throw error instanceof HttpException
        ? error
        : new InternalServerErrorException();
    }
  }

  async totalEmprestimosEmAtraso() {
    try {
      const data = new Date();
      data.setDate(data.getDate());

      const totalEmprestimos = await this.prisma.emprestimo.count({
        where: { dataPrevista: { lt: data }, dataDevolucao: null },
      });

      return { totalEmprestimos };
    } catch (error) {
      throw error instanceof HttpException
        ? error
        : new InternalServerErrorException();
    }
  }

  async returnEmprestimo(
    emprestimoId: number,
  ): Promise<{ message: string; multa: number }> {
    try {
      let valorMulta = 0;

      await this.prisma.$transaction(async (tx) => {
        const emprestimo = await tx.emprestimo.findUnique({
          where: { id: emprestimoId },
          include: { exemplar: { include: { livro: true } } },
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
          valorMulta = atrasoDias * 500;

          await tx.multa.create({
            data: {
              emprestimoId: emprestimo.id,
              valor: valorMulta,
            },
          });
        }

        const reservasAtivas = await tx.reserva.findMany({
          where: {
            livroId: emprestimo.exemplar.livroId,
            ativa: true,
          },
          orderBy: { posicao: 'asc' },
          include: { membro: { include: { usuario: true } } },
        });

        await tx.exemplar.update({
          where: { id: emprestimo.exemplarId },
          data: {
            status: StatusLivro.DISPONIVEL,
          },
        });

        if (reservasAtivas.length > 0) {
          const primeiraReserva = reservasAtivas[0];

          const dataLimite = new Date();
          dataLimite.setDate(dataLimite.getDate() + 2);

          await tx.reserva.update({
            where: { id: primeiraReserva.id },
            data: { paraData: dataLimite },
          });

          const dataFormatada = dataLimite.toLocaleString('pt-PT', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          });

          await tx.notificacao.create({
            data: {
              membroId: primeiraReserva.membroId,
              mensagem: `O livro "${emprestimo.exemplar.livro.titulo}" está disponível! Você tem até ${dataFormatada} para levantá-lo.`,
            },
          });
        }
      });

      return { message: 'Empréstimo devolvido com sucesso', multa: valorMulta };
    } catch (error) {
      throw error instanceof HttpException
        ? error
        : new InternalServerErrorException('Erro ao devolver empréstimo');
    }
  }

  // Renovar empréstimo
  async renovarEmprestimo(
    renovar: RenovarEmprestimoDto,
  ): Promise<{ message: string }> {
    try {
      const emprestimo = await this.prisma.emprestimo.findUnique({
        where: { id: renovar.emprestimoId },
        include: {
          membro: true,
          exemplar: { include: { livro: true } },
        },
      });
      if (!emprestimo) {
        throw new NotFoundException('Empréstimo não encontrado');
      }
      if (emprestimo.dataDevolucao) {
        throw new BadRequestException('Empréstimo já foi devolvido');
      }
      if (emprestimo.renovacoes >= 2) {
        throw new BadRequestException('Limite máximo de renovações atingido');
      }

      const reservaAtiva = await this.prisma.reserva.findFirst({
        where: {
          livroId: emprestimo.exemplar.livroId,
          ativa: true,
        },
        orderBy: { posicao: 'asc' },
      });

      if (reservaAtiva) {
        throw new BadRequestException(
          'Não é possível renovar o empréstimo, existe uma reserva ativa para este livro',
        );
      }

      const livro = emprestimo.exemplar.livro;
      const novaDataPrevista = new Date(emprestimo.dataPrevista);

      if (livro?.etiqueta === Etiqueta.BRANCO) {
        const diasAdicionais =
          emprestimo.membro.tipo === TipoMembro.PROFESSOR ? 15 : 5;
        novaDataPrevista.setDate(novaDataPrevista.getDate() + diasAdicionais);
      } else if (livro?.etiqueta === Etiqueta.AMARELO)
        novaDataPrevista.setDate(novaDataPrevista.getDate() + 1);
      else
        throw new BadRequestException(
          'Este tipo de livro não permite renovação.',
        );

      await this.prisma.emprestimo.update({
        where: { id: emprestimo.id },
        data: {
          dataPrevista: novaDataPrevista,
          renovacoes: { increment: 1 },
        },
      });

      return { message: 'Empréstimo renovado com sucesso' };
    } catch (error) {
      throw error instanceof HttpException
        ? error
        : new InternalServerErrorException('Erro ao renovar empréstimo');
    }
  }

  async eprestimos(membroId: number) {
    try {
      const emprestimos = await this.prisma.emprestimo.findMany({
        where: { membroId },
        include: {
          exemplar: {
            include: { livro: { include: { autor: true } } },
          },
          multa: true,
        },
        orderBy: { dataEmprestimo: 'desc' },
      });

      return emprestimos;
    } catch (error) {
      throw error instanceof HttpException
        ? error
        : new InternalServerErrorException();
    }
  }

  async pagarMultaEmprestimo(emprestimoId: number) {
    try {
      const multa = await this.prisma.multa.findUnique({
        where: { emprestimoId },
      });

      if (!multa) throw new BadRequestException();

      await this.prisma.multa.update({
        where: { emprestimoId },
        data: {
          paga: true,
        },
      });

      return { message: 'Multa pago.' };
    } catch (error) {
      throw error instanceof HttpException
        ? error
        : new InternalServerErrorException();
    }
  }
}
