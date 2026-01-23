import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { RelatoriosService } from './relatorios.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { RolesGuard } from 'src/auth/decorators/roles.guard';
import { Roles } from 'src/auth/decorators/roles';

@Controller('relatorios')
@UseGuards(AuthGuard, RolesGuard)
export class RelatoriosController {
  constructor(private relatoriosService: RelatoriosService) {}

  @Get('livros-mais-emprestados')
  @Roles('BIBLIOTECARIO')
  async getLivrosMaisEmprestados(@Query('categoria') categoria?: string) {
    if (categoria) {
      return this.relatoriosService.getLivrosMaisEmprestadosByCategoriaPorMes(
        categoria,
      );
    }
    return this.relatoriosService.getLivrosMaisEmprestadosMes();
  }

  @Get('livros-mais-emprestados-todos-tempos')
  @Roles('BIBLIOTECARIO')
  async getLivrosMaisEmprestadosTodosTempos() {
    return this.relatoriosService.getLivrosMaisEmprestados();
  }

  @Get('reservas-pendentes')
  @Roles('BIBLIOTECARIO')
  async getReservasPendentes() {
    return this.relatoriosService.getReservasDetalhadas();
  }
}
