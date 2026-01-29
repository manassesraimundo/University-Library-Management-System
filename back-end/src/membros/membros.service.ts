import {
  BadRequestException,
  ConflictException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateMembroDto } from './dto/membro.dto';
import { Membro, Prisma, TipoMembro } from 'src/generated/prisma/client';

type MembroComUsuario = Prisma.MembroGetPayload<{
  include: { usuario: { select: { nome: true } } };
}>;

@Injectable()
export class MembrosService {
  constructor(private readonly prisma: PrismaService) {}

  async createMembro(body: CreateMembroDto): Promise<{ message: string }> {
    this.validarRegrasMatricula(body.matricula);

    try {
      const existMembro = await this.prisma.membro.findUnique({
        where: { matricula: body.matricula },
      });

      if (existMembro) throw new ConflictException('Matrícula já cadastrada.');

      await this.prisma.membro.create({
        data: {
          matricula: body.matricula,
          tipo: TipoMembro[body.tipo.toUpperCase() as keyof typeof TipoMembro],
        },
      });

      return { message: 'Membro cadastrado com sucesso.' };
    } catch (error) {
      throw error instanceof HttpException
        ? error
        : new InternalServerErrorException('Erro ao cadastrar membro.');
    }
  }

  async getAllMembros(status: boolean): Promise<Membro[]> {
    try {
      const membros = await this.prisma.membro.findMany({
        where: { ativo: status },
        include: {
          usuario: { select: { id: true, nome: true, email: true } },
        },
        orderBy: { criadoEm: 'desc' },
      });

      return membros;
    } catch (error) {
      throw error instanceof HttpException
        ? error
        : new InternalServerErrorException('Erro ao buscar membros.');
    }
  }

  async getMembroByMatricula(matricula: string): Promise<Membro> {
    this.validarRegrasMatricula(matricula);

    try {
      const membro = await this.prisma.membro.findUnique({
        where: { matricula },
        include: {
          usuario: { select: { id: true, nome: true, email: true } },
          reservas: {
            where: { ativa: true },
            include: { livro: true },
          },
          emprestimos: {
            where: { dataDevolucao: null },
            include: { livro: true, multa: { where: { paga: false } } },
          },
          historico: true,
        },
      });

      if (!membro) throw new BadRequestException('Membro não encontrado.');

      return membro;
    } catch (error) {
      throw error instanceof HttpException
        ? error
        : new InternalServerErrorException('Erro ao buscar membro.');
    }
  }

  async getMembroById(membroId: number): Promise<MembroComUsuario | null> {
    try {
      const membro = await this.prisma.membro.findUnique({
        where: { id: membroId },
        include: { usuario: { select: { nome: true, email: true, id: true } } },
      });

      if (membro) return membro;

      return null;
    } catch (error) {
      throw error instanceof HttpException
        ? error
        : new InternalServerErrorException('');
    }
  }

  async updateMembroStatus(
    matricula: string,
    status: boolean,
  ): Promise<{ message: string }> {
    this.validarRegrasMatricula(matricula);

    try {
      const membro = await this.getMembroByMatricula(matricula);

      if (!membro) throw new BadRequestException('Membro não encontrado.');

      await this.prisma.membro.update({
        where: { matricula },
        data: { ativo: status },
      });

      return { message: 'Status do membro atualizado com sucesso.' };
    } catch (error) {
      throw error instanceof HttpException
        ? error
        : new InternalServerErrorException(
            'Erro ao atualizar status do membro.',
          );
    }
  }

  async deleteMembroByMatricula(
    matricula: string,
  ): Promise<{ message: string }> {
    this.validarRegrasMatricula(matricula);

    try {
      const membro = await this.prisma.membro.findUnique({
        where: { matricula },
      });

      if (!membro) throw new BadRequestException('Membro não encontrado.');

      await this.prisma.membro.delete({
        where: { matricula },
      });

      return { message: 'Membro deletado com sucesso.' };
    } catch (error) {
      throw error instanceof HttpException
        ? error
        : new InternalServerErrorException('' + error.message);
    }
  }

  private validarRegrasMatricula(matricula: string): void {
    if (matricula.length !== 8)
      throw new BadRequestException(
        'A matrícula deve ter exatamente 8 caracteres.',
      );

    const validateData = matricula.slice(0, 4);
    if (
      Number(validateData) < 2011 ||
      Number(validateData) >= new Date().getFullYear()
    )
      throw new BadRequestException('Ano da matrícula inválido.');
  }

  /*
    Obter dados do membro logado
  */
  async membroLogado(matricula: string) {
    try {
      const membro = await this.prisma.membro.findUnique({
        where: { matricula },
        include: {
          usuario: { select: { nome: true, email: true, id: true } },
          historico: true,
          reservas: { where: { ativa: true } },
        },
      });

      if (!membro) throw new NotFoundException('');

      return membro;
    } catch (error) {
      throw error instanceof HttpException
        ? error
        : new InternalServerErrorException();
    }
  }

