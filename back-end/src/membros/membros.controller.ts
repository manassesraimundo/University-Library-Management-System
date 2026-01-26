import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { MembrosService } from './membros.service';
import { CreateMembroDto } from './dto/membro.dto';
import { Membro } from 'src/generated/prisma/client';
import { AuthGuard } from 'src/auth/auth.guard';
import { Roles } from 'src/auth/decorators/roles';
import { RolesGuard } from 'src/auth/decorators/roles.guard';

@Controller('membros')
@UseGuards(AuthGuard, RolesGuard)
export class MembrosController {
  constructor(private readonly membrosService: MembrosService) {}

  @Post()
  @Roles('BIBLIOTECARIO')
  async createMembro(@Body() body: CreateMembroDto): Promise<object> {
    const data = await this.membrosService.createMembro(body);
    return data;
  }

  @Get()
  @Roles('BIBLIOTECARIO')
  async getAllMembros(
    @Query('status') status?: string,
  ): Promise<Omit<Membro, 'criadoEm'>[]> {
    const sta = status === 'false' ? false : true;
    const data = await this.membrosService.getAllMembros(sta);
    return data;
  }

  /*
    Obter dados do membro logado
  */
  @Put('perfil/atualizar')
  @Roles('MEMBRO')
  async membroPerfilUpdate(
    @Req() require: Request,
    @Body() body: { nome?: string; email?: string },
  ) {
    const matricula = require['user'].matricula;

    const membro = await this.membrosService.membroPerfilUpdate(
      matricula,
      body,
    );

    return membro;
  }

  @Get('perfil')
  @Roles('MEMBRO')
  async membroLogado(@Req() require: Request): Promise<Membro> {
    const matricula = require['user'].matricula;

    const membro = await this.membrosService.membroLogado(matricula);

    return membro;
  }

  @Get('notificacoes/')
  @Roles('MEMBRO')
  async getNotificacoesMembro(@Req() require: Request): Promise<object> {
    const membroId = require['user'].sub;

    const notificacoes =
      await this.membrosService.getNotificacoesMembro(membroId);

    return notificacoes;
  }

  @Post('/vincular-usuario')
  @Roles('MEMBRO')
  async vincularUsuarioMembro(
    @Req() require: Request,
    @Body() body: { nome: string; email: string },
  ): Promise<{ message: string }> {
    const membroId = require['user'].sub;

    const data = await this.membrosService.vincularUsuarioMembro(
      membroId,
      body,
    );

    return data;
  }

  @Get('/meu-painel')
  @Roles('MEMBRO')
  async meuPanel(@Req() require: Request) {
    const matricula = require['user'].matricula;

    const painel = await this.membrosService.meuPanel(matricula);

    return painel;
  }

  @Get(':matricula')
  @Roles('BIBLIOTECARIO')
  async getMembroByMatricula(
    @Param('matricula') matricula: string,
  ): Promise<Membro[]> {
    const data = await this.membrosService.getMembroByMatricula(matricula);
    return [data];
  }

  @Patch('/notificacoes/mark-all-as-read')
  @Roles('MEMBRO')
  async markAllNotificacoesAsRead(
    @Req() require: Request,
  ): Promise<{ message: string }> {
    const membroId = require['user'].sub;

    const data = await this.membrosService.markAllNotificacoesAsRead(membroId);
    return data;
  }

  @Patch('notificacoes/:id/mark-as-read')
  @Roles('MEMBRO')
  async markNotificacaoAsRead(
    @Param('id') id: string,
  ): Promise<{ message: string }> {
    const data = await this.membrosService.markNotificacaoAsRead(id);
    return data;
  }

  @Put(':matricula/status/:activate')
  @Roles('BIBLIOTECARIO')
  async updateMembroStatus(
    @Param('matricula') matricula: string,
    @Param('activate') activate: boolean,
  ): Promise<{ message: string }> {
    const data = await this.membrosService.updateMembroStatus(
      matricula,
      activate,
    );
    return data;
  }

  @Delete('/notificacoes/clear-history')
  @Roles('MEMBRO')
  async clearNotificacoesHistory(
    @Req() require: Request,
  ): Promise<{ message: string }> {
    const membroId = require['user'].sub;

    const data = await this.membrosService.clearNotificacoesHistory(membroId);
    return data;
  }

  @Delete(':matricula')
  @Roles('BIBLIOTECARIO')
  async deleteMembroByMatricula(
    @Param('matricula') matricula: string,
  ): Promise<{ message: string }> {
    const data = await this.membrosService.deleteMembroByMatricula(matricula);
    return data;
  }
}
