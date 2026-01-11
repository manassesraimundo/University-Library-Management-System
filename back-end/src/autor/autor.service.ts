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

  async createAutor(autorDto: AutorDto): Promise<{ message: string }> {
    try {
      await this.prisma.autor.create({
        data: autorDto,
      });

      return { message: 'Autor criado com sucesso' };
    } catch (error) {
      throw error instanceof HttpException
        ? error
        : new InternalServerErrorException('Erro ao criar autor');
    }
  }

  async getAutores(): Promise<Autor[]> {
    try {
      const autores = await this.prisma.autor.findMany({
        include: { livros: true },
      });

      return autores;
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
