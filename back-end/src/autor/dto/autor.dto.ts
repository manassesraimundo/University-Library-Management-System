import { IsNotEmpty, IsString } from 'class-validator';

export class AutorDto {
  @IsString()
  @IsNotEmpty({ message: 'O nome do autor é obrigatório' })
  nome: string;
}
