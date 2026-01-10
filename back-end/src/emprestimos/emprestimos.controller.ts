import { Body, Controller, Get, Post } from '@nestjs/common';
import { EmprestimosService } from './emprestimos.service';
import { CreateEmprestimoDto } from './dto/create-emprestimo.dto';

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
}
