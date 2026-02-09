import {
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { MembrosService } from 'src/membros/membros.service';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';
import { StatusLivro } from 'src/generated/prisma/enums';

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
      systemInstruction:
        'Você é um bibliotecário prestativo. Recomende apenas DOIS a TRÊS livros das opções fornecidas, justificando brevemente em uma frase.',
    });
  }

  async gerarRecomendacao(membroId: number) {
    try {
      const membro = await this.membroService.getMembroById(membroId);
      if (!membro) throw new NotFoundException('Membro não encontrado');

      const historicoLeitura = await this.prisma.historicoLeitura.findMany({
        where: { membroId },
        include: {
          exemplar: {
            include: {
              livro: { include: { autor: true, categoria: true } },
            },
          },
        },
        orderBy: { data: 'desc' },
        take: 10,
      });

      const idsLivrosLidos = historicoLeitura.map((h) => h.exemplar.livro.id);
      const livrosLidosInfo = historicoLeitura
        .map(
          (h) =>
            `"${h.exemplar.livro.titulo}" (Gênero: ${h.exemplar.livro.categoria.nome})`,
        )
        .join(', ');

      const livrosParaOpcoes = await this.prisma.livro.findMany({
        where: {
          id: { notIn: idsLivrosLidos },
          exemplares: {
            some: { status: StatusLivro.DISPONIVEL },
          },
        },
        include: { autor: true, categoria: true },
        take: 8,
      });

      if (livrosParaOpcoes.length === 0) {
        return 'No momento não temos livros disponíveis para recomendação baseada no seu perfil.';
      }

      const listaOpcoesPrompt = livrosParaOpcoes
        .map((l) => `- "${l.titulo}"`)
        .join('\n');

      const prompt = `
      Você é um bibliotecário inteligente. 
      Com base no histórico de leitura do membro: ${livrosLidosInfo || 'Ainda não possui histórico (recomende sucessos gerais)'}.
      
      Recomende DOIS a TRÊS livros das seguintes opções disponíveis:
      ${listaOpcoesPrompt}
      
      Justifique cada escolha com base no gênero ou autor.
    `;

      const result = await this.model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.7, maxOutputTokens: 23900 },
      });

      return result.response.text() || 'Nenhuma recomendação disponível.';
    } catch (error) {
      throw error instanceof HttpException
        ? error
        : new InternalServerErrorException(
            'Erro ao gerar recomendação inteligente',
          );
    }
  }
}
