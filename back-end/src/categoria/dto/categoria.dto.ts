import { IsNotEmpty, IsString } from 'class-validator';

export class CategoriaDto {
  @IsString({ message: 'O nome da categoria deve ser uma string.' })
  @IsNotEmpty({ message: 'O nome da categoria é obrigatório.' })
  nome: string;
}
