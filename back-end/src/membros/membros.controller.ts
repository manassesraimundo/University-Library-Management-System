import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
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
  @Get('perfil')
  @Roles('MEMBRO')
  async membroLogado(@Req() require: Request): Promise<Membro> {
    const matricula = require['user'].matricula;

    const membro = await this.membrosService.membroLogado(matricula);

    return membro;
  }

  @Get(':matricula')
  @Roles('BIBLIOTECARIO')
  async getMembroByMatricula(
    @Param('matricula') matricula: string,
  ): Promise<Membro[]> {
    const data = await this.membrosService.getMembroByMatricula(matricula);
    return [data];
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

  @Delete(':matricula')
  @Roles('BIBLIOTECARIO')
  async deleteMembroByMatricula(
    @Param('matricula') matricula: string,
  ): Promise<{ message: string }> {
    const data = await this.membrosService.deleteMembroByMatricula(matricula);
    return data;
  }
}
