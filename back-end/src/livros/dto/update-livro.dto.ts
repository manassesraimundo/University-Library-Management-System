import { IsEnum, IsInt, IsNumber, IsOptional, IsString } from 'class-validator';
import { StatusLivro } from './create-livro.dto';

export class UpdateLivroDto {
  @IsOptional()
  @IsString()
  titulo?: string;

  @IsOptional()
  @IsInt({ message: 'O ID do autor deve ser um número inteiro' })
  autorId?: number;

  @IsOptional()
  editora?: string;

  @IsOptional()
  @IsString()
  isbn?: string;

  @IsOptional()
  @IsEnum(StatusLivro, { message: 'Status inválido' })
  status?: StatusLivro;

  @IsOptional()
  @IsNumber({}, { message: 'O ID da categoria deve ser um número inteiro' })
  categoriaId?: number;
}
