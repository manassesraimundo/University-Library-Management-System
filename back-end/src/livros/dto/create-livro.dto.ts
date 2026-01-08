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
  @IsString()
  @IsNotEmpty({ message: 'O título do livro é obrigatório' })
  titulo: string;

  @IsInt({ message: 'O ID do autor deve ser um número inteiro' })
  @IsNotEmpty({ message: 'O autorId é obrigatório' })
  autorId: number;

  @IsString()
  @IsOptional()
  editora?: string;

  @IsString()
  @IsOptional()
  isbn?: string;

  @IsOptional()
  @IsEnum(StatusLivro, { message: 'Status inválido' })
  status: StatusLivro;

  @IsNumber({}, { message: 'O ID da categoria deve ser um número' })
  @IsNotEmpty({ message: 'O categoriaId é obrigatório' })
  categoriaId: number;
}
