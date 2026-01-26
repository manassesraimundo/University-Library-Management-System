import {
  BadRequestException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UsuarioAuthDto } from './dto/usuario.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async usuarioLogin(body: UsuarioAuthDto) {
    try {
      const usuario = await this.prisma.usuario.findUnique({
        where: { email: body.email },
        include: { membro: true },
      });
      if (!usuario)
        throw new UnauthorizedException('E-mail ou senha inválidos');

      const machSenha = await bcrypt.compare(
        body.senha,
        usuario.senha as string,
      );
      if (!machSenha)
        throw new UnauthorizedException('E-mail ou senha inválidos');

      if (usuario.role === 'MEMBRO') {
        if (!usuario.membro) {
          throw new BadRequestException(
            'Usuário com perfil de membro não possui matrícula associada.',
          );
        }
        return await this.membroLogin(usuario.membro.matricula);
      }

      const payload = {
        sub: usuario.id,
        role: usuario.role,
        email: usuario.email,
      };
      const access_token = await this.jwtService.signAsync(payload, {
        algorithm: 'HS256',
        expiresIn: '1h',
      });

      return { access_token, role: usuario.role };
    } catch (error) {
      throw error instanceof HttpException
        ? error
        : new InternalServerErrorException(error.message);
    }
  }

  async membroLogin(matricula: string) {
    try {
      const membro = await this.prisma.membro.findUnique({
        where: { matricula },
      });

      if (!membro) throw new UnauthorizedException('');

      const payload = {
        sub: membro.id,
        matricula,
        role: 'MEMBRO',
      };
      const access_token = await this.jwtService.signAsync(payload, {
        algorithm: 'HS256',
        expiresIn: '1h',
      });

      return { access_token, role: 'MEMBRO' };
    } catch (error) {
      throw error instanceof HttpException
        ? error
        : new InternalServerErrorException(error.message);
    }
  }

  async membroAutenticado(matricula: string) {
    try {
      const membro = await this.prisma.membro.findUnique({
        where: { matricula },
        // select: { id: true, matricula: true, tipo: true },
        include: {
          usuario: { select: { nome: true, email: true, role: true } },
        },
      });

      if (!membro) throw new NotFoundException();

      return membro;
    } catch (error) {
      throw error instanceof HttpException
        ? error
        : new InternalServerErrorException(error.message);
    }
  }

  async usuarioAutenticado(id: number) {
    try {
      const usuario = await this.prisma.usuario.findUnique({
        where: { id },
        omit: { senha: true, criadoEm: true },
        include: { membro: { select: { matricula: true, tipo: true } } },
      });

      if (!usuario) throw new NotFoundException();

      return usuario;
    } catch (error) {
      throw error instanceof HttpException
        ? error
        : new InternalServerErrorException(error.message);
    }
  }
}
