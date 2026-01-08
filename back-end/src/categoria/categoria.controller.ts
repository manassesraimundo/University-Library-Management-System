import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { CategoriaService } from './categoria.service';
import { CategoriaDto } from './dto/categoria.dto';

@Controller('categoria')
export class CategoriaController {
  constructor(private readonly categoriaService: CategoriaService) {}

  @Post()
  async createCategoria(@Body() body: CategoriaDto): Promise<Object> {
    const result = await this.categoriaService.createCategoria(body);
    return result;
  }

  @Get()
  async getCategorias(): Promise<Object> {
    const result = await this.categoriaService.getCategorias();
    return result;
  }

  @Delete(':id')
  async deleteCategoria(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<Object> {
    const result = await this.categoriaService.deleteCategoria(id);
    return result;
  }
}
