import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ReservasService } from './reservas.service';
import { CreateReservaDto } from './dto/create-reserva.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { RolesGuard } from 'src/auth/decorators/roles.guard';
import { Roles } from 'src/auth/decorators/roles';

@Controller('reservas')
@UseGuards(AuthGuard, RolesGuard)
export class ReservasController {
  constructor(private readonly reservasService: ReservasService) {}

  @Post()
  async createReserva(@Body() body: CreateReservaDto) {
    return this.reservasService.createReserva(body);
  }

  @Get('todos')
  @Roles('BIBLIOTECARIO')
  async getReservasByStatus(@Query('status') status?: string) {
    const st = status === 'true' ? true : false;
    return await this.reservasService.getReservasByStatus(st);
  }

  @Put('confirmar/:reservaId')
  @Roles('BIBLIOTECARIO')
  async confirmarReservaParaEmprestimo(@Param('reservaId') reservaId: number) {
    return await this.reservasService.confirmarReservaParaEmprestimo(reservaId);
  }

  @Get(':matricula')
  async getReservasByMatricula(@Param('matricula') matricula: string) {
    return await this.reservasService.getReservasByMatricula(matricula);
  }

  @Get('membro/:matricula')
  async getReservasByMembro(@Param('matricula') matricula: string) {
    return await this.reservasService.getReservasByMatricula(matricula);
  }

  @Put('cancelar/:reservaId')
  async cancelarReserva(@Param('reservaId', ParseIntPipe) reservaId: number) {
    return this.reservasService.cancelarReserva(reservaId);
  }
}
