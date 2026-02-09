import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { EmprestimosService } from './emprestimos.service';
import { CreateEmprestimoDto } from './dto/create-emprestimo.dto';
import { DevolverEmprestimoDto } from './dto/devolver-emprestimo.dto';
import { RenovarEmprestimoDto } from './dto/renovar-emprestimo.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { RolesGuard } from 'src/auth/decorators/roles.guard';
import { Roles } from 'src/auth/decorators/roles';

@Controller('emprestimos')
@UseGuards(AuthGuard, RolesGuard)
export class EmprestimosController {
  constructor(private readonly emprestimosService: EmprestimosService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles('BIBLIOTECARIO')
  async createEmprestimo(@Body() createEmprestimo: CreateEmprestimoDto) {
    const emprestimo =
      await this.emprestimosService.createEmprestimo(createEmprestimo);
    return emprestimo;
  }

  /*
    Obter emprestimo do membro logado
  */
  @Get('meus-emprestimos')
  @HttpCode(HttpStatus.OK)
  @Roles('MEMBRO')
  async eprestimos(@Req() request: Request) {
    if (request['user'].role === 'MEMBRO') {
      const emprestimos = await this.emprestimosService.eprestimos(
        request['user'].sub,
      );

      return emprestimos;
    }

    return { message: 'Rota para apenas membro' };
  }

  @Get('todos')
  @HttpCode(HttpStatus.OK)
  @Roles('BIBLIOTECARIO')
  async getAllEmprestimos(@Query('etiqueta') etiqueta?: string) {
    if (etiqueta) {
      const emprestimos =
        await this.emprestimosService.getAllEmprestimos(etiqueta);
      return emprestimos;
    }

    return await this.emprestimosService.getAllEmprestimos2();
  }

  @Get('todos/entreges')
  @HttpCode(HttpStatus.OK)
  @Roles('BIBLIOTECARIO')
  async getAllEmprestimosEntreges() {
    const emprestimos =
      await this.emprestimosService.getAllEmprestimosEntreges();
    return emprestimos;
  }

  @Get('historico')
  @HttpCode(HttpStatus.OK)
  @Roles('BIBLIOTECARIO')
  async getHistorico() {
    const historico = await this.emprestimosService.getHistorico();
    return historico;
  }

  @Get('cont-emprestimos')
  @HttpCode(HttpStatus.OK)
  @Roles('BIBLIOTECARIO')
  async totalEmprestimosAtivos() {
    return await this.emprestimosService.totalEmprestimosAtivos();
  }

  @Get('cont-emprestimos-atraso')
  @HttpCode(HttpStatus.OK)
  @Roles('BIBLIOTECARIO')
  async totalEmprestimosEmAtraso() {
    return await this.emprestimosService.totalEmprestimosEmAtraso();
  }

  @Get('todos/atrasos')
  @HttpCode(HttpStatus.OK)
  @Roles('BIBLIOTECARIO')
  async getAllEmprestimosAtraso() {
    const emprestimos = await this.emprestimosService.getAllEmprestimosAtraso();
    return emprestimos;
  }

  @Get(':matricula')
  @HttpCode(HttpStatus.OK)
  @Roles('BIBLIOTECARIO')
  async getAllEmprestimosByMembro(@Param('matricula') matricula: string) {
    const emprestimos =
      await this.emprestimosService.getAllEmprestimosByMembro(matricula);
    return emprestimos;
  }

  @Get(':matricula/atrasos')
  @HttpCode(HttpStatus.OK)
  @Roles('BIBLIOTECARIO')
  async getAllEmprestimosByMembroAtraso(@Param('matricula') matricula: string) {
    const emprestimos =
      await this.emprestimosService.getAllEmprestimosByMembroAtraso(matricula);
    return emprestimos;
  }

  @Get(':matricula/historico')
  @HttpCode(HttpStatus.OK)
  @Roles('BIBLIOTECARIO')
  async getAllEmprestimosByMembroHistorico(
    @Param('matricula') matricula: string,
  ) {
    const emprestimos =
      await this.emprestimosService.getAllEmprestimosByMembroHistorico(
        matricula,
      );
    return emprestimos;
  }

  @Post('devolucao')
  @HttpCode(HttpStatus.OK)
  @Roles('BIBLIOTECARIO')
  async returnEmprestimo(@Body() body: DevolverEmprestimoDto) {
    const resultado = await this.emprestimosService.returnEmprestimo(
      body.emprestimoId,
    );
    return resultado;
  }

  @Post('renovar')
  @HttpCode(HttpStatus.OK)
  @Roles('BIBLIOTECARIO')
  async renovarEmprestimo(@Body() body: RenovarEmprestimoDto) {
    const resultado = await this.emprestimosService.renovarEmprestimo(body);
    return resultado;
  }

  @Put('multa/pagar/:emprestimoId')
  @HttpCode(HttpStatus.OK)
  @Roles('BIBLIOTECARIO')
  async pagarMultaEmprestimo(
    @Param('emprestimoId', ParseIntPipe) emprestimoId: number,
  ) {
    return await this.emprestimosService.pagarMultaEmprestimo(emprestimoId);
  }
}
