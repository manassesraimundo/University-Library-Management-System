import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsuarioAuthDto } from './dto/usuario.dto';
import type { Response } from 'express';
import { Public } from './decorators/roles';
import { AuthGuard } from './auth.guard';
import { MembroAuthDto } from './dto/membro.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('usuario/login')
  @HttpCode(HttpStatus.OK)
  @Public()
  async usuarioLogin(
    @Body() body: UsuarioAuthDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const user = await this.authService.usuarioLogin(body);

    response.cookie('access_token', user.access_token, {
      httpOnly: true,
      secure: false,
      sameSite: 'strict',
      maxAge: 1000 * 60 * 60,
    });

    return { statusCode: 200, message: 'Login com sucesso.', role: user.role };
  }

  @Post('membro/login')
  @HttpCode(HttpStatus.OK)
  @Public()
  async membroLogin(
    @Body() data: MembroAuthDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const membro = await this.authService.membroLogin(data.matricula);

    response.cookie('access_token', membro.access_token, {
      httpOnly: true,
      secure: false,
      sameSite: 'strict',
      maxAge: 1000 * 60 * 60,
    });

    return { statusCode: 200, message: 'Login com sucesso.', role: membro.role };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  async logOut(@Res({ passthrough: true }) response: Response) {
    response.clearCookie('access_token');

    return { statusCode: 200, message: 'Logout sucesso.' };
  }

  @Get('me')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  async me(@Req() request: Request) {
    if (request['user'].role === 'MEMBRO') {
      const re = await this.authService.membroAutenticado(request['user'].matricula);
      return {...re, role: request['user'].role }
    }

      return await this.authService.usuarioAutenticado(request['user'].sub);
  }
}
