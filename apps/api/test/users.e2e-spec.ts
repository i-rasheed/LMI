import { INestApplication } from '@nestjs/common';
import { initFullApp, request } from './e2e-utils';

describe('Users (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await initFullApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/api/v1/users/me (GET) rejects missing token', () => {
    return request(app.getHttpServer())
      .get('/api/v1/users/me')
      .expect(401);
  });

  it('/api/v1/users/me (GET) rejects invalid token', () => {
    return request(app.getHttpServer())
      .get('/api/v1/users/me')
      .set('Authorization', 'Bearer invalid-token')
      .expect(401);
  });
});

describe('Config (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await initFullApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/api/v1/config (GET) returns public config shape', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/v1/config')
      .expect(200);

    expect(response.body).toMatchObject({
      minAppVersion: expect.any(String),
      latestAppVersion: expect.any(String),
      maintenanceMode: expect.any(Boolean),
      maintenanceMessage: expect.any(String),
    });
  });
});
