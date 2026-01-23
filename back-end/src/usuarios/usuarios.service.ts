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
import { Usuario } from 'src/generated/prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsuariosService {
  constructor(private readonly prisma: PrismaService) { }

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

  async getUsuarioById(
    id: number,
  ) {
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
              ativo: true
            }
          }
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
