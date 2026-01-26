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
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ChatbotService } from './chatbot.service';
import { ChatbotDto } from './dto/chatbot.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { RolesGuard } from 'src/auth/decorators/roles.guard';
import type { Request } from 'express';

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

  @Get('conversas')
  @HttpCode(HttpStatus.OK)
  async getCovercas(@Req() resques: Request) {
    const membroId = resques['user'].sub;
    const response = await this.chatbotService.getConversas(membroId);

    return response;
  }

  @Delete('historico/limpar')
  @HttpCode(HttpStatus.OK)
  async clearChat(
    @Req() resques: Request,
  ): Promise<{ message: string }> {
    const id = resques['user'].sub;
    const response = await this.chatbotService.clearChat(id);

    return response;
  }
}