  async meuPanel(matricula: string) {
    try {
      const membro = await this.prisma.membro.findUnique({
        where: { matricula },
        include: {
          reservas: {
            where: { ativa: true },
            include: { livro: true },
            orderBy: { criadaEm: 'desc' },
          },
          usuario: {
            select: { nome: true, email: true, ativo: true, role: true },
          },
          emprestimos: {
            where: { dataDevolucao: null },
            include: { livro: true, multa: { where: { paga: false } } },
            orderBy: { dataEmprestimo: 'desc' },
          },
          historico: true,
        },
      });

      if (!membro) throw new NotFoundException('');

      return membro;
    } catch (error) {
      throw error instanceof HttpException
        ? error
        : new InternalServerErrorException();
    }
  }

  async vincularUsuarioMembro(
    membroId: number,
    body: { nome: string; email: string },
  ): Promise<{ message: string }> {
    try {
      await this.prisma.$transaction(async (tx) => {
        const membro = await tx.membro.findUnique({
          where: { id: membroId },
        });

        if (!membro) throw new NotFoundException('Membro não encontrado.');

        if (membro.usuarioId)
          throw new BadRequestException(
            'Membro já possui um usuário vinculado.',
          );

        const usuarioExistente = await tx.usuario.findUnique({
          where: { email: body.email },
        });

        if (usuarioExistente)
          throw new ConflictException('Email já está em uso.');

        const novoUsuario = await tx.usuario.create({
          data: {
            nome: body.nome,
            email: body.email,
            ativo: true,
            role: 'MEMBRO',
            membro: { connect: { id: membroId } },
          },
        });

        await tx.membro.update({
          where: { id: membroId },
          data: { usuarioId: novoUsuario.id },
        });
      });

      return { message: 'Usuário vinculado ao membro com sucesso.' };
    } catch (error) {
      throw error instanceof HttpException
        ? error
        : new InternalServerErrorException(
            'Erro ao vincular usuário ao membro.',
          );
    }
  }

  async membroPerfilUpdate(
    matricula: string,
    body: { nome?: string; email?: string },
  ) {
    try {
      const membro = await this.prisma.membro.findUnique({
        where: { matricula },
        include: { usuario: true },
      });

      if (!membro) throw new NotFoundException('Membro não encontrado.');

      const updateData: any = {};

      if (body.nome) updateData.nome = body.nome;

      if (Object.keys(updateData).length === 0)
        throw new BadRequestException('Nenhum dado para atualizar.');

      if (membro.usuarioId) {
        await this.prisma.usuario.update({
          where: { id: membro.usuarioId },
          data: updateData,
        });
      }

      const membroAtualizado = await this.prisma.membro.findUnique({
        where: { matricula },
        include: { usuario: true },
      });

      return membroAtualizado;
    } catch (error) {
      throw error instanceof HttpException
        ? error
        : new InternalServerErrorException(
            'Erro ao atualizar perfil do membro.',
          );
    }
  }

  async getNotificacoesMembro(membroId: number): Promise<object> {
    try {
      const notificacoes = await this.prisma.notificacao.findMany({
        where: { membroId },
        orderBy: { criadaEm: 'desc' },
      });

      return notificacoes;
    } catch (error) {
      throw error instanceof HttpException
        ? error
        : new InternalServerErrorException(
            'Erro ao buscar notificações do membro.',
          );
    }
  }

  async markNotificacaoAsRead(id: string): Promise<{ message: string }> {
    try {
      const notificacao = await this.prisma.notificacao.findUnique({
        where: { id: Number(id) },
      });

      if (!notificacao)
        throw new NotFoundException('Notificação não encontrada.');

      await this.prisma.notificacao.update({
        where: { id: Number(id) },
        data: { lida: true },
      });

      return { message: 'Notificação marcada como lida com sucesso.' };
    } catch (error) {
      throw error instanceof HttpException
        ? error
        : new InternalServerErrorException(
            'Erro ao marcar notificação como lida.',
          );
    }
  }

  async markAllNotificacoesAsRead(
    membroId: number,
  ): Promise<{ message: string }> {
    try {
      await this.prisma.notificacao.updateMany({
        where: { membroId, lida: false },
        data: { lida: true },
      });

      return {
        message: 'Todas as notificações marcadas como lidas com sucesso.',
      };
    } catch (error) {
      throw error instanceof HttpException
        ? error
        : new InternalServerErrorException(
            'Erro ao marcar todas as notificações como lidas.',
          );
    }
  }

  async clearNotificacoesHistory(
    membroId: number,
  ): Promise<{ message: string }> {
    try {
      await this.prisma.notificacao.deleteMany({
        where: { membroId, lida: true },
      });

      return { message: 'Histórico de notificações limpo com sucesso.' };
    } catch (error) {
      throw error instanceof HttpException
        ? error
        : new InternalServerErrorException(
            'Erro ao limpar histórico de notificações.',
          );
    }
  }
}
