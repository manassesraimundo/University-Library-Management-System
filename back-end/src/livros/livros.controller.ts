import { Controller, Get } from '@nestjs/common';
import { LivrosService } from './livros.service';

@Controller('livros')
export class LivrosController {
    constructor(private readonly livrosService: LivrosService) {}

    @Get()
    async findAll() {
        return 'This method is not implemented yet.';
    }
}
