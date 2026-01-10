import { Module } from '@nestjs/common';
import { EmprestimosService } from './emprestimos.service';
import { EmprestimosController } from './emprestimos.controller';

@Module({
  providers: [EmprestimosService],
  controllers: [EmprestimosController],
})
export class EmprestimosModule {}
