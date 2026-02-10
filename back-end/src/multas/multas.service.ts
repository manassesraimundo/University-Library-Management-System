import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class MultasService {
  constructor(private readonly prisma: PrismaService) {}

  async getMultas(pago: boolean) {
    try {
      const multas = await this.prisma.multa.findMany({
        // where: { paga: fa },
        include: {
          emprestimo: {
            include: {
              membro: { include: { usuario: { select: { nome: true } } } },
              exemplar: { include: { livro: { select: { titulo: true } } } },
            },
          },
        },
      });
      return multas;
    } catch (erro) {}
  }

  async processar(multaId: number) {
    try {
      const multas = await this.prisma.multa.findUnique({
        where: { id: multaId },
      });

      if (!multas) throw new NotFoundException();

      await this.prisma.multa.update({
        where: { id: multaId },
        data: { paga: true },
      });

      return { message: 'Multa processado com sucesso.' };
    } catch (erro) {}
  }

  async getMultasByMembro(matricula: string) {
    try {
      const multas = await this.prisma.multa.findMany({
        where: { emprestimo: { membro: { matricula: matricula } } },
        include: {
          emprestimo: {
            include: {
              membro: { include: { usuario: { select: { nome: true } } } },
              exemplar: { include: { livro: { select: { titulo: true } } } },
            },
          },
        },
      });

      return multas;
    } catch (error) {}
  }
}
