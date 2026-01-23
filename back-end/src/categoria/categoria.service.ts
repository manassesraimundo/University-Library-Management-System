import {
  ConflictException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CategoriaDto } from './dto/categoria.dto';
import { Categoria } from 'src/generated/prisma/client';

@Injectable()
export class CategoriaService {
  constructor(private readonly prisma: PrismaService) {}

  async createCategoria(
    body: CategoriaDto,
  ): Promise<{ message: string; id: number }> {
    try {
      const existingCategoria = await this.prisma.categoria.findUnique({
        where: { nome: body.nome },
      });

      if (existingCategoria)
        throw new ConflictException(`A categoria '${body.nome}' já existe.`);

      const categoria = await this.prisma.categoria.create({
        data: {
          nome: body.nome,
        },
      });

      return {
        message: `Categoria '${categoria.nome}' criada com sucesso!`,
        id: categoria.id,
      };
    } catch (error) {
      throw error instanceof HttpException
        ? error
        : new InternalServerErrorException('Erro ao criar a categoria.');
    }
  }

  async getCategorias(
    categoria?: string,
  ): Promise<Omit<Categoria, 'livros'>[]> {
    try {
      if (categoria) {
        const categorias = await this.prisma.categoria.findMany({
          where: { nome: { contains: categoria } },
          include: { livros: true },
          orderBy: { nome: 'asc' },
        });
        return categorias;
      }
      const categorias = await this.prisma.categoria.findMany({
        include: { livros: true },
        orderBy : { nome: 'asc' }
      });
      return categorias;
    } catch (error) {
      throw new InternalServerErrorException('Erro ao buscar as categorias.');
    }
  }

  async deleteCategoria(id: number): Promise<{ message: string }> {
    try {
      console.log(id)
      const existingCategoria = await this.prisma.categoria.findUnique({
        where: { id },
      });
      
      if (!existingCategoria)
        throw new NotFoundException(`Categoria com ID '${id}' não encontrada.`);
      
      await this.prisma.categoria.delete({
        where: { id },
      });
      return {
        message: `Categoria '${existingCategoria.nome}' deletada com sucesso!`,
      };
    } catch (error) {
      throw error instanceof HttpException
        ? error
        : new InternalServerErrorException('Erro ao deletar a categoria.');
    }
  }
}
