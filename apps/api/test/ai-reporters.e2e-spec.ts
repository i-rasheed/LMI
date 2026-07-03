import { ExecutionContext, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { AiService } from '../src/ai/ai.service';
import { ActiveAccountGuard } from '../src/common/guards/active-account.guard';
import { AdminRoleGuard } from '../src/common/guards/admin-role.guard';
import { AuthGuard } from '../src/common/guards/auth.guard';
import { ReporterRoleGuard } from '../src/common/guards/reporter-role.guard';
import { ReportersService } from '../src/reporters/reporters.service';
import { request } from './e2e-utils';

const USER_ID = '55555555-5555-5555-5555-555555555555';

async function initAiReportersApp(): Promise<INestApplication> {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  })
    .overrideProvider(AiService)
    .useValue({
      search: jest.fn().mockResolvedValue({
        suggestions: ['Tomatoes'],
        didYouMean: 'Tomatoes',
      }),
      explainOutlier: jest.fn().mockResolvedValue({
        summary: 'This price is far from the recent market average.',
      }),
      moderate: jest.fn().mockResolvedValue({
        summary: 'Review the photo and recent average before resolving.',
      }),
      digest: jest.fn().mockResolvedValue({
        title: 'Your weekly market digest',
        body: 'Tomatoes are cheaper this week.',
        highlights: ['Tomatoes are cheaper this week.'],
      }),
    })
    .overrideProvider(ReportersService)
    .useValue({
      getLeaderboard: jest.fn().mockResolvedValue([
        {
          id: USER_ID,
          displayName: 'Amina',
          badgeLevel: 'silver',
          isVerifiedReporter: true,
          acceptedSubmissionCount: 24,
          currentStreakDays: 3,
          longestStreakDays: 5,
          lastSubmissionDate: new Date().toISOString().slice(0, 10),
          rank: 1,
          weeklySubmissionCount: 8,
        },
      ]),
      getProfile: jest.fn().mockResolvedValue({
        id: USER_ID,
        displayName: 'Amina',
        badgeLevel: 'silver',
        isVerifiedReporter: true,
        acceptedSubmissionCount: 24,
        currentStreakDays: 3,
        longestStreakDays: 5,
        lastSubmissionDate: new Date().toISOString().slice(0, 10),
      }),
      getMineHistory: jest.fn().mockResolvedValue([
        {
          id: '66666666-6666-6666-6666-666666666666',
          productId: '77777777-7777-7777-7777-777777777777',
          productName: 'Tomatoes',
          marketId: '88888888-8888-8888-8888-888888888888',
          marketName: 'Mile 12 Market',
          priceNaira: 1200,
          unit: 'kg',
          status: 'live',
          submittedAt: new Date().toISOString(),
        },
      ]),
    })
    .overrideGuard(AuthGuard)
    .useValue({
      canActivate: (context: ExecutionContext) => {
        const req = context.switchToHttp().getRequest();
        req.user = { id: USER_ID, email: 'reporter@example.com' };
        return true;
      },
    })
    .overrideGuard(ActiveAccountGuard)
    .useValue({ canActivate: () => true })
    .overrideGuard(ReporterRoleGuard)
    .useValue({ canActivate: () => true })
    .overrideGuard(AdminRoleGuard)
    .useValue({ canActivate: () => true })
    .compile();

  const app = moduleFixture.createNestApplication();
  app.setGlobalPrefix('api/v1');
  await app.init();
  return app;
}

describe('AI and reporters (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await initAiReportersApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /ai/search returns suggestions', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/ai/search')
      .send({ query: 'tomatoe' })
      .expect(201);

    expect(response.body.suggestions).toContain('Tomatoes');
  });

  it('POST /ai/explain-outlier explains unusual price', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/ai/explain-outlier')
      .send({
        productName: 'Tomatoes',
        marketName: 'Mile 12 Market',
        unit: 'kg',
        submittedPriceNaira: 9000,
        averagePriceNaira: 1200,
      })
      .expect(201);

    expect(response.body.summary).toContain('average');
  });

  it('GET /reporters/leaderboard lists top reporters', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/v1/reporters/leaderboard')
      .expect(200);

    expect(response.body[0].rank).toBe(1);
  });

  it('GET /reporters/me/submissions lists reporter history', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/v1/reporters/me/submissions')
      .expect(200);

    expect(response.body[0].productName).toBe('Tomatoes');
  });
});
