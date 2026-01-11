import { Controller, Get, Query } from '@nestjs/common';
import { RelatoriosService } from './relatorios.service';

@Controller('relatorios')
export class RelatoriosController {
  constructor(private relatoriosService: RelatoriosService) {}

  @Get('livros-mais-emprestados')
  async getLivrosMaisEmprestados(@Query('categoria') categoria?: string) {
    if (categoria) {
      return this.relatoriosService.findLivrosMaisEmprestadosByCategoriaPorMes(
        categoria,
      );
    }
    return this.relatoriosService.findLivrosMaisEmprestadosMes();
  }

  @Get('livros-mais-emprestados-todos-tempos')
  async getLivrosMaisEmprestadosTodosTempos() {
    return this.relatoriosService.findLivrosMaisEmprestados();
  }

  @Get('reservas-pendentes')
  async getReservasPendentes() {
    return this.relatoriosService.reservasPendentes();
  }
}
