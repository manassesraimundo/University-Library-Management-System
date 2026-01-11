import {
  HttpException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class RelatoriosService {
  constructor(private prisma: PrismaService) {}

  async findLivrosMaisEmprestados() {
    try {
      return this.prisma.$queryRaw`
                SELECT livros.titulo, COUNT(emprestimos.id) AS total_emprestimos
                FROM emprestimos
                JOIN livros ON emprestimos.livro_id = livros.id
                GROUP BY livros.titulo
                ORDER BY total_emprestimos DESC
                LIMIT 10;
            `;
    } catch (error) {
      throw error instanceof HttpException
        ? error
        : new InternalServerErrorException(
            'Erro ao gerar relatório de livros mais emprestados.',
          );
    }
  }

  async findLivrosMaisEmprestadosMes() {
    const dataAtual = new Date();
    const primeiroDiaMes = new Date(
      dataAtual.getFullYear(),
      dataAtual.getMonth(),
      1,
    );

    try {
      return this.prisma.$queryRaw`
                SELECT livros.titulo, COUNT(emprestimos.id) AS total_emprestimos
                FROM emprestimos
                JOIN livros ON emprestimos.livro_id = livros.id
                WHERE emprestimos.data_emprestimo >= ${primeiroDiaMes}
                GROUP BY livros.titulo
                ORDER BY total_emprestimos DESC
                LIMIT 10;
            `;
    } catch (error) {
      throw error instanceof HttpException
        ? error
        : new InternalServerErrorException(
            'Erro ao gerar relatório de livros mais emprestados no mês.',
          );
    }
  }

  async findLivrosMaisEmprestadosByCategoriaPorMes(categoria: string) {
    const dataAtual = new Date();
    const primeiroDiaMes = new Date(
      dataAtual.getFullYear(),
      dataAtual.getMonth(),
      1,
    );

    try {
      return this.prisma.$queryRaw`
                SELECT categorias.nome AS categoria, livros.titulo, COUNT(emprestimos.id) AS total_emprestimos
                FROM emprestimos
                JOIN livros ON emprestimos.livro_id = livros.id
                JOIN categorias ON livros.categoria_id = categorias.id
                WHERE emprestimos.data_emprestimo >= ${primeiroDiaMes}
                AND categorias.nome = ${categoria}
                GROUP BY categorias.nome, livros.titulo
                ORDER BY total_emprestimos DESC
                LIMIT 10;
            `;
    } catch (error) {
      throw error instanceof HttpException
        ? error
        : new InternalServerErrorException(
            'Erro ao gerar relatório de livros mais emprestados por categoria no mês.',
          );
    }
  }

  async reservasPendentes() {
    try {
      return this.prisma.$queryRaw`
                SELECT livros.titulo, COUNT(reservas.id) AS total_reservas
                FROM reservas
                JOIN livros ON reservas.livro_id = livros.id
                WHERE reservas.status = 'PENDENTE'
                GROUP BY livros.titulo
                ORDER BY total_reservas DESC;
            `;
    } catch (error) {
      throw error instanceof HttpException
        ? error
        : new InternalServerErrorException(
            'Erro ao gerar relatório de reservas pendentes.',
          );
    }
  }
}
