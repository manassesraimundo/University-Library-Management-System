import { Module } from '@nestjs/common';
import { LivrosModule } from './livros/livros.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [PrismaModule, LivrosModule],
})
export class AppModule {}
