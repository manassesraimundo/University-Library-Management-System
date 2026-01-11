import {
  BadRequestException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateLivroDto } from './dto/livro.dto';
import { Livro, StatusLivro } from 'src/generated/prisma/client';

@Injectable()
export class LivrosService {
  constructor(private prisma: PrismaService) {}

  private getPage(page = 1, limit = 10) {
    const take = Math.min(Number(limit), 50);
    const skip = (Number(page) - 1) * take;

    return { skip, take };
  }

  async findAllLivros(
    status: string,
    page = 1,
    limit = 10,
  ): Promise<Omit<Livro, 'criadoEm'>[]> {
    const { skip, take } = this.getPage(page, limit);

    try {
      const livros = await this.prisma.livro.findMany({
        where: { status: StatusLivro[status.toUpperCase()] },
        // skip,
        // take,
        orderBy: { titulo: 'asc' },
        include: { autor: { select: { nome: true } } },
      });

      return livros;
    } catch (error) {
      throw error instanceof HttpException
        ? error
        : new InternalServerErrorException();
    }
  }

  async findLivrosByCategory(
    categoria: string,
    page: number,
    limit: number,
  ): Promise<Livro[]> {
    const { skip, take } = this.getPage(page, limit);
    try {
      const livrosByCategory = await this.prisma.livro.findMany({
        where: { categoria: { nome: categoria } },
        include: { autor: { select: { nome: true } } },
        skip,
        take,
      });

      if (!livrosByCategory) new NotFoundException('Categoria não encontrada');

      return livrosByCategory;
    } catch (error) {
      throw error instanceof HttpException
        ? error
        : new InternalServerErrorException(
            'Erro ao buscar livros por categoria',
          );
    }
  }

  async findLivroById(id: number): Promise<Livro> {
    try {
      const livro = await this.prisma.livro.findUnique({
        where: { id },
        include: { autor: true, categoria: true, emprestimos: true },
      });

      if (!livro) throw new NotFoundException(`Livro não encontrado!`);

      return livro;
    } catch (error) {
      throw error instanceof HttpException
        ? error
        : new InternalServerErrorException('Erro ao buscar livro por ID');
    }
  }

  // Criacao do livro
  async createLivro(body: CreateLivroDto): Promise<{ message: string }> {
    try {
      if (body.isbn) {
        const livro = await this.prisma.livro.findUnique({
          where: { isbn: body.isbn },
        });

        if (livro)
          throw new BadRequestException(
            `Já existe um livro com este isbn \'${body.isbn}\'`,
          );
      }

      // Verficar se o ID do autor existe
      const findAuthor = await this.prisma.autor.findUnique({
        where: { id: body.autorId },
      });
      if (!findAuthor) throw new NotFoundException(`Autor não existe!`);

      const findCategory = await this.prisma.categoria.findUnique({
        where: { id: body.categoriaId },
      });
      if (!findCategory) throw new NotFoundException('Categoria não existe!');

      // Criar um novo Livro
      await this.prisma.livro.create({
        data: {
          titulo: body.titulo,
          autorId: body.autorId,
          editora: body.editora,
          categoriaId: body.categoriaId,
          status: body.status
            ? StatusLivro[body.status.toUpperCase()]
            : undefined,
        },
      });

      return { message: `Livro \'${body.titulo}\' criado com sucesso!` };
    } catch (error) {
      throw error instanceof HttpException
        ? error
        : new InternalServerErrorException();
    }
  }
}
