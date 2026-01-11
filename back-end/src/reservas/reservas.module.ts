import { Module } from '@nestjs/common';
import { ReservasService } from './reservas.service';
import { ReservasController } from './reservas.controller';
import { MembrosModule } from 'src/membros/membros.module';

@Module({
  imports: [MembrosModule],
  controllers: [ReservasController],
  providers: [ReservasService],
})
export class ReservasModule {}
