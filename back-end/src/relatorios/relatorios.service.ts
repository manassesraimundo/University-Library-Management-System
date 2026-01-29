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
      const result = await this.prisma.$queryRaw`
        SELECT livro.titulo, COUNT(emprestimo.id) AS total_emprestimo
        FROM emprestimo
        JOIN livro ON emprestimo.livroId = livro.id
        GROUP BY livro.titulo
        ORDER BY total_emprestimo DESC
        LIMIT 10;
    `;

      // Converte BigInt para Number ou String
      return JSON.parse(
        JSON.stringify(result, (key, value) =>
          typeof value === 'bigint' ? value.toString() : value,
        ),
      );
    } catch (error) {
      console.error(error);
      throw error instanceof HttpException
        ? error
        : new InternalServerErrorException(
            'Erro ao gerar relatório de livros mais emprestados.',
          );
    }
  }

  async getLivrosMaisEmprestadosMes() {
    const dataAtual = new Date();
    const primeiroDiaMes = new Date(
      dataAtual.getFullYear(),
      dataAtual.getMonth(),
      1,
    );

    try {
      const result = await this.prisma.$queryRaw`
                SELECT livro.titulo, COUNT(emprestimo.id) AS total_emprestimo
                FROM emprestimo
                JOIN livro ON emprestimo.livroId = livro.id
                WHERE emprestimo.dataEmprestimo >= ${primeiroDiaMes}
                GROUP BY livro.titulo
                ORDER BY total_emprestimo DESC
                LIMIT 10;
            `;
      return JSON.parse(
        JSON.stringify(result, (key, value) =>
          typeof value === 'bigint' ? value.toString() : value,
        ),
      );
    } catch (error) {
      throw error instanceof HttpException
        ? error
        : new InternalServerErrorException(
            'Erro ao gerar relatório de livros mais emprestados no mês.',
          );
    }
  }

  async getLivrosMaisEmprestadosByCategoriaPorMes(categoria: string) {
    const dataAtual = new Date();
    const primeiroDiaMes = new Date(
      dataAtual.getFullYear(),
      dataAtual.getMonth(),
      1,
    );

    try {
      // Usamos await para capturar o resultado antes de retornar
      const report = await this.prisma.$queryRaw`
                SELECT c.nome AS categoria, l.titulo, COUNT(e.id) AS total_emprestimo
                FROM emprestimo e
                JOIN livro l ON e.livroId = l.id
                JOIN categoria c ON l.categoriaId = c.id
                WHERE e.data_emprestimo >= ${primeiroDiaMes}
                AND c.nome = ${categoria}
                GROUP BY c.nome, l.titulo
                ORDER BY total_emprestimo DESC
                LIMIT 10;
            `;

      // Se você não colocou a solução global no main.ts, converta o BigInt aqui:
      return JSON.parse(
        JSON.stringify(report, (key, value) =>
          typeof value === 'bigint' ? value.toString() : value,
        ),
      );
    } catch (error) {
      console.error('Erro Detalhado:', error); // Log para debug
      throw new InternalServerErrorException(
        'Erro ao gerar relatório de livros mais emprestados por categoria no mês.',
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
}
