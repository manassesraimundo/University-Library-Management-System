import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { StatusLivro } from 'src/generated/prisma/enums';

export class CreateLivroDto {
  @IsString({ message: 'O título do livro deve ser uma string' })
  @IsNotEmpty({ message: 'O título do livro é obrigatório' })
  titulo: string;

  @IsInt({ message: 'O ID do autor deve ser um número inteiro' })
  @IsNotEmpty({ message: 'O autorId é obrigatório' })
  autorId: number;

  @IsString({ message: 'O nome da editora deve ser uma string' })
  @IsOptional()
  editora?: string;

  @IsString({ message: 'O ISBN deve ser uma string' })
  @IsOptional()
  isbn?: string;

  @IsOptional()
  @IsEnum(StatusLivro, { message: 'Status inválido' })
  status: StatusLivro;

  @IsInt()
  @IsNotEmpty()
  quantidade: number;

  @IsNumber({}, { message: 'O ID da categoria deve ser um número' })
  @IsNotEmpty({ message: 'O categoriaId é obrigatório' })
  categoriaId: number;

  @IsString()
  @IsOptional()
  nomeAutor?: string;

  @IsString()
  @IsOptional()
  nomeCategoria?: string;
}
