import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { PrismaClient } from 'src/generated/prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  constructor(configService: ConfigService) {
    try {
      const dbUrl =
        configService.get<string>('DATABASE_URL') || 'file:./dev.db';

      const adapter = new PrismaBetterSqlite3({
        url: dbUrl,
      });

      super({ adapter });

      this.logger.log('Prisma Client initialized with Better SQLite3 adapter');
    } catch (error) {
      Logger.error(
        'Failed to initialize Prisma Client with Better SQLite3 adapter',
        error,
      );
      throw error;
    }
  }

  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log('Connected to the database successfully');
    } catch (error) {
      this.logger.error('Error connecting to the database:', error);
    }
  }

  async onModuleDestroy() {
    try {
      await this.$disconnect();
      this.logger.log('Disconnecting from the database...');
    } catch (error) {
      this.logger.error('Error during disconnection from the database:', error);
    }
  }
}
