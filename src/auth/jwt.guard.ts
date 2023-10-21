import {
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Injectable,
} from '@nestjs/common';
import { Request } from 'express';
import { TokenService } from './token.service';
import { AccessTokenPayload } from './types';

@Injectable()
export class JwtGuard implements CanActivate {
  constructor(private readonly tokenService: TokenService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context
      .switchToHttp()
      .getRequest<Request & { user?: AccessTokenPayload }>();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException();
    }

    try {
      const payload = await this.tokenService.verifyAccessToken(token);
      request.user = payload;
      // does it make sense to get user from db and attach it to request?
    } catch (e) {
      throw new UnauthorizedException();
    }

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const authorizationHeader = request.headers['authorization'];
    if (!authorizationHeader) {
      return;
    }

    const [type, token] = authorizationHeader.split(' ');
    return type === 'Bearer' ? token : undefined;
  }
}
