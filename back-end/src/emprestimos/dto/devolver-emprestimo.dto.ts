import { IsInt } from 'class-validator';

export class DevolverEmprestimoDto {
  @IsInt()
  emprestimoId: number;
}
