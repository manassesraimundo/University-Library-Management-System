import { Body, Controller, Get, Post } from '@nestjs/common';
import { EmprestimosService } from './emprestimos.service';
import { CreateEmprestimoDto } from './dto/create-emprestimo.dto';
import { DevolverEmprestimoDto } from './dto/devolver-emprestimo.dto';
import { RenovarEmprestimoDto } from './dto/renovar-emprestimo.dto';

@Controller('emprestimos')
export class EmprestimosController {
  constructor(private readonly emprestimosService: EmprestimosService) {}

  @Post()
  async createEmprestimo(@Body() createEmprestimo: CreateEmprestimoDto) {
    const emprestimo =
      await this.emprestimosService.createEmprestimo(createEmprestimo);
    return emprestimo;
  }

  @Get()
  async findAllEmprestimos() {
    const emprestimos = await this.emprestimosService.findAllEmprestimos();
    return emprestimos;
  }

  @Post('devolucao')
  async returnEmprestimo(@Body() body: DevolverEmprestimoDto) {
    const resultado = await this.emprestimosService.returnEmprestimo(
      body.emprestimoId,
    );
    return resultado;
  }

  @Post('renovar')
  async renovarEmprestimo(@Body() body: RenovarEmprestimoDto) {
    const resultado = await this.emprestimosService.renovarEmprestimo(body);
    return resultado;
  }
}
