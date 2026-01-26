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
        const membroExisted = await tx.membro.findUnique({
          where: { matricula: body.matricula },
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

        // verificar se ja tem o livro emprestado
        const emprestadoExiste = await this.prisma.emprestimo.findFirst({
          where: {
            membroId: membroExisted.id,
            livroId: body.livroId,
            dataDevolucao: null,
          },
        });

        if (emprestadoExiste?.dataPrevista) {
          throw new BadRequestException('Emprestimo ja existe');
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

        if (livro.quantidade <= 1) {
          throw new BadRequestException(
            `Empréstimo não permitido: este é o único exemplar disponível para consulta local.`,
          );
        }

        if (livro.status !== StatusLivro.DISPONIVEL) {
          throw new BadRequestException('Livro indisponível para empréstimo');
        }

        const dataPrevista = new Date();
        dataPrevista.setDate(dataPrevista.getDate() + 7); // Adiciona 7 dias para a data prevista de devolução

        await tx.emprestimo.create({
          data: {
            membroId: membroExisted.id,
            livroId: body.livroId,
            dataPrevista,
          },
        });

        const novaQuantidade = livro.quantidade - 1;

        await tx.livro.update({
          where: { id: body.livroId },
          data: {
            status:
              novaQuantidade === 1
                ? StatusLivro.EMPRESTADO
                : StatusLivro.DISPONIVEL,
            quantidade: novaQuantidade,
          },
        });

        await tx.historicoLeitura.create({
          data: {
            membroId: membroExisted.id,
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

  async getAllEmprestimos(): Promise<Emprestimo[]> {
    try {
      const emprestimos = await this.prisma.emprestimo.findMany({
        include: {
          membro: { include: { usuario: true } },
          livro: true,
          multa: true,
        },
        orderBy: { dataEmprestimo: 'desc' },
      });
      return emprestimos;
    } catch (error) {
      throw error instanceof HttpException
        ? error
        : new InternalServerErrorException('Erro ao buscar empréstimos');
    }
  }

  async getAllEmprestimosAtraso() {
    try {
      const emprestimos = await this.prisma.emprestimo.findMany({
        where: { dataPrevista: { lt: new Date() }, dataDevolucao: null },
        include: {
          livro: true,
          multa: true,
          membro: { include: { usuario: true } },
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

  async getAllEmprestimosByMembro(matricula: string) {
    try {
      const emprestimos = await this.prisma.emprestimo.findMany({
        where: { membro: { matricula } },
        include: {
          livro: true,
          multa: true,
          membro: { include: { usuario: true } },
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

  async getAllEmprestimosByMembroAtraso(matricula: string) {
    try {
      const emprestimos = await this.prisma.emprestimo.findMany({
        where: {
          membro: { matricula },
          dataPrevista: { lt: new Date() },
          dataDevolucao: null,
        },
        include: {
          livro: true,
          multa: true,
          membro: { include: { usuario: true } },
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

  async returnEmprestimo(emprestimoId: number): Promise<{ message: string }> {
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
          include: { membro: { include: { usuario: true } } },
        });

        const reservaAtivaExists =
          reservaAtiva.length > 0
            ? StatusLivro.RESERVADO
            : StatusLivro.DISPONIVEL;

        if (reservaAtiva.length > 0) {
          const primeiraReserva = reservaAtiva[0];
          await tx.notificacao.create({
            data: {
              membroId: primeiraReserva.membroId,
              mensagem: `O livro "${emprestimo.livro.titulo}" que você reservou está agora disponível para levantamento.`,
            },
          });
        }

        await tx.livro.update({
          where: { id: emprestimo.livroId },
          data: {
            quantidade: { increment: 1 },
            status: reservaAtivaExists,
          },
        });
      });

      return { message: 'Empréstimo devolvido com sucesso' };
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
          livroId: emprestimo.livroId,
          ativa: true,
        },
        orderBy: { posicao: 'asc' },
      });

      if (reservaAtiva) {
        throw new BadRequestException(
          'Não é possível renovar o empréstimo, existe uma reserva ativa para este livro',
        );
      }

      const novaDataPrevista = new Date(emprestimo.dataPrevista);
      novaDataPrevista.setDate(novaDataPrevista.getDate() + 7);

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
        include: { livro: { include: { autor: true } }, multa: true },
      });

      return emprestimos;
    } catch (error) {
      throw error instanceof HttpException
        ? error
        : new InternalServerErrorException();
    }
  }
}
