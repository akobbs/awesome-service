import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '../users/user.entity';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { RefreshToken } from './entities/refreshToken.entity';
import { Repository } from 'typeorm';
import { AccessTokenPayload, RefreshTokenPayload, TokenType } from './types';
import { v4 as uuidv4 } from 'uuid';
import { Token } from './entities/token.entity';

@Injectable()
export class TokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>,
    @InjectRepository(Token)
    private readonly tokenRepository: Repository<Token>,
  ) {}

  public async createPasswordResetToken(user: User) {
    const token = uuidv4();

    await this.tokenRepository.save({
      token,
      type: TokenType.PASSWORD_RESET,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      user,
    });

    return token;
  }

  public async createEmailVerificationToken(user: User) {
    const token = uuidv4();

    await this.tokenRepository.save({
      token,
      type: TokenType.EMAIL_VERIFICATION,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      user,
    });

    return token;
  }

  public isTokenExpired(token: Token): boolean {
    return token.expiresAt.getTime() < Date.now();
  }

  public async findEmailVerificationToken(token: string) {
    const tokenEntity = await this.tokenRepository.findOne({
      where: {
        token,
        type: TokenType.EMAIL_VERIFICATION,
      },
      relations: ['user'],
    });

    return tokenEntity;
  }

  public async findPasswordResetToken(token: string) {
    const tokenEntity = await this.tokenRepository.findOne({
      where: {
        token,
        type: TokenType.PASSWORD_RESET,
      },
      relations: ['user'],
    });

    return tokenEntity;
  }

  public async deleteToken(token: Token) {
    await this.tokenRepository.remove(token);
  }

  public async createAccessToken(user: User) {
    const accessToken = await this.jwtService.signAsync(
      {
        sub: user.id,
        email: user.email,
      },
      {
        secret: this.configService.get('JWT_ACCESS_TOKEN_SECRET'),
        expiresIn: this.configService.get('JWT_ACCESS_TOKEN_EXPIRATION_TIME'),
      },
    );

    return accessToken;
  }

  public async verifyAccessToken(accessToken: string) {
    const payload = await this.jwtService.verifyAsync<AccessTokenPayload>(
      accessToken,
      {
        secret: this.configService.get('JWT_ACCESS_TOKEN_SECRET'),
      },
    );

    return payload;
  }

  public async createRefreshToken(user: User) {
    const token = await this.jwtService.signAsync(
      {
        sub: user.id,
        email: user.email,
      },
      {
        secret: this.configService.get('JWT_REFRESH_TOKEN_SECRET'),
        expiresIn: this.configService.get('JWT_REFRESH_TOKEN_EXPIRATION_TIME'),
      },
    );

    await this.refreshTokenRepository.save({
      user,
      token,
    });

    return token;
  }

  public async verifyRefreshToken(token: string): Promise<RefreshToken | null> {
    try {
      const refreshTokenPayload =
        await this.jwtService.verifyAsync<RefreshTokenPayload>(token, {
          secret: this.configService.get('JWT_REFRESH_TOKEN_SECRET'),
        });

      const refreshToken = await this.findRefreshToken(
        token,
        refreshTokenPayload.sub,
      );

      return refreshToken;
    } catch (e) {
      return null;
    }
  }

  public async deleteRefreshToken(token: string, userId: number) {
    const deleteResult = await this.refreshTokenRepository.delete({
      token,
      user: {
        id: userId,
      },
    });

    return (deleteResult.affected ?? 0) > 0;
  }

  private async findRefreshToken(
    token: string,
    userId: number,
  ): Promise<RefreshToken | null> {
    const refreshToken = await this.refreshTokenRepository.findOne({
      where: {
        token,
        user: {
          id: userId,
        },
      },
      relations: ['user'],
    });

    return refreshToken;
  }
}
