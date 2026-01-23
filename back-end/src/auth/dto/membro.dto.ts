import { IsNotEmpty, IsString } from 'class-validator';

export class MembroAuthDto {
  @IsString()
  @IsNotEmpty()
  matricula: string;
}