import { IsNumber, IsString } from 'class-validator';

export class ChatbotDto {
  @IsNumber()
  membroId: number;

  @IsString()
  message: string;
}
