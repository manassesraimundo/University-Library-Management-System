import {
  HttpException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { MembrosService } from 'src/membros/membros.service';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

@Injectable()
export class RecomendacaoService {
  private openai: OpenAI;

  constructor(
    private readonly prisma: PrismaService,
    private readonly membroService: MembrosService,
    private readonly configService: ConfigService,
  ) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');

    if (!apiKey)
      throw new InternalServerErrorException(
        'A chave da API OpenAI não foi configurada.',
      );

    this.openai = new OpenAI({ apiKey });
  }

  async gerarRecomendacao(membroId: number): Promise<string> {
    try {
      const membro = await this.membroService.getMembroById(membroId);

      if (!membro) {
        throw new Error('Membro não encontrado');
      }

      const historicoEmprestimos = await this.prisma.emprestimo.findMany({
        where: { membroId },
        include: { livro: true },
      });

      const livrosLidos = historicoEmprestimos
        .map((e) => e.livro.titulo)
        .join('\n');
      const livro = await this.prisma.livro.findMany({
        where: {
          NOT: { id: { in: historicoEmprestimos.map((e) => e.livroId) } },
        },
        take: 5,
      });

      const resposta = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content:
              'Você é um bibliotecário prestativo. Recomende apenas DOIS a TRÊS livros das opções fornecidas, justificando brevemente em uma frase.',
          },
          {
            role: 'user',
            content: `Histórico: ${livrosLidos}. \nOpções disponíveis: ${livro.map((l) => l.titulo).join('\n')}.`,
          },
        ],
        max_tokens: 150,
        temperature: 0.7,
      });

      return (
        resposta.choices[0].message.content?.trim() ||
        'Nenhuma recomendação disponível.'
      );
    } catch (error) {
      // console.error('ERRO OPENAI:', error);
      throw error instanceof HttpException
        ? error
        : new InternalServerErrorException(
            error.message || 'Erro ao gerar recomendação de livro',
          );
    }
  }
}
