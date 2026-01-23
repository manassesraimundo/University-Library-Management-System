import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { IS_PUBLIC_KEY } from './decorators/roles';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ispublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!ispublic) {
      const request = context.switchToHttp().getRequest<Request>();
      const toke = request.cookies.access_token || undefined;

      if (!toke)
        throw new UnauthorizedException('Token não encontrado nos cookies');

      try {
        const payload = await this.jwtService.verifyAsync(toke, {
          algorithms: ['HS256'],
          secret: this.configService.get<string>('JWT_SICRET'),
        });

        request['user'] = payload;

        return true;
      } catch (error) {
        throw new UnauthorizedException('Token inválido ou expirado');
      }
    }
    return true;
  }
}
