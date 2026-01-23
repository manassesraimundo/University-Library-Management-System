import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './roles';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler() || context.getClass()],
    );

    if (!requiredRoles) return true;

    const { user } = context.switchToHttp().getRequest();

    if (user?.role === 'ADMIN') return true;

    // 3. Verifica se a role do usuário está na lista permitida
    const hasRole = requiredRoles.some((role) => user?.role === role);

    if (!hasRole)
      throw new ForbiddenException('Acesso negado: privilégios insuficientes');

    return true;
  }
}
