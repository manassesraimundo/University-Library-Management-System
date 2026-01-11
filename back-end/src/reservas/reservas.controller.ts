import { Body, Controller, Get, ParseIntPipe, Post, Put } from '@nestjs/common';
import { ReservasService } from './reservas.service';
import { CreateReservaDto } from './dto/create-reserva.dto';

@Controller('reservas')
export class ReservasController {
  constructor(private readonly reservasService: ReservasService) {}

  @Post()
  async createReserva(@Body() body: CreateReservaDto) {
    return this.reservasService.createReserva(body);
  }

  @Get()
  async findReservas() {
    return this.reservasService.findReservas();
  }

  @Put('cancelar/:reservaId')
  async cancelarReserva(@Body('reservaId', ParseIntPipe) reservaId: number) {
    return this.reservasService.cancelarReserva(reservaId);
  }
}
