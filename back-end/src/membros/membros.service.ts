import {
  BadRequestException,
  ConflictException,
  HttpException,
  Injectable,
  InternalServerErrorException,
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
      const existMembro = await this.deleteMembroByMatricula(body.matricula);

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

  async getAllMembros(status: boolean): Promise<Omit<Membro, 'criadoEm'>[]> {
    try {
      const membros = await this.prisma.membro.findMany({
        where: { ativo: status },
        include: { usuario: { select: { id: true, nome: true, email: true } } },
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
        include: { usuario: { select: { id: true, nome: true, email: true } } },
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
        include: { usuario: { select: { nome: true } } },
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
      const membro = await this.getMembroByMatricula(matricula);

      if (!membro) throw new BadRequestException('Membro não encontrado.');

      await this.prisma.membro.delete({
        where: { matricula },
      });

      return { message: 'Membro deletado com sucesso.' };
    } catch (error) {
      throw error instanceof HttpException
        ? error
        : new InternalServerErrorException('Erro ao deletar membro.');
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
}
