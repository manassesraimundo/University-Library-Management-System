import {
  HttpException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AutorDto } from './dto/autor.dto';
import { Autor } from 'src/generated/prisma/client';

@Injectable()
export class AutorService {
  constructor(private prisma: PrismaService) {}

  async createAutor(
    autorDto: AutorDto,
  ): Promise<{ message: string; id: number }> {
    try {
      const autor = await this.prisma.autor.create({
        data: { nome: autorDto.nome },
      });

      return { message: 'Autor criado com sucesso', id: autor.id };
    } catch (error) {
      throw error instanceof HttpException
        ? error
        : new InternalServerErrorException('Erro ao criar autor');
    }
  }

  async getAutores(nomeAutor?: string): Promise<Autor[]> {
    try {
      if (!nomeAutor) {
        const autores = await this.prisma.autor.findMany({
          include: { livros: true },
          orderBy: { nome: 'asc' },
        });

        return autores;
      } else {
        const autores = await this.prisma.autor.findMany({
          where: { nome: { contains: nomeAutor } },
          include: { livros: true },
          orderBy: { nome: 'asc' },
        });

        return autores;
      }
    } catch (error) {
      throw error instanceof HttpException
        ? error
        : new InternalServerErrorException('Erro ao listar autores');
    }
  }

  async deleteAutor(id: number): Promise<{ message: string }> {
    try {
      await this.prisma.autor.delete({
        where: { id },
      });

      return { message: 'Autor deletado com sucesso' };
    } catch (error) {
      throw error instanceof HttpException
        ? error
        : new InternalServerErrorException('Erro ao deletar autor');
    }
  }
}
