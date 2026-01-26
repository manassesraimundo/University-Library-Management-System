import {
  ConflictException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { Role } from 'src/generated/prisma/enums';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsuariosService {
  constructor(private readonly prisma: PrismaService) {}

  async createUsuario(body: CreateUsuarioDto): Promise<{ message: string }> {
    try {
      const userExited = await this.prisma.usuario.findUnique({
        where: { email: body.email },
      });

      if (userExited) throw new ConflictException('Email já cadastrado');

      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(body.senha, salt);

      await this.prisma.usuario.create({
        data: {
          email: body.email,
          nome: body.nome,
          role: body.role || Role.MEMBRO,
          senha: passwordHash,
        },
      });

      return { message: 'Usuário criado com sucesso!' };
    } catch (error) {
      throw error instanceof HttpException
        ? error
        : new InternalServerErrorException('Erro ao criar usuário');
    }
  }

  async getAllUsuario(status: boolean) {
    try {
      const usuarios = await this.prisma.usuario.findMany({
        where: { ativo: status },
        orderBy: { nome: 'asc' },
      });

      return usuarios;
    } catch (error) {
      throw error instanceof HttpException
        ? error
        : new InternalServerErrorException('Erro ao caregar usuários');
    }
  }

  async updateStatusUsuario(
    id: number,
    status: boolean,
  ): Promise<{ message: string }> {
    try {
      const usuario = await this.prisma.usuario.findUnique({
        where: { id },
      });

      if (!usuario) throw new NotFoundException('Usuário não encontrado!');

      await this.prisma.usuario.update({
        where: { id },
        data: { ativo: status },
      });

      return { message: 'Status do usuário atualizado com sucesso!' };
    } catch (error) {
      throw error instanceof HttpException
        ? error
        : new InternalServerErrorException(
            'Erro ao atualizar status do usuário',
          );
    }
  }

  async updatePermincoesUsuario(
    id: number,
    role: Role,
  ): Promise<{ message: string }> {
    try {
      const usuario = await this.prisma.usuario.findUnique({
        where: { id },
      });

      if (!usuario) throw new NotFoundException('Usuário não encontrado!');

      await this.prisma.usuario.update({
        where: { id },
        data: { role },
      });

      return { message: 'Permissões do usuário atualizadas com sucesso!' };
    } catch (error) {
      throw error instanceof HttpException
        ? error
        : new InternalServerErrorException(
            'Erro ao atualizar permissões do usuário',
          );
    }
  }

  async getUsuariosByNome(nome: string) {
    try {
      const usuarios = await this.prisma.usuario.findMany({
        where: {
          nome: {
            contains: nome,
          },
        },
        orderBy: { nome: 'asc' },
      });

      return usuarios;
    } catch (error) {
      throw error instanceof HttpException
        ? error
        : new InternalServerErrorException('Erro ao caregar usuários');
    }
  }

  async getUsuariosByEmail(email: string) {
    try {
      const usuarios = await this.prisma.usuario.findUnique({
        where: {
          email: email,
        },
      });

      if (!usuarios) {
        throw new NotFoundException('Usuário não encontrado!');
      }

      return usuarios;
    } catch (error) {
      throw error instanceof HttpException
        ? error
        : new InternalServerErrorException('Erro ao caregar usuários');
    }
  }

  async getUsuarioById(id: number) {
    try {
      const usuario = await this.prisma.usuario.findUnique({
        where: { id },
        select: {
          nome: true,
          email: true,
          role: true,
          membro: {
            select: {
              matricula: true,
              tipo: true,
              ativo: true,
            },
          },
        },
      });

      if (!usuario) throw new NotFoundException('Usuário não encontrado!');

      return usuario;
    } catch (error) {
      throw error instanceof HttpException
        ? error
        : new InternalServerErrorException('Erro ao buscar perfil do usuário');
    }
  }
}
