import {
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ChatbotDto } from './dto/chatbot.dto';
import { MembrosService } from 'src/membros/membros.service';
import { StatusLivro } from 'src/generated/prisma/enums';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';

@Injectable()
export class ChatbotService {
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
    });
  }

  async conversar(dto: ChatbotDto): Promise<{ response: string }> {
    try {
      const membro = await this.membroService.getMembroById(dto.membroId);

      if (!membro)
        throw new NotFoundException('Membro não encontrado para o chat.');

      const [emprestimos, livrosDisponiveis, historicoBanco] =
        await Promise.all([
          this.prisma.emprestimo.findMany({
            where: { membroId: dto.membroId },
            include: {
              livro: true,
            },
          }),
          this.prisma.livro.findMany({
            where: { status: StatusLivro.DISPONIVEL },
            take: 10,
          }),
          this.prisma.chatMensagem.findMany({
            where: { membroId: dto.membroId },
            orderBy: { criadoEm: 'asc' },
            take: 6,
          }),
        ]);

      const history = historicoBanco.map((msg) => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }],
      }));

      const nomeUsuario = membro.usuario?.nome ?? 'Membro da Biblioteca';
      const listaEmprestimos =
        emprestimos.length > 0
          ? emprestimos
            .map(
              (e) =>
                `- ${e.livro.titulo} (Devolver em: ${e.dataPrevista.toLocaleDateString('pt-BR')})`,
            )
            .join('\n')
          : 'O membro não possui livros emprestados no momento.';

      const systemPrompt = `Você é um assistente virtual da Biblioteca Universitária. 
Responda de forma clara e profissional. 

Membro: ${nomeUsuario}
Empréstimos Ativos:
${listaEmprestimos}

Catálogo Disponível (Sugestões):
${livrosDisponiveis.map((l) => `- ${l.titulo}`).join('\n')}

IMPORTANTE: Se o usuário perguntar sobre renovação ou multas, informe que ele deve procurar o balcão físico ou usar o menu do sistema.`;

      const chatSession = this.model.startChat({
        history: history,
        systemInstruction: {
          role: 'system',
          parts: [{ text: systemPrompt }],
        },
      });

      const response = await chatSession.sendMessage(dto.message);
      const responseAI = response.response.text();

      await this.prisma.chatMensagem.createMany({
        data: [
          { membroId: dto.membroId, role: 'user', content: dto.message },
          { membroId: dto.membroId, role: 'model', content: responseAI },
        ],
      });

      return {
        response: responseAI,
      };
    } catch (error) {
      console.log(error);
      throw error instanceof HttpException
        ? error
        : new InternalServerErrorException(
          'Erro na comunicação com o assistente inteligente.',
        );
    }
  }

  async getConversas(membroId: number) {
    try {
      const mensagens = await this.prisma.chatMensagem.findMany({
        where: { membroId },
        orderBy: { criadoEm: 'asc' },
      });

      return mensagens.map((msg) => ({
        role: msg.role,
        content: msg.content,
        criadoEm: msg.criadoEm,
      }));
    } catch (error) {
      console.log(error);
      throw error instanceof HttpException
        ? error
        : new InternalServerErrorException(
          'Erro ao buscar o histórico de conversas.',
        );
    }
  }

  async clearChat(membroId: number): Promise<{ message: string }> {
    try {
      await this.prisma.chatMensagem.deleteMany({
        where: { membroId },
      });

      return { message: 'Histórico de conversa limpo.' };
    } catch (error) {
      throw error instanceof HttpException
        ? error
        : new InternalServerErrorException(
          'Erro ao deletar o Histórico de conversa.',
        );
    }
  }
}
