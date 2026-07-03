import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { AuthGuard } from '../src/common/guards/auth.guard';
import { ActiveAccountGuard } from '../src/common/guards/active-account.guard';
import { SupabaseService } from '../src/supabase/supabase.service';
import { initFullApp, request } from './e2e-utils';

const TOMATO_PRODUCT = {
  id: '11111111-1111-1111-1111-111111111111',
  name: 'Tomatoes',
  slug: 'tomatoes',
  category: 'vegetables',
  default_unit: 'kg',
  allowed_units: ['kg', 'crate'],
  photo_url: null,
  rank: 0.82,
};

const NEARBY_MARKETS = [
  {
    id: '22222222-2222-2222-2222-222222222222',
    name: 'Balogun Market',
    slug: 'balogun',
    area: 'Lagos Island',
    latitude: 6.4541,
    longitude: 3.3947,
    photo_url: null,
    categories: ['vegetables'],
    distance_km: 2.14,
  },
  {
    id: '33333333-3333-3333-3333-333333333333',
    name: 'Mile 12 Market',
    slug: 'mile-12',
    area: 'Kosofe',
    latitude: 6.5398,
    longitude: 3.3922,
    photo_url: null,
    categories: ['vegetables', 'grains'],
    distance_km: 8.52,
  },
];

function createMockSupabaseService() {
  return {
    db: {
      rpc: jest.fn(async (fn: string, params: Record<string, unknown>) => {
        if (fn === 'search_products') {
          if (params.p_query === 'tomatoe') {
            return { data: [TOMATO_PRODUCT], error: null };
          }
          return { data: [], error: null };
        }

        if (fn === 'get_nearby_markets') {
          return { data: NEARBY_MARKETS, error: null };
        }

        if (fn === 'get_trending_products') {
          return { data: [], error: null };
        }

        return { data: null, error: { message: `Unknown RPC: ${fn}` } };
      }),
      from: jest.fn(),
    },
  };
}

async function initCatalogueApp(): Promise<INestApplication> {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  })
    .overrideProvider(SupabaseService)
    .useValue(createMockSupabaseService())
    .overrideGuard(AuthGuard)
    .useValue({ canActivate: () => true })
    .overrideGuard(ActiveAccountGuard)
    .useValue({ canActivate: () => true })
    .compile();

  const app = moduleFixture.createNestApplication();
  app.setGlobalPrefix('api/v1');
  await app.init();
  return app;
}

describe('Catalogue auth (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await initFullApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/api/v1/products/search (GET) rejects missing token', () => {
    return request(app.getHttpServer())
      .get('/api/v1/products/search?q=tomato')
      .expect(401);
  });

  it('/api/v1/markets/nearby (GET) rejects missing token', () => {
    return request(app.getHttpServer())
      .get('/api/v1/markets/nearby?lat=6.5244&lng=3.3792')
      .expect(401);
  });
});

describe('Catalogue (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await initCatalogueApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/api/v1/products/search?q=tomatoe returns Tomatoes', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/v1/products/search')
      .query({ q: 'tomatoe' })
      .expect(200);

    expect(response.body).toEqual([
      expect.objectContaining({
        name: 'Tomatoes',
        slug: 'tomatoes',
        category: 'vegetables',
        defaultUnit: 'kg',
      }),
    ]);
  });

  it('/api/v1/markets/nearby sorts markets by ascending distance', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/v1/markets/nearby')
      .query({ lat: 6.5244, lng: 3.3792, radius_km: 50 })
      .expect(200);

    expect(response.body).toHaveLength(2);
    expect(response.body[0].name).toBe('Balogun Market');
    expect(response.body[1].name).toBe('Mile 12 Market');
    expect(response.body[0].distanceKm).toBeLessThan(response.body[1].distanceKm);
  });
});
