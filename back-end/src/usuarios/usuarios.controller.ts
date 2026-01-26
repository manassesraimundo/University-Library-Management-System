import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import { Usuario } from 'src/generated/prisma/client';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { RolesGuard } from 'src/auth/decorators/roles.guard';
import { Roles } from 'src/auth/decorators/roles';
import type { Request } from 'express';

@Controller('usuarios')
@UseGuards(AuthGuard, RolesGuard)
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Post()
  @Roles('ADMIN')
  async createUsuario(@Body() body: CreateUsuarioDto): Promise<object> {
    const result = await this.usuariosService.createUsuario(body);
    return result;
  }

  @Get()
  @Roles('ADMIN')
  async getAllUsuarios(
    @Query('status') status?: boolean,
    @Query('nome') nome?: string,
    @Query('email') email?: string,
  ): Promise<object> {
    if (nome) return await this.usuariosService.getUsuariosByNome(nome);

    if (email) return await this.usuariosService.getUsuariosByEmail(email);

    if (status === undefined) status = true;

    const result = await this.usuariosService.getAllUsuario(status);
    return result;
  }

  @Patch(':id')
  @Roles('ADMIN')
  async updateStatusUsuario(
    @Param('id') id: string,
    @Body() body: { ativo: boolean },
  ): Promise<{ message: string }> {
    const result = await this.usuariosService.updateStatusUsuario(
      Number(id),
      body.ativo,
    );
    return result;
  }

  @Patch(':id/permincoes')
  @Roles('ADMIN')
  async updatePermincoesUsuario(
    @Param('id') id: string,
    @Body() body: { role: Usuario['role'] },
  ): Promise<{ message: string }> {
    const result = await this.usuariosService.updatePermincoesUsuario(
      Number(id),
      body.role,
    );
    return result;
  }

  @Get('perfil')
  @Roles('BIBLIOTECARIO')
  async getUsuarioProfile(@Req() request: Request) {
    const id = request['user'].sub;
    const usuario = await this.usuariosService.getUsuarioById(id);
    return usuario;
  }
}
