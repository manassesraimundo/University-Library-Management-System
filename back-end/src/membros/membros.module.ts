import { Module } from '@nestjs/common';
import { MembrosService } from './membros.service';
import { MembrosController } from './membros.controller';

@Module({
  providers: [MembrosService],
  controllers: [MembrosController],
  exports: [MembrosService],
})
export class MembrosModule {}
