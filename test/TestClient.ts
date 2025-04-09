import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { LoginDto } from '../src/auth/dto/login.dto';
import { SignUpDto } from '../src/auth/dto/signUp.dto';
import { VerifyEmailDto } from '../src/auth/dto/verifyEmail.dto';
import { ResendVerificationEmailDto } from '../src/auth/dto/resendVerificationEmail.dto';
import { ForgotPasswordDto } from '../src/auth/dto/forgotPassword.dto';
import { ResetPasswordDto } from '../src/auth/dto/resetPassword.dto';
import { RefreshTokenDto } from '../src/auth/dto/refreshToken.dto';

export class TestClient {
  constructor(private readonly app: INestApplication) {}

  private doRequest = (
    method: 'post' | 'put' | 'patch' | 'delete' | 'get',
    url: string,
    data?: object,
  ) => {
    const req = request(this.app.getHttpServer())[method](url);
    return data ? req.send(data) : req;
  };

  public auth = {
    login: (dto: LoginDto) => {
      return this.doRequest('post', '/auth/login', dto);
    },
    signUp: (dto: SignUpDto) => {
      return this.doRequest('post', '/auth/signUp', dto);
    },
    verifyEmail: (dto: VerifyEmailDto) => {
      return this.doRequest('post', '/auth/verifyEmail', dto);
    },
    resendVerificationEmail: (dto: ResendVerificationEmailDto) => {
      return this.doRequest('post', '/auth/resendVerificationEmail', dto);
    },
    forgotPassword: (dto: ForgotPasswordDto) => {
      return this.doRequest('post', '/auth/forgotPassword', dto);
    },
    resetPassword: (dto: ResetPasswordDto) => {
      return this.doRequest('post', '/auth/resetPassword', dto);
    },
    refreshToken: (dto: RefreshTokenDto) => {
      return this.doRequest('post', '/auth/refreshToken', dto);
    },
    getProfile: (accessToken: string) => {
      return this.doRequest('get', '/auth/profile').set({
        Authorization: `Bearer ${accessToken}`,
      });
    },
  };
}
