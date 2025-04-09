import { INestApplication } from '@nestjs/common';
import { Repository } from 'typeorm';
import { createTestApp } from '../utils/createTestApp';
import { TestClient } from '../TestClient';
import { getRepository } from '../utils/utils';
import { AuthTestFactory } from '../auth.factory';
import { RefreshToken } from '../../src/auth/entities/refreshToken.entity';

describe('POST /auth/login (e2e)', () => {
  let app: INestApplication;
  let client: TestClient;
  let refreshTokenRepo: Repository<RefreshToken>;

  beforeAll(async () => {
    app = await createTestApp();
    client = new TestClient(app);
    refreshTokenRepo = getRepository(app, RefreshToken);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Positive', () => {
    it('should log in a user with valid credentials and return tokens', async () => {
      const signUpDto = AuthTestFactory.createSignUp();
      const loginDto = { email: signUpDto.email, password: signUpDto.password };

      // First, register the user
      const signupResponse = await client.auth.signUp(signUpDto).expect(201);

      // Then, attempt to log in
      const res = await client.auth.login(loginDto).expect(200);

      expect(res.body).toHaveProperty('accessToken');
      expect(res.body).toHaveProperty('refreshToken');

      const refreshToken = await refreshTokenRepo.findOneBy({
        token: res.body.refreshToken,
        user: { id: signupResponse.body.id },
      });
      expect(refreshToken).toBeTruthy();
    });
  });

  describe('Negative', () => {
    it('should return 401 for non-existent user', async () => {
      const loginDto = AuthTestFactory.createLogin({
        email: 'nonexistent@example.com',
        password: 'password123',
      });

      const res = await client.auth.login(loginDto).expect(401);

      expect(res.body.message).toMatch(/invalid credentials/i);
    });

    it('should return 401 for incorrect password', async () => {
      const signUpDto = AuthTestFactory.createSignUp();
      const incorrectLoginDto = {
        email: signUpDto.email,
        password: 'wrongpassword',
      };

      // Register the user
      await client.auth.signUp(signUpDto).expect(201);

      // Attempt to log in with incorrect password
      const res = await client.auth.login(incorrectLoginDto).expect(401);

      expect(res.body.message).toMatch(/invalid credentials/i);
    });

    it('should return 400 for invalid email format', async () => {
      const invalidLoginDto = AuthTestFactory.createLogin({
        email: 'invalid-email',
        password: 'password123',
      });

      const res = await client.auth.login(invalidLoginDto).expect(400);

      expect(res.body.message).toContainEqual('email must be an email');
    });

    it('should return 400 for missing password', async () => {
      const loginDto = AuthTestFactory.createLogin({ password: undefined });

      const res = await client.auth.login(loginDto).expect(400);

      expect(res.body.message).toContainEqual('password should not be empty');
    });
  });
});
