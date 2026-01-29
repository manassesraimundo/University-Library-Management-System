import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { RecomendacaoService } from './recomendacao.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { RolesGuard } from 'src/auth/decorators/roles.guard';

@Controller('recomendacao')
@UseGuards(AuthGuard, RolesGuard)
export class RecomendacaoController {
  constructor(private readonly recomdacaoService: RecomendacaoService) {}

  @Get('')
  async gerarRecomendacao(@Req() request: Request) {
    const membroId = request['user'].sub;
    const r = await this.recomdacaoService.gerarRecomendacao(membroId);

    return r;
  }
}
