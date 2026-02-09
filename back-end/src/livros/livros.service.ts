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
    status?: string, // Agora opcional, pois filtra exemplares
    etiqueta?: string,
    page?: number,
    limit?: number,
    titulo?: string,
  ): Promise<any[]> {
    try {
      const { skip, take } = this.getPage(page, limit);
      const where: any = {};

      if (titulo) {
        where.titulo = { contains: titulo };
      }
      if (etiqueta) {
        where.etiqueta =
          Etiqueta[etiqueta.toUpperCase() as keyof typeof Etiqueta];
      }
      if (status) {
        where.exemplares = {
          some: {
            status:
              StatusLivro[status.toUpperCase() as keyof typeof StatusLivro],
          },
        };
      }

      const livros = await this.prisma.livro.findMany({
        where,
        orderBy: { titulo: 'asc' },
        include: {
          autor: { select: { nome: true } },
          categoria: { select: { nome: true } },
          _count: {
            select: {
              reservas: { where: { ativa: true } },
              exemplares: true,
            },
          },
          exemplares: {
            where: { status: StatusLivro.DISPONIVEL },
            select: { id: true, codigoBarras: true },
          },
        },
        skip,
        take,
      });

      const livrosVistos = new Set();
      return livros.reduce((acc: any, r) => {
        const livro = r;
        if (!livrosVistos.has(livro.id)) {
          livrosVistos.add(livro.id);
          acc.push({
            id: r.id,
            titulo: livro.titulo,
            categoria: livro.categoria.nome,
            etiqueta: livro.etiqueta,
            quantidadeExemplares: livro._count.exemplares,
            quantidadeDisponiveis: livro.exemplares.length,
            quantidadeReservado: livro._count.reservas,
          });
        }
        return acc;
      }, []);
    } catch (error) {
      throw error instanceof HttpException
        ? error
        : new InternalServerErrorException('Erro ao listar livros');
    }
  }

  async getAllLivros2(
    status?: string,
    etiqueta?: string,
    page?: number,
    limit?: number,
    titulo?: string,
  ): Promise<any[]> {
    try {
      const { skip, take } = this.getPage(page, limit);
      const where: any = {};

      if (titulo) {
        where.titulo = { contains: titulo };
      }
      if (etiqueta) {
        where.etiqueta =
          Etiqueta[etiqueta.toUpperCase() as keyof typeof Etiqueta];
      }
      if (status) {
        where.exemplares = {
          some: {
            status:
              StatusLivro[status.toUpperCase() as keyof typeof StatusLivro],
          },
        };
      }

      const livros = await this.prisma.livro.findMany({
        where,
        orderBy: { titulo: 'asc' },
        include: {
          autor: { select: { nome: true } },
          categoria: { select: { nome: true } },
          _count: {
            select: {
              reservas: { where: { ativa: true } },
              exemplares: { where: { status: StatusLivro.DISPONIVEL } },
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
        : new InternalServerErrorException('Erro ao listar livros');
    }
  }

  async getExemplaresByLivro(livroId: number) {
    try {
      const exemplares = await this.prisma.exemplar.findMany({
        where: { livroId: livroId, status: StatusLivro.DISPONIVEL },
        select: { id: true, codigoBarras: true },
      });

      return exemplares;
    } catch (error) {
      throw error instanceof HttpException
        ? error
        : new InternalServerErrorException('Erro ao listar exemplares');
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
    etiqueta: string,
    page: number,
    limit: number,
  ): Promise<Livro[]> {
    const { skip, take } = this.getPage(page, limit);
    try {
      const livrosByCategory = await this.prisma.livro.findMany({
        where: {
          categoria: { nome: categoria },
          etiqueta: Etiqueta[etiqueta.toUpperCase() as keyof typeof Etiqueta],
        },
        include: {
          autor: {
            select: {
              nome: true,
            },
          },
          categoria: true,
          _count: {
            select: {
              reservas: { where: { ativa: true } },
              exemplares: true,
            },
          },
          exemplares: {
            where: { status: StatusLivro.DISPONIVEL },
          },
        },
        skip,
        take,
      });

      if (!livrosByCategory) new NotFoundException('Categoria não encontrada');

      const livrosVistos = new Set();
      return livrosByCategory.reduce((acc: any, r) => {
        const livro = r;
        if (!livrosVistos.has(livro.id)) {
          livrosVistos.add(livro.id);
          acc.push({
            id: r.id,
            titulo: livro.titulo,
            categoria: livro.categoria.nome,
            etiqueta: livro.etiqueta,
            quantidadeExemplares: livro._count.exemplares,
            quantidadeDisponiveis: livro.exemplares.length,
            quantidadeReservado: livro._count.reservas,
          });
        }
        return acc;
      }, []);
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
        include: {
          autor: true,
          categoria: true,
          _count: {
            select: {
              exemplares: { where: { status: StatusLivro.DISPONIVEL } },
            },
          },
          exemplares: { include: { emprestimos: true } },
        },
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
          const livro = await tx.livro.findUnique({
            where: { isbn: body.isbn },
          });

          if (livro)
            throw new BadRequestException(
              `Já existe um livro com este isbn \'${body.isbn}\'`,
            );
        }

        let autorId = body.autorId as number;
        let categoriaId = body.categoriaId as number;

        if (body.nomeAutor) {
          const novoAutor = await tx.autor.create({
            data: { nome: body.nomeAutor },
          });
          autorId = novoAutor.id;
        }

        if (body.nomeCategoria) {
          const novaCategoria = await tx.categoria.create({
            data: { nome: body.nomeCategoria },
          });
          categoriaId = novaCategoria.id;
        }

        const exemplaresParaCriar = Array.from({ length: body.quantidade }).map(
          (_, index) => ({
            codigoBarras: `${body.isbn || 'GEN'}-${Date.now()}-${index + 1}`,
            status: StatusLivro.DISPONIVEL,
            observacoes: 'Novo exemplar adquirido',
          }),
        );

        // Criar um novo Livro
        await tx.livro.create({
          data: {
            titulo: body.titulo,
            isbn: body.isbn || undefined,
            editora: body.editora,
            etiqueta:
              Etiqueta[body.etiqueta.toUpperCase() as keyof typeof Etiqueta],
            autorId: autorId,
            categoriaId: categoriaId,
            exemplares: {
              create: exemplaresParaCriar,
            },
          },
        });
      });

      return { message: `Livro \'${body.titulo}\' criado com sucesso!` };
    } catch (error) {
      throw error instanceof HttpException
        ? error
        : new InternalServerErrorException(error.message);
    }
  }

  async getAllReservas(etiqueta?: string): Promise<any[]> {
    try {
      const where: any = { ativa: true };

      if (etiqueta) {
        where.livro = {
          etiqueta: Etiqueta[etiqueta.toUpperCase() as keyof typeof Etiqueta],
        };
      }

      const reservas = await this.prisma.reserva.findMany({
        where,
        include: {
          livro: {
            include: {
              categoria: true,
              _count: {
                select: {
                  exemplares: true,
                  reservas: { where: { ativa: true } },
                },
              },
              exemplares: {
                where: { status: StatusLivro.DISPONIVEL },
                select: { id: true },
              },
            },
          },
        },
      });

      const livrosVistos = new Set();
      return reservas.reduce((acc: any, r) => {
        const livro = r.livro;
        if (!livrosVistos.has(livro.id)) {
          livrosVistos.add(livro.id);
          acc.push({
            id: livro.id,
            titulo: livro.titulo,
            categoria: livro.categoria.nome,
            etiqueta: livro.etiqueta,

            quantidadeExemplares: livro._count.exemplares,
            quantidadeDisponiveis: livro.exemplares.length, // Contagem física na estante
            quantidadeReservado: livro._count.reservas,
          });
        }
        return acc;
      }, []);
    } catch (error) {
      throw new InternalServerErrorException('Erro ao buscar reservas');
    }
  }
}
