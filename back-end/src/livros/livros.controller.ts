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
