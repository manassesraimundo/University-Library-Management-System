import { Module } from '@nestjs/common';
import { RecomendacaoController } from './recomendacao.controller';
import { RecomendacaoService } from './recomendacao.service';
import { MembrosModule } from 'src/membros/membros.module';

@Module({
  imports: [MembrosModule],
  controllers: [RecomendacaoController],
  providers: [RecomendacaoService],
})
export class RecomendacaoModule {}
