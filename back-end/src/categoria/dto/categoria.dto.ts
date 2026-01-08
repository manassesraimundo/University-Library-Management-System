import { IsNotEmpty, IsString } from 'class-validator';

export class CategoriaDto {
  @IsString()
  @IsNotEmpty({ message: 'O nome da categoria é obrigatório.' })
  nome: string;
}
