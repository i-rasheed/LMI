import { INestApplication, ExecutionContext } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { AuthGuard } from '../src/common/guards/auth.guard';
import { ActiveAccountGuard } from '../src/common/guards/active-account.guard';
import { PricesService } from '../src/prices/prices.service';
import { initFullApp, request } from './e2e-utils';

const PRODUCT_ID = '11111111-1111-1111-1111-111111111111';

const mockCompareResponse = {
  product: {
    id: PRODUCT_ID,
    name: 'Tomatoes',
    slug: 'tomatoes',
    category: 'vegetables',
    defaultUnit: 'kg',
    photoUrl: null,
  },
  prices: [
    {
      id: 'cp-1',
      submissionId: 'sub-1',
      marketId: 'm-1',
      marketName: 'Oyingbo Market',
      marketArea: 'Mainland',
      marketSlug: 'oyingbo',
      latitude: 6.4924,
      longitude: 3.3676,
      priceNaira: 780,
      unit: 'kg',
      submittedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
      distanceKm: 4.2,
      source: 'reporter',
      status: 'live',
      submitter: {
        id: 'u-1',
        displayName: 'Amaka',
        badgeLevel: 'silver',
        isVerifiedReporter: false,
      },
    },
    {
      id: 'cp-2',
      submissionId: 'sub-2',
      marketId: 'm-2',
      marketName: 'Mile 12 Market',
      marketArea: 'Kosofe',
      marketSlug: 'mile-12',
      latitude: 6.5398,
      longitude: 3.3922,
      priceNaira: 850,
      unit: 'kg',
      submittedAt: new Date(Date.now() - 30 * 60 * 60 * 1000).toISOString(),
      distanceKm: 8.5,
      source: 'reporter',
      status: 'live',
      submitter: {
        id: 'u-2',
        displayName: 'Chukwuemeka',
        badgeLevel: 'silver',
        isVerifiedReporter: true,
      },
    },
  ],
  cheapest: {
    priceNaira: 780,
    marketName: 'Oyingbo Market',
    unit: 'kg',
  },
};

const MARKET_ID = '22222222-2222-2222-2222-222222222222';

async function initPricesApp(): Promise<INestApplication> {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  })
    .overrideProvider(PricesService)
    .useValue({
      compareProduct: jest.fn().mockResolvedValue(mockCompareResponse),
      getMarketAverage: jest.fn().mockResolvedValue({
        productId: PRODUCT_ID,
        marketId: MARKET_ID,
        unit: 'kg',
        averageNaira: 850,
        sampleCount: 12,
      }),
    })
    .overrideGuard(AuthGuard)
    .useValue({
      canActivate: (context: ExecutionContext) => {
        const req = context.switchToHttp().getRequest<{ user?: { id: string } }>();
        req.user = { id: '44444444-4444-4444-4444-444444444444' };
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

describe('Prices auth (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await initFullApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/api/v1/prices/:productId/compare (GET) rejects missing token', () => {
    return request(app.getHttpServer())
      .get(`/api/v1/prices/${PRODUCT_ID}/compare`)
      .expect(401);
  });
});

describe('Prices compare (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await initPricesApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it('returns compare payload with cheapest summary', async () => {
    const response = await request(app.getHttpServer())
      .get(`/api/v1/prices/${PRODUCT_ID}/compare`)
      .query({ sort: 'cheapest' })
      .expect(200);

    expect(response.body.product.name).toBe('Tomatoes');
    expect(response.body.prices).toHaveLength(2);
    expect(response.body.cheapest.marketName).toBe('Oyingbo Market');
  });

  it('returns market average preview', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/v1/prices/average')
      .query({
        productId: PRODUCT_ID,
        marketId: MARKET_ID,
        unit: 'kg',
      })
      .expect(200);

    expect(response.body.averageNaira).toBe(850);
    expect(response.body.sampleCount).toBe(12);
  });
});
