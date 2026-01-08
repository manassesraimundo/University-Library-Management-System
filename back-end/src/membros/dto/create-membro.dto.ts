import {
  IsEnum,
  IsNotEmpty,
  IsNumberString,
  IsString,
  Length,
} from 'class-validator';
import { TipoMembro } from 'src/generated/prisma/enums';

export class CreateMembroDto {
  @IsString()
  @IsNumberString(
    { no_symbols: true },
    { message: 'Use apenas números, sem pontos, traços ou sinais.' },
  )
  @IsNotEmpty()
  @Length(8, 8, { message: 'A matrícula deve ter exatamente 8 caracteres.' })
  matricula: string;

  @IsString()
  @IsNotEmpty({ message: 'O tipo do membro é obrigatório.' })
  @IsEnum(TipoMembro, { message: 'Tipo de membro inválido.' })
  tipo: TipoMembro;
}
