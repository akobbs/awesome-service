import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp } from '../utils/createTestApp';
import { CreateSurveyDto } from '../../src/survey/dto/create-survey.dto';

const createSurveyDto = (title: string): CreateSurveyDto => ({
  title,
  description: 'Relay test',
  expiresAt: new Date(Date.now() + 86400000).toISOString(),
  questions: [
    {
      text: 'How are you?',
      type: 'text',
      order: 1,
    },
  ],
});

describe('GET /surveys/cursor', () => {
  let app: INestApplication;
  let server: any;
  const expectedTitles: string[] = [];

  beforeAll(async () => {
    app = await createTestApp();
    server = app.getHttpServer();

    // Seed 10 surveys: Survey 1 to Survey 10
    for (let i = 1; i <= 10; i++) {
      const title = `Survey ${i}`;
      await request(server)
        .post('/surveys')
        .send(createSurveyDto(title))
        .expect(201);
      expectedTitles.push(title);
    }

    // Reverse to match sorting by id DESC
    expectedTitles.reverse();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should paginate forward through all items (2 per page)', async () => {
    const pageSize = 2;
    const received: string[] = [];

    let cursor: string | null = null;
    let hasNextPage = true;

    while (hasNextPage) {
      const query: string = cursor
        ? `/surveys/cursor?first=${pageSize}&after=${cursor}`
        : `/surveys/cursor?first=${pageSize}`;

      const res = await request(server).get(query).expect(200);

      const edges = res.body.edges;
      received.push(...edges.map((e: any) => e.node.title));

      hasNextPage = res.body.pageInfo.hasNextPage;
      cursor = res.body.pageInfo.endCursor;
    }

    expect(received).toEqual(expectedTitles);
  });

  it('should paginate backward through all items (2 per page)', async () => {
    const pageSize = 2;
    const received: string[] = [];

    // Step 1: Fetch the last page of 2 items
    let res = await request(server)
      .get(`/surveys/cursor?last=${pageSize}`)
      .expect(200);
    received.unshift(...res.body.edges.map((e: any) => e.node.title));

    let hasPreviousPage = res.body.pageInfo.hasPreviousPage;
    let cursor = res.body.pageInfo.startCursor;

    // Step 2: Walk backward through all previous pages
    while (hasPreviousPage) {
      res = await request(server)
        .get(`/surveys/cursor?last=${pageSize}&before=${cursor}`)
        .expect(200);

      received.unshift(...res.body.edges.map((e: any) => e.node.title));
      hasPreviousPage = res.body.pageInfo.hasPreviousPage;
      cursor = res.body.pageInfo.startCursor;
    }

    expect(received).toEqual(expectedTitles);
  });
});
