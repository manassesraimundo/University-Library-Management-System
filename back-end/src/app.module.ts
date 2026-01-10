import { Module } from '@nestjs/common';
import { LivrosModule } from './livros/livros.module';
import { PrismaModule } from './prisma/prisma.module';
import { AutorModule } from './autor/autor.module';
import { CategoriaModule } from './categoria/categoria.module';
import { UsuariosModule } from './usuarios/usuarios.module';
import { MembrosModule } from './membros/membros.module';
import { EmprestimosModule } from './emprestimos/emprestimos.module';

@Module({
  imports: [
    PrismaModule,
    LivrosModule,
    AutorModule,
    CategoriaModule,
    UsuariosModule,
    MembrosModule,
    EmprestimosModule,
  ],
})
export class AppModule {}
