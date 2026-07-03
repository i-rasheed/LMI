import { ExecutionContext, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { AuthGuard } from '../src/common/guards/auth.guard';
import { ActiveAccountGuard } from '../src/common/guards/active-account.guard';
import { SubscriptionsService } from '../src/subscriptions/subscriptions.service';
import { request } from './e2e-utils';

const USER_ID = '44444444-4444-4444-4444-444444444444';
const PLAN_ID = '11111111-1111-1111-1111-111111111111';

async function initSubscriptionsApp(): Promise<INestApplication> {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  })
    .overrideProvider(SubscriptionsService)
    .useValue({
      listPlans: jest.fn().mockResolvedValue([
        {
          id: PLAN_ID,
          planType: 'shopper_premium',
          name: 'LMI Premium Monthly',
          amountKobo: 150000,
          amountNaira: 1500,
          billingInterval: 'monthly',
          paystackPlanCode: null,
        },
      ]),
      getMine: jest.fn().mockResolvedValue({
        isPremium: true,
        subscription: {
          id: 'sub-1',
          planId: PLAN_ID,
          status: 'active',
          billingInterval: 'monthly',
          currentPeriodEnd: new Date(Date.now() + 30 * 86400000).toISOString(),
          cancelAtPeriodEnd: false,
        },
      }),
      initialize: jest.fn().mockResolvedValue({
        authorizationUrl: 'https://checkout.paystack.com/test',
        accessCode: 'access-code',
        reference: 'lmi-reference',
      }),
      handleWebhook: jest.fn().mockResolvedValue({ received: true }),
    })
    .overrideGuard(AuthGuard)
    .useValue({
      canActivate: (context: ExecutionContext) => {
        const req = context.switchToHttp().getRequest();
        req.user = { id: USER_ID, email: 'shopper@example.com' };
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

describe('Subscriptions (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await initSubscriptionsApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /subscriptions/plans lists shopper plans', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/v1/subscriptions/plans')
      .expect(200);

    expect(response.body[0].amountNaira).toBe(1500);
  });

  it('GET /subscriptions/me returns premium status', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/v1/subscriptions/me')
      .expect(200);

    expect(response.body.isPremium).toBe(true);
  });

  it('POST /subscriptions/initialize returns checkout URL', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/subscriptions/initialize')
      .send({ planId: PLAN_ID, callbackUrl: 'https://lmi.ng/paystack/success' })
      .expect(201);

    expect(response.body.authorizationUrl).toContain('paystack');
  });

  it('POST /webhooks/paystack accepts webhook events', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/webhooks/paystack')
      .set('x-paystack-signature', 'test-signature')
      .send({ event: 'charge.success', data: { reference: 'ref' } })
      .expect(201);

    expect(response.body.received).toBe(true);
  });
});
