import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { LivrosService } from './livros.service';
import { CreateLivroDto } from './dto/livro.dto';
import { Livro } from 'src/generated/prisma/client';
import { AuthGuard } from 'src/auth/auth.guard';
import { RolesGuard } from 'src/auth/decorators/roles.guard';
import { Roles } from 'src/auth/decorators/roles';
import type { Request } from 'express';

@Controller('livros')
@UseGuards(AuthGuard, RolesGuard)
export class LivrosController {
  constructor(private readonly livrosService: LivrosService) {}

  @Get()
  async getAllLivros(
    @Req() request: Request,
    @Query('status') status?: string,
    @Query('etiqueta') etiqueta?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('titulo') titulo?: string,
  ) {
    const sta = status ? status.toUpperCase() : 'DISPONIVEL';

    if (request['user'].matricula) {
      const result = await this.livrosService.getAllLivros2(
        sta,
        etiqueta,
        Number(page) || 1,
        Number(limit) || 10,
        titulo,
      );
      return result;
    }

    const result = await this.livrosService.getAllLivros(
      sta,
      etiqueta,
      Number(page) || 1,
      Number(limit) || 10,
      titulo,
    );
    return result;
  }

  @Get(':livroId/exemplares')
  @Roles('BIBLIOTECARIO')
  async getExemplaresByLivro(@Param('livroId') livroId: number) {
    const exemplares = await this.livrosService.getExemplaresByLivro(livroId);
    return exemplares;
  }

  @Get('cont-livros')
  async getTotalDeLivro() {
    return await this.livrosService.getTotalDeLivro();
  }

  @Get('reservas')
  async getAllReservas(@Query('etiqueta') etiqueta: string) {
    return await this.livrosService.getAllReservas(etiqueta);
  }

  @Get('categoria/:catego')
  async getLivrosByCategory(
    @Param('catego') catego: string,
    @Query('etiqueta') etiqueta?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<Livro[]> {
    const livrosByCategory = await this.livrosService.getLivrosByCategory(
      catego,
      etiqueta || 'BRANCO',
      Number(page) || 1,
      Number(limit) || 10,
    );
    return livrosByCategory;
  }

  @Get(':id')
  async getLivroById(@Param('id', ParseIntPipe) id: number) {
    const re = await this.livrosService.getLivroById(id);
    return re;
  }

  @Post()
  @Roles('BIBLIOTECARIO')
  async createLivro(@Body() body: CreateLivroDto) {
    const re = await this.livrosService.createLivro(body);
    return re;
  }
}
