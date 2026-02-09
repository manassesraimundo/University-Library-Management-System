import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import Tesseract from 'tesseract.js';

@Injectable()
export class ScanService {
    private readonly logger = new Logger(ScanService.name);

    async scanLivro(file: Express.Multer.File) {
        try {
            const { data: { text } } = await Tesseract.recognize(file.buffer, 'por+eng');
            
            const isbn = this.extrairISBN(text);
            if (!isbn) return { textoExtraido: text, encontrado: false };

            const info = await this.buscarNoGoogleBooks(isbn);
            return info ? { ...info, encontrado: true } : { isbn, encontrado: false };
            
        } catch (error) {
            this.logger.error('Erro no OCR:', error);
            throw new InternalServerErrorException('Falha ao processar imagem');
        }
    }

    private extrairISBN(texto: string): string | null {
        const match = texto.match(/ISBN(?:-1[03])?:?\s?([0-9- ]{10,17})/i);
        return match ? match[1].replace(/[- ]/g, '') : null;
    }

    private async buscarNoGoogleBooks(isbn: string) {
        const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`);
        const data = await res.json();
        if (!data.items?.length) return null;
        
        const v = data.items[0].volumeInfo;
        return { titulo: v.title, autores: v.authors, editora: v.publisher, isbn };
    }
}