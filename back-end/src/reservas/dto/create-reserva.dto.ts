import {
  IsDate,
  IsDateString,
  IsInt,
  IsOctal,
  IsString,
} from 'class-validator';

export class CreateReservaDto {
  @IsString()
  matricula: string;

  @IsInt()
  livroId: number;

  // @IsDateString()
  // @IsOctal()
  // paraData?: string;
}
