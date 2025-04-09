import { INestApplication } from '@nestjs/common';
import { AuthTestFactory } from '../auth.factory';
import { TestClient } from '../TestClient';
import { createTestApp } from '../utils/createTestApp';
import { Repository } from 'typeorm';
import { User } from '../../src/users/user.entity';
import { getRepository } from '../utils/utils';

describe('POST /auth/signUp (e2e)', () => {
  let app: INestApplication;
  let client: TestClient;
  let userRepo: Repository<User>;

  beforeAll(async () => {
    app = await createTestApp();
    client = new TestClient(app);
    userRepo = getRepository(app, User);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Positive', () => {
    it('should create a user, return correct data, and persist to DB', async () => {
      const dto = AuthTestFactory.createSignUp();

      const res = await client.auth.signUp(dto).expect(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body.email).toBe(dto.email);
      expect(res.body.name).toBe(dto.name);

      const user = await userRepo.findOneBy({ email: dto.email });
      expect(user).toBeTruthy();
      expect(user!.password).not.toBe(dto.password);
    });
  });

  describe('Negative', () => {
    it('should reject duplicate email with 409', async () => {
      const dto = AuthTestFactory.createSignUp();

      await client.auth.signUp(dto).expect(201);
      await client.auth.signUp(dto).expect(409);
    });

    it('should reject invalid email', async () => {
      const dto = AuthTestFactory.createSignUp({ email: 'not-an-email' });
      const res = await client.auth.signUp(dto).expect(400);
      expect(res.body.message).toContainEqual('email must be an email');
    });

    it('should reject missing email', async () => {
      const dto = AuthTestFactory.createSignUp({ email: undefined });
      const res = await client.auth.signUp(dto).expect(400);
      expect(res.body.message).toContainEqual('email should not be empty');
    });

    it('should reject short password', async () => {
      const dto = AuthTestFactory.createSignUp({ password: '123' });
      const res = await client.auth.signUp(dto).expect(400);
      expect(res.body.message).toContainEqual(
        'Password should be at least 8 characters long',
      );
    });

    it('should reject missing password', async () => {
      const dto = AuthTestFactory.createSignUp({ password: undefined });
      const res = await client.auth.signUp(dto).expect(400);
      expect(res.body.message).toContainEqual('password should not be empty');
    });

    it('should reject missing name', async () => {
      const dto = AuthTestFactory.createSignUp({ name: undefined });
      const res = await client.auth.signUp(dto).expect(400);
      expect(res.body.message).toContainEqual('name should not be empty');
    });
  });
});
