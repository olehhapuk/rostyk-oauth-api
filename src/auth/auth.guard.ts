import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from './auth.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest<Request>();

    const authHeader = req.headers.authorization;
    if (!authHeader) {
      throw new UnauthorizedException();
    }

    const authToken = authHeader.replace('Bearer ', '');
    if (!authToken) {
      throw new UnauthorizedException();
    }

    try {
      const payload = await this.authService.verifyJwt(authToken);

      req.userId = payload.userId;

      return true;
    } catch {
      throw new UnauthorizedException();
    }
  }
}
