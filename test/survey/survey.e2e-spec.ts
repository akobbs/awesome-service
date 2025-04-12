import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { CreateSurveyDto } from '../../src/survey/dto/create-survey.dto';
import { createTestApp } from '../utils/createTestApp';
import { randomUUID } from 'crypto';

const createSurveyDto = (
  override?: Partial<CreateSurveyDto>,
): CreateSurveyDto => ({
  title: 'Customer Satisfaction',
  description: 'Quick survey to rate our service',
  status: 'active',
  expiresAt: new Date(Date.now() + 86400000).toISOString(), // +1 day
  questions: [
    {
      text: 'How satisfied are you?',
      type: 'scale',
      scaleMin: 1,
      scaleMax: 5,
      order: 1,
    },
    {
      text: 'What can we improve?',
      type: 'text',
      order: 2,
    },
  ],
  ...override,
});

describe('SurveyController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /surveys', () => {
    it('should create a survey successfully', async () => {
      const dto = createSurveyDto();

      const res = await request(app.getHttpServer())
        .post('/surveys')
        .send(dto)
        .expect(201);

      expect(res.body).toHaveProperty('uuid');
    });
  });

  describe('GET /surveys', () => {
    it('should return paginated surveys', async () => {
      await request(app.getHttpServer())
        .post('/surveys')
        .send(createSurveyDto());
      await request(app.getHttpServer())
        .post('/surveys')
        .send(createSurveyDto());

      const res = await request(app.getHttpServer())
        .get('/surveys?page=1&limit=1')
        .expect(200);

      expect(res.body).toHaveProperty('items');
      expect(res.body.items.length).toBeLessThanOrEqual(1);
    });
  });

  describe('GET /surveys/:uuid', () => {
    it('should return a specific survey by UUID', async () => {
      const createRes = await request(app.getHttpServer())
        .post('/surveys')
        .send(createSurveyDto())
        .expect(201);

      const uuid = createRes.body.uuid;

      const getRes = await request(app.getHttpServer())
        .get(`/surveys/${uuid}`)
        .expect(200);

      expect(getRes.body).toHaveProperty('uuid', uuid);
      expect(getRes.body).toHaveProperty('questions');
      expect(Array.isArray(getRes.body.questions)).toBe(true);
    });

    it('should return 404 if survey does not exist', async () => {
      const nonExistentUuid = randomUUID();

      const res = await request(app.getHttpServer())
        .get(`/surveys/${nonExistentUuid}`)
        .expect(404);

      expect(res.body.message || res.body.error).toMatch(/not found/i);
    });
  });

  describe('PATCH /surveys/:uuid', () => {
    it('should update the survey title successfully', async () => {
      const createRes = await request(app.getHttpServer())
        .post('/surveys')
        .send(createSurveyDto())
        .expect(201);

      const { uuid, version } = createRes.body;

      const patchRes = await request(app.getHttpServer())
        .patch(`/surveys/${uuid}`)
        .send({ title: 'Updated Title', version })
        .expect(200);

      expect(patchRes.body.title).toBe('Updated Title');
      expect(patchRes.body.version).toBe(version + 1);
    });

    it('should return 400 if version is missing', async () => {
      const createRes = await request(app.getHttpServer())
        .post('/surveys')
        .send(createSurveyDto())
        .expect(201);

      const { uuid } = createRes.body;

      const res = await request(app.getHttpServer())
        .patch(`/surveys/${uuid}`)
        .send({ title: 'Bad Update' })
        .expect(400);

      expect(res.body.message).toContainEqual(expect.stringMatching(/version/));
    });

    it('should return 409 if version does not match', async () => {
      const createRes = await request(app.getHttpServer())
        .post('/surveys')
        .send(createSurveyDto())
        .expect(201);

      const { uuid } = createRes.body;

      // use outdated version
      await request(app.getHttpServer())
        .patch(`/surveys/${uuid}`)
        .send({ title: 'Conflict Update 1', version: 1 })
        .expect(200);

      await request(app.getHttpServer())
        .patch(`/surveys/${uuid}`)
        .send({ title: 'Conflict Update 2', version: 2 })
        .expect(200);

      const lastUpdateRes = await request(app.getHttpServer())
        .patch(`/surveys/${uuid}`)
        .send({ title: 'Conflict Update 3', version: 2 })
        .expect(409);

      expect(lastUpdateRes.body.message).toMatch(/someone else/i);
    });

    it('should return 404 if survey does not exist', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/surveys/${randomUUID()}`)
        .send({ title: 'Not Found', version: 1 })
        .expect(404);

      expect(res.body.message).toMatch(/not found/i);
    });
  });
});
