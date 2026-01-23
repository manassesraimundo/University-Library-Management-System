import { IsDate, IsDateString, IsInt } from 'class-validator';

export class CreateReservaDto {
  @IsInt()
  membroId: number;

  @IsInt()
  livroId: number;

  @IsDateString()
  paraData: string;
}
