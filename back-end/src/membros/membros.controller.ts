import {
  Controller,
  Delete,
  Get,
  Param,
  ParseBoolPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { MembrosService } from './membros.service';
import { CreateMembroDto } from './dto/membro.dto';
import { Membro } from 'src/generated/prisma/client';

@Controller('membros')
export class MembrosController {
  constructor(private readonly membrosService: MembrosService) {}

  @Post()
  async createMembro(body: CreateMembroDto): Promise<Object> {
    const data = await this.membrosService.createMembro(body);

    return data;
  }

  @Get()
  async getAllMembros(
    @Query('status', ParseBoolPipe) status?: boolean,
  ): Promise<Omit<Membro, 'criadoEm'>[]> {
    const data = await this.membrosService.getAllMembros((status = true));

    return data;
  }

  @Get(':matricula')
  async getMembroByMatricula(
    @Param('matricula') matricula: string,
  ): Promise<Membro> {
    const data = await this.membrosService.getMembroByMatricula(matricula);

    return data;
  }

  @Put(':matricula/status/:activate')
  async updateMembroStatus(
    @Param('matricula') matricula: string,
    @Param('activate') activate: boolean,
  ): Promise<Object> {
    const data = await this.membrosService.updateMembroStatus(
      matricula,
      activate,
    );

    return data;
  }

  @Delete(':matricula')
  async deleteMembroByMatricula(
    @Param('matricula') matricula: string,
  ): Promise<Object> {
    const data = await this.membrosService.deleteMembroByMatricula(matricula);

    return data;
  }
}
