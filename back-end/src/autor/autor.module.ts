import { Module } from '@nestjs/common';
import { AutorService } from './autor.service';
import { AutorController } from './autor.controller';

@Module({
  providers: [AutorService],
  controllers: [AutorController],
})
export class AutorModule {}
