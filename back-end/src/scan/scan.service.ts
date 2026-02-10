import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ScanService {
  private readonly logger = new Logger(ScanService.name);
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');

    if (!apiKey) {
      throw new Error(
        'GEMINI_API_KEY não encontrada nas variáveis de ambiente',
      );
    }

    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
  }

  async scanLivro(file: Express.Multer.File) {
    try {
      // Converte o buffer do Multer para o formato esperado pelo Gemini
      const imagePart = {
        inlineData: {
          data: file.buffer.toString('base64'),
          mimeType: file.mimetype,
        },
      };

      const prompt = `
        Analise a imagem desta capa de livro e extraia as seguintes informações em formato JSON:
        - titulo (título completo do livro)
        - autores (lista de autores)
        - editora (nome da editora)
        - isbn (se visível, caso contrário null)
        
        Importante: Ignore textos que pareçam ser de abas de navegador, menus de sistema ou elementos externos ao livro físico.
        Responda APENAS o JSON puro.
      `;

      const result = await this.model.generateContent([prompt, imagePart]);
      const response = await result.response;
      const text = response.text();

      // Limpa a resposta para garantir que seja um JSON válido
      const cleanJson = text.replace(/```json|```/g, '').trim();
      const extracao = JSON.parse(cleanJson);

      // Se o Gemini não encontrar o ISBN (comum em capas), usamos o título para buscar na API
      if (!extracao.isbn && extracao.titulo) {
        this.logger.log(
          `ISBN não encontrado na imagem. Buscando dados para: ${extracao.titulo}`,
        );
        const infoCompleta = await this.buscarNoGoogleBooks(
          extracao.titulo,
          extracao.autores?.[0],
          extracao.isbn,
        );
        return infoCompleta
          ? { ...infoCompleta, encontrado: true }
          : { ...extracao, encontrado: true };
      }

      return { ...extracao, encontrado: true };
    } catch (error) {
      this.logger.error('Erro no processamento com Gemini:', error);
      throw new InternalServerErrorException('Falha ao analisar imagem com IA');
    }
  }

  private async buscarNoGoogleBooks(
    titulo: string,
    autor?: string,
    isbn?: string,
  ) {
    const query = autor
      ? `intitle:${titulo}+inauthor:${autor}`
      : `intitle:${titulo}`;
    const res = await fetch(
      `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}`,
    );
    const data = await res.json();

    if (!data.items?.length) return null;

    const v = data.items[0].volumeInfo;
    return {
      titulo: v.title,
      autores: v.authors[0],
      editora: v.publisher,
      isbn: v.industryIdentifiers?.find((id) => id.type.includes('ISBN'))
            ?.identifier || null,
    };
  }
}
