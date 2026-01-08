import { Controller, Delete, Get, Post } from '@nestjs/common';
import { AutorService } from './autor.service';
import { AutorDto } from './dto/autor.dto';
import { Autor } from 'src/generated/prisma/client';

@Controller('autor')
export class AutorController {
  constructor(private autorService: AutorService) {}

  @Post()
  async createAutor(autorDto: AutorDto): Promise<Object> {
    const result = await this.autorService.createAutor(autorDto);
    return result;
  }

  @Get()
  async getAutores(): Promise<Autor[]> {
    const autores = await this.autorService.getAutores();

    return autores;
  }

  @Delete(':id')
  async deleteAutor(id: string): Promise<Object> {
    const result = await this.autorService.deleteAutor(Number(id));

    return result;
  }
}
