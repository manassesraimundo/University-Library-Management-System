import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { RecomendacaoService } from './recomendacao.service';

@Controller('recomendacao')
export class RecomendacaoController {
  constructor(private readonly recomdacaoService: RecomendacaoService) {}

  @Get(':membroId')
  async gerarRecomendacao(@Param('membroId', ParseIntPipe) membroId: number) {
    const r = await this.recomdacaoService.gerarRecomendacao(membroId);

    return r;
  }
}
