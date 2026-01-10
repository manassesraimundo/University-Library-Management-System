import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import { LivrosService } from './livros.service';
import { CreateLivroDto } from './dto/livro.dto';
import { Livro } from 'src/generated/prisma/client';

@Controller('livros')
export class LivrosController {
  constructor(private readonly livrosService: LivrosService) {}

  @Get()
  async findAllLivros(
    @Query('status') status?: string,
    @Query('page', ParseIntPipe) page?: number,
    @Query('limit', ParseIntPipe) limit?: number,
  ) {
    const sta = status ? status : 'DISPONIVEL';

    const result = await this.livrosService.findAllLivros(sta, page, limit);

    return result;
  }

  @Get(':category/')
  async findLivrosByCategory(
    @Param('category') category: string,
    @Query('page', ParseIntPipe) page: number,
    @Query('limit') limit: number,
  ): Promise<Livro[]> {
    const livrosByCategory = await this.livrosService.findLivrosByCategory(
      category,
      page,
      limit,
    );

    return livrosByCategory;
  }

  @Get(':id')
  async findLivroById(@Param('id', ParseIntPipe) id: number) {
    const re = await this.livrosService.findLivroById(id);
    return re;
  }

  @Post()
  async createLivro(@Body() body: CreateLivroDto) {
    const re = await this.livrosService.createLivro(body);
    return re;
  }
}
