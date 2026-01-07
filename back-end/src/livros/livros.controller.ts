import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { LivrosService } from './livros.service';
import { CreateLivroDto } from './dto/livro.dto';

@Controller('livros')
export class LivrosController {
  constructor(private readonly livrosService: LivrosService) {}

  @Get()
  async findAllLivros(
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const sta = status ? status : 'DISPONIVEL';

    const result = await this.livrosService.findAllLivros(
      sta,
      Number(page),
      Number(limit),
    );

    return result;
  }

  @Get(':id')
  async findLivroById(@Param('id') id: string) {
    const re = await this.livrosService.findLivroById(Number(id));
    return re;
  }

  @Post()
  async createLivro(@Body() body: CreateLivroDto) {
    const re = await this.livrosService.createLivro(body);
    return re;
  }
}
