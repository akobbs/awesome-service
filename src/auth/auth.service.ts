import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { SignUpDto } from './dto/signUp.dto';
import { LoginDto } from './dto/login.dto';
import { TokenService } from './token.service';
import { PasswordService } from './password.service';
import { RefreshTokenDto } from './dto/refreshToken.dto';
import { User } from '../users/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly tokenService: TokenService,
    private readonly passwordService: PasswordService,
  ) {}

  public async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const user = await this.usersService.findByEmail(email);
    if (!user) {
      return this.throwInvalidCredentialsException();
    }

    const isCorrectPassword = await this.passwordService.verifyPassword(
      password,
      user.password,
    );

    if (!isCorrectPassword) {
      return this.throwInvalidCredentialsException();
    }

    return await this.generateTokens(user);
  }

  public async signUp(signUpDto: SignUpDto): Promise<User> {
    const hashedPassword = await this.passwordService.hashPassword(
      signUpDto.password,
    );

    const newUser = await this.usersService.create({
      ...signUpDto,
      password: hashedPassword,
    });

    return newUser;
  }

  public async refreshToken(refreshTokenDto: RefreshTokenDto) {
    const refreshToken = await this.tokenService.verifyRefreshToken(
      refreshTokenDto.refreshToken,
    );

    if (!refreshToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const user = refreshToken.user;

    await this.tokenService.deleteRefreshToken(
      refreshTokenDto.refreshToken,
      user.id,
    );

    return await this.generateTokens(user);
  }

  private async generateTokens(user: User) {
    const [newAccessToken, newRefreshToken] = await Promise.all([
      this.tokenService.createAccessToken(user),
      this.tokenService.createRefreshToken(user),
    ]);

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  private throwInvalidCredentialsException(): never {
    throw new UnauthorizedException('Invalid credentials');
  }
}
