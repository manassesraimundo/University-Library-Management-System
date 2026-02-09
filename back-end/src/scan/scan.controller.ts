import {
  BadRequestException,
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ScanService } from './scan.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { Roles } from 'src/auth/decorators/roles';
import { AuthGuard } from 'src/auth/auth.guard';
import { RolesGuard } from 'src/auth/decorators/roles.guard';

@Controller('scan')
@UseGuards(AuthGuard, RolesGuard)
export class ScanController {
  constructor(private readonly scanService: ScanService) {}

  @Post()
  @Roles('BIBLIOTECARIO')
  @UseInterceptors(
    FileInterceptor('image', {
      fileFilter: (req, file, callback) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png)$/)) {
          return callback(
            new BadRequestException(
              'Apenas arquivos de imagem são permitidos!',
            ),
            false,
          );
        }
        callback(null, true);
      },
    }),
  )
  async scanLivro(@UploadedFile() file: Express.Multer.File) {
    const response = await this.scanService.scanLivro(file);
    return response;
  }
}
