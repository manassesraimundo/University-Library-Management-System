import {
  HttpException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { MembrosService } from 'src/membros/membros.service';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';

@Injectable()
export class RecomendacaoService {
  private googleAI: GoogleGenerativeAI;
  private model: GenerativeModel;

  constructor(
    private readonly prisma: PrismaService,
    private readonly membroService: MembrosService,
    private readonly configService: ConfigService,
  ) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');

    if (!apiKey)
      throw new InternalServerErrorException(
        'A chave da API OpenAI não foi configurada.',
      );

    this.googleAI = new GoogleGenerativeAI(apiKey);
    this.model = this.googleAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      systemInstruction: 'Você é um bibliotecário prestativo. Recomende apenas DOIS a TRÊS livros das opções fornecidas, justificando brevemente em uma frase.',
    });
  }

  async gerarRecomendacao(membroId: number) {
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
        .join(', ');

      const livrosDisponiveis = await this.prisma.livro.findMany({
        where: {
          id: { notIn: historicoEmprestimos.map((e) => e.livroId) },
        },
        take: 5,
      });

      const listaOpcoes = livrosDisponiveis
        .map((l) => l.titulo)
        .join(', ');

      const prompt = `Com base no histórico de leitura do membro (${livrosLidos}), recomende DOIS a TRÊS livros das seguintes opções disponíveis: ${listaOpcoes}. Justifique brevemente cada recomendação.`;

      const result = await this.model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          maxOutputTokens: 20900,
          temperature: 0.7,
        },
      });

      const response = result.response;
      return response.text() || 'Nenhuma recomendação disponível.';
    } catch (error) {
      console.error('ERRO GEMINI:', error);
      throw error instanceof HttpException
        ? error
        : new InternalServerErrorException(
          error.message || 'Erro ao gerar recomendação de livro',
        );
    }
  }
}
