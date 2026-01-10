import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import { Usuario } from 'src/generated/prisma/client';
import { CreateUsuarioDto } from './dto/create-usuario.dto';

@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Post()
  async createUsuario(@Body() body: CreateUsuarioDto): Promise<Object> {
    const result = await this.usuariosService.createUsuario(body);
    return result;
  }

  @Get(':id')
  async getUsuarioProfile(
    @Param('id') id: number,
  ): Promise<Omit<Usuario, 'senha' | 'criadoEm'>> {
    const usuario = await this.usuariosService.findUsuarioById(id);
    return usuario;
  }
}
