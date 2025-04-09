import { faker } from '@faker-js/faker';
import { SignUpDto } from '../src/auth/dto/signUp.dto';
import { LoginDto } from '../src/auth/dto/login.dto';
import { RefreshTokenDto } from '../src/auth/dto/refreshToken.dto';
import { ForgotPasswordDto } from '../src/auth/dto/forgotPassword.dto';
import { ResendVerificationEmailDto } from '../src/auth/dto/resendVerificationEmail.dto';
import { VerifyEmailDto } from '../src/auth/dto/verifyEmail.dto';
import { ResetPasswordDto } from '../src/auth/dto/resetPassword.dto';

export interface AuthDtoMocks {
  signUp: SignUpDto;
  login: LoginDto;
  refreshToken: RefreshTokenDto;
  forgotPassword: ForgotPasswordDto;
  resendVerificationEmail: ResendVerificationEmailDto;
  verifyEmail: VerifyEmailDto;
  resetPassword: ResetPasswordDto;
}

export class AuthTestFactory {
  private static generatePassword() {
    return faker.internet.password({
      length: 12,
    });
  }

  static createSignUp(overrides: Partial<SignUpDto> = {}): SignUpDto {
    return {
      email: faker.internet.email(),
      password: overrides.password || this.generatePassword(),
      name: faker.person.fullName(),
      ...overrides,
    };
  }

  static createLogin(overrides: Partial<LoginDto> = {}): LoginDto {
    return {
      email: overrides.email || faker.internet.email(),
      password: overrides.password || this.generatePassword(),
      ...overrides,
    };
  }

  static createRefreshToken(token = faker.string.uuid()): RefreshTokenDto {
    return { refreshToken: token };
  }

  static createForgotPassword(
    overrides: Partial<ForgotPasswordDto> = {},
  ): ForgotPasswordDto {
    return {
      email: overrides.email || faker.internet.email(),
    };
  }

  static createResendVerificationEmail(
    overrides: Partial<ResendVerificationEmailDto> = {},
  ): ResendVerificationEmailDto {
    return {
      email: overrides.email || faker.internet.email(),
    };
  }

  static createVerifyEmail(token = faker.string.uuid()): VerifyEmailDto {
    return { token };
  }

  static createResetPassword(
    overrides: Partial<ResetPasswordDto> = {},
  ): ResetPasswordDto {
    return {
      token: overrides.token || faker.string.uuid(),
      newPassword: overrides.newPassword || this.generatePassword(),
    };
  }

  static createAll(overrides: Partial<SignUpDto> = {}): AuthDtoMocks {
    const signUp = this.createSignUp(overrides);

    return {
      signUp,
      login: this.createLogin({
        email: signUp.email,
        password: signUp.password,
      }),
      refreshToken: this.createRefreshToken(),
      forgotPassword: this.createForgotPassword({ email: signUp.email }),
      resendVerificationEmail: this.createResendVerificationEmail({
        email: signUp.email,
      }),
      verifyEmail: this.createVerifyEmail(),
      resetPassword: this.createResetPassword(),
    };
  }
}
