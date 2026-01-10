import {
  IsEnum,
  IsNotEmpty,
  IsNumberString,
  IsString,
  Length,
} from 'class-validator';
import { TipoMembro } from 'src/generated/prisma/enums';

export class CreateMembroDto {
  @IsString({ message: 'A matrícula deve ser uma string.' })
  @IsNumberString(
    { no_symbols: true },
    { message: 'Use apenas números, sem pontos, traços ou sinais.' },
  )
  @IsNotEmpty({ message: 'A matrícula é obrigatória.' })
  @Length(8, 8, { message: 'A matrícula deve ter exatamente 8 caracteres.' })
  matricula: string;

  @IsString({ message: 'O tipo do membro deve ser uma string.' })
  @IsNotEmpty({ message: 'O tipo do membro é obrigatório.' })
  @IsEnum(TipoMembro, { message: 'Tipo de membro inválido.' })
  tipo: TipoMembro;
}
