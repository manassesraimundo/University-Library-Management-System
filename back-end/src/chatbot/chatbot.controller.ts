import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ChatbotService } from './chatbot.service';
import { ChatbotDto } from './dto/chatbot.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { RolesGuard } from 'src/auth/decorators/roles.guard';

@Controller('chatbot')
@UseGuards(AuthGuard, RolesGuard)
export class ChatbotController {
  constructor(private readonly chatbotService: ChatbotService) {}

  @Post('conversar')
  @HttpCode(HttpStatus.OK)
  async converca(@Body() body: ChatbotDto): Promise<{ response: string }> {
    const response = await this.chatbotService.conversar(body);

    return response;
  }

  @Get('conversar')
  @HttpCode(HttpStatus.OK)
  async getCovercas() {}

  @Delete('historico/limpar/:membroId')
  @HttpCode(HttpStatus.OK)
  async clearChat(
    @Param('membroId', ParseIntPipe) id: number,
  ): Promise<{ message: string }> {
    const response = await this.chatbotService.clearChat(id);

    return response;
  }
}
