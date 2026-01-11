import { IsInt } from 'class-validator';

export class RenovarEmprestimoDto {
  @IsInt()
  emprestimoId: number;
}
