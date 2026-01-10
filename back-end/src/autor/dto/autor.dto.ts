import { IsAlpha, IsNotEmpty, IsString } from 'class-validator';

export class AutorDto {
  @IsString({ message: 'O nome do autor deve ser uma string' })
  @IsAlpha('pt-BR', { message: 'O nome do autor deve conter apenas letras' })
  @IsNotEmpty({ message: 'O nome do autor é obrigatório' })
  nome: string;
}
