import { IsInt, IsString } from 'class-validator';

export class CreateEmprestimoDto {
  @IsString()
  matricula: string;

  @IsInt()
  livroId: number;
}
