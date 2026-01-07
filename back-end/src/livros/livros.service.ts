import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class LivrosService {
    constructor(private prisma: PrismaService) {}
}
