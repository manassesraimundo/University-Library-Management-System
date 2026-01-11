import {
  Body,
  Controller,
  Delete,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { ChatbotService } from './chatbot.service';
import { ChatbotDto } from './dto/chatbot.dto';

@Controller('chatbot')
export class ChatbotController {
  constructor(private readonly chatbotService: ChatbotService) {}

  @Post('conversar')
  async converca(@Body() body: ChatbotDto): Promise<{ response: string }> {
    const response = await this.chatbotService.conversar(body);

    return response;
  }

  @Delete('historico/:membroId')
  async clearChat(
    @Param('membroId', ParseIntPipe) id: number,
  ): Promise<{ message: string }> {
    const response = await this.chatbotService.clearChat(id);

    return response;
  }
}
