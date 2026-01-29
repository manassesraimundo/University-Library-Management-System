import {
  BadRequestException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateLivroDto } from './dto/livro.dto';
import { Etiqueta, Livro, StatusLivro } from 'src/generated/prisma/client';

@Injectable()
export class LivrosService {
  constructor(private prisma: PrismaService) {}

  private getPage(page?: number, limit?: number) {
    const take = Math.min(Number(limit), 50);
    const skip = (Number(page) - 1) * take;

    return { skip, take };
  }

  async getAllLivros(
    status: string,
    etiqueta?: string,
    page?: number,
    limit?: number,
    titulo?: string,
  ): Promise<Livro[]> {
    try {
      const { skip, take } = this.getPage(page, limit);

      if (titulo) {
        const livros = await this.prisma.livro.findMany({
          where: {
            titulo: { contains: titulo },
            status:
              StatusLivro[status.toUpperCase() as keyof typeof StatusLivro],
            etiqueta:
              Etiqueta[etiqueta?.toUpperCase() as keyof typeof Etiqueta],
          },

          orderBy: { titulo: 'asc' },
          include: {
            autor: { select: { nome: true } },
            categoria: { select: { nome: true } },
            _count: {
              select: {
                reservas: {
                  where: { ativa: true },
                },
                emprestimos: { where: { dataDevolucao: null } },
              },
            },
          },
          skip,
          take,
        });

        return livros;
      }

      const livros = await this.prisma.livro.findMany({
        where: {
          status: StatusLivro[status.toUpperCase() as keyof typeof StatusLivro],
          etiqueta: Etiqueta[etiqueta?.toUpperCase() as keyof typeof Etiqueta],
        },

        orderBy: { titulo: 'asc' },
        include: {
          autor: { select: { nome: true } },
          categoria: { select: { nome: true } },
          _count: {
            select: {
              reservas: {
                where: { ativa: true },
              },
              emprestimos: { where: { dataDevolucao: null } },
            },
          },
        },
        skip,
        take,
      });

      return livros;
    } catch (error) {
      throw error instanceof HttpException
        ? error
        : new InternalServerErrorException();
    }
  }

  async getTotalDeLivro() {
    try {
      const totalLivros = await this.prisma.livro.count();

      return { totalLivros };
    } catch (error) {
      throw error instanceof HttpException
        ? error
        : new InternalServerErrorException();
    }
  }

  async getLivrosByCategory(
    categoria: string,
    page: number,
    limit: number,
  ): Promise<Livro[]> {
    const { skip, take } = this.getPage(page, limit);
    try {
      const livrosByCategory = await this.prisma.livro.findMany({
        where: { categoria: { nome: categoria } },
        include: { autor: { select: { nome: true } }, categoria: true },
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

  async getLivroById(id: number): Promise<Livro> {
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
      await this.prisma.$transaction(async (tx) => {
        if (body.isbn) {
          const livro = await this.prisma.livro.findUnique({
            where: { isbn: body.isbn },
          });

          if (livro)
            throw new BadRequestException(
              `Já existe um livro com este isbn \'${body.isbn}\'`,
            );
        }

        let autor;
        let categoria;

        if (body.nomeAutor) {
          autor = await tx.autor.create({
            data: { nome: body.nomeAutor },
          });
        } else {
          autor = await this.prisma.autor.findUnique({
            where: { id: body.autorId },
          });
          if (!autor) throw new NotFoundException(`Autor não existe!`);
        }

        if (body.nomeCategoria) {
          categoria = await tx.categoria.create({
            data: { nome: body.nomeCategoria },
          });
        } else {
          categoria = await this.prisma.categoria.findUnique({
            where: { id: body.categoriaId },
          });
          if (!categoria) throw new NotFoundException('Categoria não existe!');
        }

        // Criar um novo Livro
        await this.prisma.livro.create({
          data: {
            titulo: body.titulo,
            autorId: autor.id,
            editora: body.editora,
            categoriaId: categoria.id,
            status: body.status
              ? StatusLivro[body.status.toUpperCase()]
              : undefined,
            etiqueta: Etiqueta[body.etiqueta.toUpperCase()],
            quantidade: body.quantidade,
          },
        });
      });

      return { message: `Livro \'${body.titulo}\' criado com sucesso!` };
    } catch (error) {
      throw error instanceof HttpException
        ? error
        : new InternalServerErrorException();
    }
  }
}
