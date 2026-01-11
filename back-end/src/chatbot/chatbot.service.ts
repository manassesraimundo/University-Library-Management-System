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
import OpenAI from 'openai';

@Injectable()
export class ChatbotService {
  private openAI: OpenAI;

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

    this.openAI = new OpenAI({ apiKey });
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

      const historicoIA = historicoBanco.map((msg) => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
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
Responda de forma clara e profissional. Use o histórico abaixo para ajudar o usuário.

Membro: ${nomeUsuario}
Empréstimos Ativos:
${listaEmprestimos}

Catálogo Disponível (Sugestões):
${livrosDisponiveis.map((l) => `- ${l.titulo}`).join('\n')}

IMPORTANTE: Se o usuário perguntar sobre renovação ou multas, informe que ele deve procurar o balcão físico ou usar o menu do sistema.`;

      const response = await this.openAI.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          ...historicoIA,
          { role: 'user', content: dto.message },
        ],
      });

      const responseAI =
        response.choices[0].message.content ||
        'Desculpe, não consegui processar sua resposta.';

      await this.prisma.chatMensagem.createMany({
        data: [
          { membroId: dto.membroId, role: 'user', content: dto.message },
          { membroId: dto.membroId, role: '', content: responseAI },
        ],
      });

      return {
        response: responseAI,
      };
    } catch (error) {
      throw error instanceof HttpException
        ? error
        : new InternalServerErrorException(
            'Erro na comunicação com o assistente inteligente.',
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
