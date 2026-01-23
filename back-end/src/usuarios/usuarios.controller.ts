import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
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

  @Get('perfil')
  @Roles('BIBLIOTECARIO')
  async getUsuarioProfile(
    @Req() request: Request,
  ) {
    const id = request['user'].sub;
    const usuario = await this.usuariosService.getUsuarioById(id);
    return usuario;
  }
}
