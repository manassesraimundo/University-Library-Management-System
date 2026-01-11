import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LivrosModule } from './livros/livros.module';
import { PrismaModule } from './prisma/prisma.module';
import { AutorModule } from './autor/autor.module';
import { CategoriaModule } from './categoria/categoria.module';
import { UsuariosModule } from './usuarios/usuarios.module';
import { MembrosModule } from './membros/membros.module';
import { EmprestimosModule } from './emprestimos/emprestimos.module';
import { ReservasModule } from './reservas/reservas.module';
import { RelatoriosModule } from './relatorios/relatorios.module';
import { RecomendacaoModule } from './recomendacao/recomendacao.module';
import { ChatbotModule } from './chatbot/chatbot.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule,
    LivrosModule,
    AutorModule,
    CategoriaModule,
    UsuariosModule,
    MembrosModule,
    EmprestimosModule,
    ReservasModule,
    RelatoriosModule,
    RecomendacaoModule,
    ChatbotModule,
  ],
})
export class AppModule {}
