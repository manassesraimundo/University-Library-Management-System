import {
  HttpException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class RelatoriosService {
  constructor(private prisma: PrismaService) {}

  async getLivrosMaisEmprestados() {
    try {
      // Ajustado para passar pela tabela Exemplar
      const result = await this.prisma.$queryRaw`
        SELECT l.titulo, COUNT(e.id) AS total_emprestimo
        FROM Emprestimo e
        JOIN Exemplar ex ON e.exemplarId = ex.id
        JOIN Livro l ON ex.livroId = l.id
        GROUP BY l.titulo
        ORDER BY total_emprestimo DESC
        LIMIT 10;
      `;

      return this.serializeBigInt(result);
    } catch (error) {
      throw new InternalServerErrorException('Erro ao gerar relatório.');
    }
  }

  async getLivrosMaisEmprestadosMes() {
    const primeiroDiaMes = new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      1,
    );

    try {
      const result = await this.prisma.$queryRaw`
        SELECT l.titulo, COUNT(e.id) AS total_emprestimo
        FROM Emprestimo e
        JOIN Exemplar ex ON e.exemplarId = ex.id
        JOIN Livro l ON ex.livroId = l.id
        WHERE e.dataEmprestimo >= ${primeiroDiaMes}
        GROUP BY l.titulo
        ORDER BY total_emprestimo DESC
        LIMIT 10;
      `;
      return this.serializeBigInt(result);
    } catch (error) {
      throw new InternalServerErrorException('Erro ao gerar relatório mensal.');
    }
  }

  async getLivrosMaisEmprestadosByCategoriaPorMes(categoria: string) {
    const primeiroDiaMes = new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      1,
    );

    try {
      const report = await this.prisma.$queryRaw`
        SELECT c.nome AS categoria, l.titulo, COUNT(e.id) AS total_emprestimo
        FROM Emprestimo e
        JOIN Exemplar ex ON e.exemplarId = ex.id
        JOIN Livro l ON ex.livroId = l.id
        JOIN Categoria c ON l.categoriaId = c.id
        WHERE e.dataEmprestimo >= ${primeiroDiaMes}
        AND c.nome = ${categoria}
        GROUP BY l.titulo
        ORDER BY total_emprestimo DESC
        LIMIT 10;
      `;
      return this.serializeBigInt(report);
    } catch (error) {
      throw new InternalServerErrorException(
        'Erro ao gerar relatório por categoria.',
      );
    }
  }

  async getReservasDetalhadas() {
    return await this.prisma.reserva.findMany({
      where: { ativa: true },
      include: {
        livro: {
          select: { titulo: true },
        },
        membro: {
          include: {
            usuario: {
              select: { nome: true },
            },
          },
        },
      },
      orderBy: {
        criadaEm: 'desc',
      },
    });
  }

  private serializeBigInt(data: any) {
    return JSON.parse(
      JSON.stringify(data, (key, value) =>
        typeof value === 'bigint' ? value.toString() : value,
      ),
    );
  }
}
