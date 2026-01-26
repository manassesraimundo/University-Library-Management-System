import { Module } from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import { UsuariosController } from './usuarios.controller';

@Module({
  providers: [UsuariosService],
  controllers: [UsuariosController],
})
export class UsuariosModule {}
// npx prisma validate
// npx prisma migrate dev
// npx prisma generate
