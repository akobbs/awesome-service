import { INestApplication } from '@nestjs/common';
import { TestClient } from './TestClient';
import { AuthTestFactory } from './auth.factory';
import { SignUpDto } from '../src/auth/dto/signUp.dto';
import { VerifyEmailDto } from '../src/auth/dto/verifyEmail.dto';
import { ResetPasswordDto } from '../src/auth/dto/resetPassword.dto';

export class TestUser {
  public readonly client: TestClient;
  public readonly user: SignUpDto;
  public userId: string;
  public accessToken: string;
  public refreshToken: string;

  constructor(private readonly app: INestApplication) {
    this.client = new TestClient(app);
    this.user = AuthTestFactory.createSignUp();
  }

  async register(): Promise<this> {
    const res = await this.client.auth.signUp(this.user).expect(201);
    this.userId = res.body.id;
    return this;
  }

  async login(): Promise<this> {
    const res = await this.client.auth
      .login({
        email: this.user.email,
        password: this.user.password,
      })
      .expect(200);

    this.accessToken = res.body.accessToken;
    this.refreshToken = res.body.refreshToken;
    return this;
  }

  async refresh(): Promise<this> {
    const res = await this.client.auth
      .refreshToken({
        refreshToken: this.refreshToken,
      })
      .expect(200);

    this.accessToken = res.body.accessToken;
    return this;
  }

  async getProfile(): Promise<this> {
    const res = await this.client.auth.getProfile(this.accessToken).expect(200);
    expect(res.body.email).toBe(this.user.email);
    return this;
  }

  async resendVerificationEmail(): Promise<this> {
    await this.client.auth
      .resendVerificationEmail({ email: this.user.email })
      .expect(200);
    return this;
  }

  async verifyEmail(token: string): Promise<this> {
    const dto: VerifyEmailDto = { token };
    await this.client.auth.verifyEmail(dto).expect(200);
    return this;
  }

  async forgotPassword(): Promise<this> {
    await this.client.auth
      .forgotPassword({ email: this.user.email })
      .expect(200);
    return this;
  }

  async resetPassword(token: string, newPassword: string): Promise<this> {
    const dto: ResetPasswordDto = {
      token,
      newPassword,
    };
    await this.client.auth.resetPassword(dto).expect(200);
    return this;
  }
}
