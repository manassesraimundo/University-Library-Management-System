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
import { AuthModule } from './auth/auth.module';
import { RolesGuard } from './auth/decorators/roles.guard';
import { AuthGuard } from './auth/auth.guard';
import { APP_GUARD } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { ScanModule } from './scan/scan.module';
import { MultasModule } from './multas/multas.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ScheduleModule.forRoot(),
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
    AuthModule,
    ScanModule,
    MultasModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard, // Primeiro verifica se está logado
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard, // Depois verifica a permissão
    },
  ],
})
export class AppModule {}
