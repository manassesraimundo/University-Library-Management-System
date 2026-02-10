import { Controller, Get, Param, ParseBoolPipe, Put, Query, UseGuards } from '@nestjs/common';
import { MultasService } from './multas.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { RolesGuard } from 'src/auth/decorators/roles.guard';
import { Roles } from 'src/auth/decorators/roles';

@Controller('multas')
@UseGuards(AuthGuard, RolesGuard)
export class MultasController {
    constructor (private readonly multasService: MultasService) {}

    @Get()
    @Roles('BIBLIOTECARIO')
    async getMultas(@Query('matricula') matricula?: string, @Query('pago') pago?: string) {
        if (matricula) {
            const res = await this.multasService.getMultasByMembro(matricula)
            return res;
        }
        
            const res = await this.multasService.getMultas(false);
            return res;
        
    }

    @Put('pagar/:multaId')
    @Roles('BIBLIOTECARIO')
    async processar(@Param('multaId') multaId: string) {
        const res = await this.multasService.processar(Number(multaId));
        return res;
    }
}
