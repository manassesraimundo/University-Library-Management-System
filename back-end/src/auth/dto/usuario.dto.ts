import { IsNotEmpty, IsString } from 'class-validator';

export class UsuarioAuthDto {
  @IsString()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  senha: string;
}
