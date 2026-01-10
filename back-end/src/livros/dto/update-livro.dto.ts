import { IsEnum, IsInt, IsNumber, IsOptional, IsString } from 'class-validator';
import { StatusLivro } from 'src/generated/prisma/enums';

export class UpdateLivroDto {
  @IsOptional()
  @IsString({ message: 'O título deve ser uma string' })
  titulo?: string;

  @IsOptional()
  @IsInt({ message: 'O ID do autor deve ser um número inteiro' })
  autorId?: number;

  @IsOptional()
  @IsString({ message: 'A editora deve ser uma string' })
  editora?: string;

  @IsOptional()
  @IsString({ message: 'O ISBN deve ser uma string' })
  isbn?: string;

  @IsOptional()
  @IsEnum(StatusLivro, { message: 'Status inválido' })
  status?: StatusLivro;

  @IsOptional()
  @IsNumber({}, { message: 'O ID da categoria deve ser um número inteiro' })
  categoriaId?: number;
}
