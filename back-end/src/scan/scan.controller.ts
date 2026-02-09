import { BadRequestException, Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { ScanService } from './scan.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { Public } from 'src/auth/decorators/roles';

@Controller('scan')
@Public()
export class ScanController {
    constructor(private readonly scanService: ScanService) { }

    @Post()
    @UseInterceptors(FileInterceptor('image', {
        fileFilter: (req, file, callback) => {
            if (!file.mimetype.match(/\/(jpg|jpeg|png)$/)) {
                return callback(new BadRequestException('Apenas arquivos de imagem são permitidos!'), false);
            }
            callback(null, true);
        }
    }))
    async scanLivro(@UploadedFile() file: Express.Multer.File) {
        const response = await this.scanService.scanLivro(file);

        console.log(response)
        return response;
    }
}
