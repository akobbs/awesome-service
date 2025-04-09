import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { SignUpDto } from './dto/signUp.dto';
import { LoginDto } from './dto/login.dto';
import { TokenService } from './token.service';
import { PasswordService } from './password.service';
import { RefreshTokenDto } from './dto/refreshToken.dto';
import { User } from '../users/user.entity';
import { MailService } from '../mail/mail.service';
import { ResendVerificationEmailDto } from './dto/resendVerificationEmail.dto';
import { VerifyEmailDto } from './dto/verifyEmail.dto';
import { ForgotPasswordDto } from './dto/forgotPassword.dto';
import { ResetPasswordDto } from './dto/resetPassword.dto';
import { Result } from '../common/types';
import { err, ok } from '../common/utils';
import {
  EmailAlreadyExistsError,
  InvalidCredentialsError,
  UnknownError,
} from '../common/errors';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly tokenService: TokenService,
    private readonly passwordService: PasswordService,
    private readonly mailService: MailService,
  ) {}

  public async login(
    loginDto: LoginDto,
  ): Promise<
    Result<
      { accessToken: string; refreshToken: string },
      InvalidCredentialsError
    >
  > {
    const { email, password } = loginDto;

    const user = await this.usersService.findByEmail(email);
    if (!user) {
      return err(new InvalidCredentialsError());
    }

    const isCorrectPassword = await this.passwordService.verifyPassword(
      password,
      user.password,
    );

    if (!isCorrectPassword) {
      return err(new InvalidCredentialsError());
      // return AuthService.throwInvalidCredentialsException();
    }

    const tokens = await this.generateTokens(user);
    return ok(tokens);
  }

  public async signUp(
    signUpDto: SignUpDto,
  ): Promise<Result<User, EmailAlreadyExistsError | UnknownError>> {
    const hashedPassword = await this.passwordService.hashPassword(
      signUpDto.password,
    );

    const createUserResult = await this.usersService.create({
      ...signUpDto,
      password: hashedPassword,
    });

    if (!createUserResult.ok) {
      return err(createUserResult.error);
    }

    const newUser = createUserResult.value;
    const token = await this.tokenService.createEmailVerificationToken(newUser);
    await this.mailService.sendEmailConfirmation(newUser, token);

    return ok(newUser);
  }

  public async verifyEmail(verifyEmailDto: VerifyEmailDto) {
    const token = await this.tokenService.findEmailVerificationToken(
      verifyEmailDto.token,
    );

    if (!token) {
      return AuthService.throwEmailNotVerifiedException();
    }

    if (this.tokenService.isTokenExpired(token)) {
      return AuthService.throwEmailNotVerifiedException();
    }

    const { user } = token;

    if (!user.isEmailVerified) {
      await this.usersService.changeEmailVerificationStatus(user, true);
    }

    await this.tokenService.deleteToken(token);

    return { message: 'Email verified successfully' };
  }

  public async resendVerificationEmail(
    resendVerificationEmailDto: ResendVerificationEmailDto,
  ) {
    const user = await this.usersService.findByEmail(
      resendVerificationEmailDto.email,
    );

    if (!user) {
      return { message: 'Email sent successfully' };
    }

    const token = await this.tokenService.createEmailVerificationToken(user);
    await this.mailService.sendEmailConfirmation(user, token);

    return { message: 'Email sent successfully' };
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

  public async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const user = await this.usersService.findByEmail(forgotPasswordDto.email);
    if (!user) {
      return { message: 'Password reset email sent' };
    }

    const token = await this.tokenService.createPasswordResetToken(user);
    await this.mailService.sendPasswordReset(user, token);

    return { message: 'Password reset email sent' };
  }

  public async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const token = await this.tokenService.findPasswordResetToken(
      resetPasswordDto.token,
    );

    if (!token) {
      throw new UnauthorizedException('Invalid or expired reset token');
    }

    if (this.tokenService.isTokenExpired(token)) {
      throw new UnauthorizedException('Invalid or expired reset token');
    }

    const user = token.user;

    const hashedPassword = await this.passwordService.hashPassword(
      resetPasswordDto.newPassword,
    );

    await this.usersService.changePassword(user, hashedPassword);
    await this.tokenService.deleteToken(token);

    return { message: 'Password updated successfully.' };
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

  private static throwInvalidCredentialsException(): never {
    throw new UnauthorizedException('Invalid credentials');
  }

  private static throwEmailNotVerifiedException(): never {
    throw new UnauthorizedException('Email not verified');
  }
}
