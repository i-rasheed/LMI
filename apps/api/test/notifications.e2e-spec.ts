import { ExecutionContext, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { AuthGuard } from '../src/common/guards/auth.guard';
import { ActiveAccountGuard } from '../src/common/guards/active-account.guard';
import { NotificationsService } from '../src/notifications/notifications.service';
import { request } from './e2e-utils';

const USER_ID = '44444444-4444-4444-4444-444444444444';
const NOTIFICATION_ID = '55555555-5555-5555-5555-555555555555';

async function initNotificationsApp(): Promise<INestApplication> {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  })
    .overrideProvider(NotificationsService)
    .useValue({
      registerDevice: jest.fn().mockResolvedValue({ registered: true }),
      listInbox: jest.fn().mockResolvedValue([
        {
          id: NOTIFICATION_ID,
          type: 'price_drop',
          title: 'Tomatoes price dropped',
          body: 'Now ₦800 / kg at Mile 12 Market.',
          data: { route: '/product/11111111-1111-1111-1111-111111111111' },
          readAt: null,
          sentAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
        },
      ]),
      markRead: jest.fn().mockResolvedValue({ read: true }),
    })
    .overrideGuard(AuthGuard)
    .useValue({
      canActivate: (context: ExecutionContext) => {
        const req = context.switchToHttp().getRequest();
        req.user = { id: USER_ID };
        return true;
      },
    })
    .overrideGuard(ActiveAccountGuard)
    .useValue({ canActivate: () => true })
    .compile();

  const app = moduleFixture.createNestApplication();
  app.setGlobalPrefix('api/v1');
  await app.init();
  return app;
}

describe('Notifications (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await initNotificationsApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /devices/token registers an Expo push token', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/devices/token')
      .send({
        expoPushToken: 'ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]',
        platform: 'ios',
      })
      .expect(201);

    expect(response.body.registered).toBe(true);
  });

  it('GET /notifications returns inbox items', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/v1/notifications')
      .expect(200);

    expect(response.body[0].type).toBe('price_drop');
  });

  it('PATCH /notifications/:id/read marks an item read', async () => {
    const response = await request(app.getHttpServer())
      .patch(`/api/v1/notifications/${NOTIFICATION_ID}/read`)
      .expect(200);

    expect(response.body.read).toBe(true);
  });
});
