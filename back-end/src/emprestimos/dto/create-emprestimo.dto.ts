import { IsInt } from 'class-validator';

export class CreateEmprestimoDto {
  @IsInt()
  membroId: number;

  @IsInt()
  livroId: number;
}
