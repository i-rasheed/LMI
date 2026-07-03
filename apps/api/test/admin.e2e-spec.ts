import { INestApplication, ExecutionContext } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { AuthGuard } from '../src/common/guards/auth.guard';
import { ActiveAccountGuard } from '../src/common/guards/active-account.guard';
import { AdminRoleGuard } from '../src/common/guards/admin-role.guard';
import { AdminFlagsService } from '../src/admin/admin-flags.service';
import { PricesService } from '../src/prices/prices.service';
import { request } from './e2e-utils';

const SUBMISSION_ID = '33333333-3333-3333-3333-333333333333';
const REVIEW_ID = '55555555-5555-5555-5555-555555555555';
const USER_ID = '44444444-4444-4444-4444-444444444444';

const mockQueue = [
  {
    id: REVIEW_ID,
    submissionId: SUBMISSION_ID,
    flagCount: 3,
    escalatedAt: new Date().toISOString(),
    status: 'under_review',
    productId: '11111111-1111-1111-1111-111111111111',
    productName: 'Tomatoes',
    marketId: '22222222-2222-2222-2222-222222222222',
    marketName: 'Mile 12 Market',
    priceNaira: 900,
    unit: 'kg',
    reporter: {
      id: '66666666-6666-6666-6666-666666666666',
      displayName: 'Amaka',
      badgeLevel: 'bronze',
      isVerifiedReporter: false,
    },
  },
];

async function initAdminApp(
  adminAllowed = true,
): Promise<INestApplication> {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  })
    .overrideProvider(AdminFlagsService)
    .useValue({
      listFlagQueue: jest.fn().mockResolvedValue(mockQueue),
      getFlagReview: jest.fn().mockResolvedValue({
        id: REVIEW_ID,
        submissionId: SUBMISSION_ID,
        flagCount: 3,
        escalatedAt: new Date().toISOString(),
        isResolved: false,
        submission: {
          id: SUBMISSION_ID,
          productName: 'Tomatoes',
          marketName: 'Mile 12 Market',
          priceNaira: 900,
          unit: 'kg',
          photoUrl: null,
          status: 'under_review',
          submittedAt: new Date().toISOString(),
          isAutoFlagged: false,
          autoFlagReason: null,
        },
        reporter: {
          id: '66666666-6666-6666-6666-666666666666',
          displayName: 'Amaka',
          badgeLevel: 'bronze',
          isVerifiedReporter: false,
          acceptedSubmissionCount: 12,
        },
        flags: [],
        reasonBreakdown: { incorrect_price: 3 },
        marketAverageNaira: 850,
      }),
      applyFlagAction: jest.fn().mockResolvedValue({
        reviewId: REVIEW_ID,
        submissionId: SUBMISSION_ID,
        action: 'confirm',
        submissionStatus: 'live',
      }),
      getPendingFlagCount: jest.fn().mockResolvedValue(1),
    })
    .overrideProvider(PricesService)
    .useValue({
      flagSubmission: jest.fn().mockResolvedValue({
        flagId: 'flag-1',
        flagCount: 1,
        escalated: false,
      }),
    })
    .overrideGuard(AuthGuard)
    .useValue({
      canActivate: (context: ExecutionContext) => {
        const req = context.switchToHttp().getRequest<{ user?: { id: string } }>();
        req.user = { id: USER_ID };
        return true;
      },
    })
    .overrideGuard(ActiveAccountGuard)
    .useValue({ canActivate: () => true })
    .overrideGuard(AdminRoleGuard)
    .useValue({ canActivate: () => adminAllowed })
    .compile();

  const app = moduleFixture.createNestApplication();
  app.setGlobalPrefix('api/v1');
  await app.init();
  return app;
}

describe('Admin flags (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await initAdminApp(true);
  });

  afterAll(async () => {
    await app.close();
  });

  it('lists flag queue for admin', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/v1/admin/flags')
      .expect(200);

    expect(response.body).toHaveLength(1);
    expect(response.body[0].flagCount).toBe(3);
  });

  it('returns flag review detail', async () => {
    const response = await request(app.getHttpServer())
      .get(`/api/v1/admin/flags/${REVIEW_ID}`)
      .expect(200);

    expect(response.body.submission.productName).toBe('Tomatoes');
  });

  it('applies confirm action', async () => {
    const response = await request(app.getHttpServer())
      .patch(`/api/v1/admin/flags/${REVIEW_ID}`)
      .send({ action: 'confirm' })
      .expect(200);

    expect(response.body.submissionStatus).toBe('live');
  });
});

describe('Admin flags forbidden (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await initAdminApp(false);
  });

  afterAll(async () => {
    await app.close();
  });

  it('rejects non-admin access to flag queue', () => {
    return request(app.getHttpServer()).get('/api/v1/admin/flags').expect(403);
  });
});

describe('Price flag (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await initAdminApp(true);
  });

  afterAll(async () => {
    await app.close();
  });

  it('accepts price flag payload', async () => {
    const response = await request(app.getHttpServer())
      .post(`/api/v1/prices/${SUBMISSION_ID}/flag`)
      .send({ reason: 'incorrect_price', comment: 'Too high' })
      .expect(201);

    expect(response.body.flagCount).toBe(1);
  });
});
