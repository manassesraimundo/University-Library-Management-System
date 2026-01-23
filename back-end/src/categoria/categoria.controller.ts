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
  Query,
  UseGuards,
} from '@nestjs/common';
import { CategoriaService } from './categoria.service';
import { CategoriaDto } from './dto/categoria.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { RolesGuard } from 'src/auth/decorators/roles.guard';
import { Roles } from 'src/auth/decorators/roles';
import { Categoria } from 'src/generated/prisma/client';

@Controller('categoria')
@UseGuards(AuthGuard, RolesGuard)
export class CategoriaController {
  constructor(private readonly categoriaService: CategoriaService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles('BIBLIOTECARIO')
  async createCategoria(
    @Body() body: CategoriaDto,
  ): Promise<{ message: string; id: number }> {
    const result = await this.categoriaService.createCategoria(body);
    return result;
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async getCategorias(@Query('nome') categoria?: string): Promise<Categoria[]> {
    const result = await this.categoriaService.getCategorias(categoria);
    return result;
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @Roles('BIBLIOTECARIO')
  async deleteCategoria(
    @Param('id') id: string,
  ): Promise<{ message: string }> {
    console.log(id)
    const result = await this.categoriaService.deleteCategoria(Number(id));
    return result;
  }
}
