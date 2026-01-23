import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AutorService } from './autor.service';
import { AutorDto } from './dto/autor.dto';
import { Autor } from 'src/generated/prisma/client';
import { AuthGuard } from 'src/auth/auth.guard';
import { RolesGuard } from 'src/auth/decorators/roles.guard';
import { Roles } from 'src/auth/decorators/roles';

@Controller('autor')
@UseGuards(AuthGuard, RolesGuard)
export class AutorController {
  constructor(private autorService: AutorService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles('BIBLIOTECARIO')
  async createAutor(
    @Body() autorDto: AutorDto,
  ): Promise<{ message: string; id: number }> {
    const result = await this.autorService.createAutor(autorDto);
    return result;
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async getAutores(@Query('nome-autor') nomeAutor?: string): Promise<Autor[]> {
    const autores = await this.autorService.getAutores(nomeAutor);

    return autores;
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @Roles('BIBLIOTECARIO')
  async deleteAutor(@Param('id') id: string): Promise<{ message: string }> {
    const result = await this.autorService.deleteAutor(Number(id));

    return result;
  }
}
