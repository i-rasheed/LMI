import { ExecutionContext, HttpException, HttpStatus, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { AuthGuard } from '../src/common/guards/auth.guard';
import { ActiveAccountGuard } from '../src/common/guards/active-account.guard';
import { AlertsService } from '../src/alerts/alerts.service';
import { FavouritesService } from '../src/favourites/favourites.service';
import { request } from './e2e-utils';

const USER_ID = '44444444-4444-4444-4444-444444444444';
const PRODUCT_ID = '11111111-1111-1111-1111-111111111111';
const ALERT_ID = '55555555-5555-5555-5555-555555555555';

const favourite = {
  id: 'fav-1',
  productId: PRODUCT_ID,
  createdAt: new Date().toISOString(),
  product: {
    id: PRODUCT_ID,
    name: 'Tomatoes',
    slug: 'tomatoes',
    category: 'vegetables',
    defaultUnit: 'kg',
    photoUrl: null,
  },
};

const alertItem = {
  id: ALERT_ID,
  productId: PRODUCT_ID,
  thresholdPercentage: 15,
  isActive: true,
  lastTriggeredAt: null,
  lastKnownPriceNaira: 850,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  product: favourite.product,
};

async function initEngagementApp(
  options: { limitFavourite?: boolean; limitAlert?: boolean } = {},
): Promise<INestApplication> {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  })
    .overrideProvider(FavouritesService)
    .useValue({
      listFavourites: jest.fn().mockResolvedValue([favourite]),
      addFavourite: options.limitFavourite
        ? jest.fn().mockRejectedValue(
            new HttpException(
              {
                code: 'FREEMIUM_LIMIT',
                message: 'Free accounts can save up to 10 favourites.',
                resource: 'favourites',
              },
              HttpStatus.PAYMENT_REQUIRED,
            ),
          )
        : jest.fn().mockResolvedValue(favourite),
      removeFavourite: jest.fn().mockResolvedValue(undefined),
    })
    .overrideProvider(AlertsService)
    .useValue({
      listAlerts: jest.fn().mockResolvedValue([alertItem]),
      createAlert: options.limitAlert
        ? jest.fn().mockRejectedValue(
            new HttpException(
              {
                code: 'FREEMIUM_LIMIT',
                message: 'Free accounts can keep up to 3 active alerts.',
                resource: 'alerts',
              },
              HttpStatus.PAYMENT_REQUIRED,
            ),
          )
        : jest.fn().mockResolvedValue(alertItem),
      updateAlert: jest.fn().mockResolvedValue({ ...alertItem, isActive: false }),
      deleteAlert: jest.fn().mockResolvedValue(undefined),
    })
    .overrideGuard(AuthGuard)
    .useValue({
      canActivate: (context: ExecutionContext) => {
        const request = context
          .switchToHttp()
          .getRequest<{ user?: { id: string } }>();
        request.user = { id: USER_ID };
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

describe('Favourites and alerts (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await initEngagementApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it('lists favourites', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/v1/favourites')
      .expect(200);

    expect(response.body[0].product.name).toBe('Tomatoes');
  });

  it('adds and deletes favourite', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/favourites')
      .send({ productId: PRODUCT_ID })
      .expect(201);

    await request(app.getHttpServer())
      .delete(`/api/v1/favourites/${PRODUCT_ID}`)
      .expect(200);
  });

  it('lists and updates alerts', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/v1/alerts')
      .expect(200);

    expect(response.body[0].thresholdPercentage).toBe(15);

    await request(app.getHttpServer())
      .patch(`/api/v1/alerts/${ALERT_ID}`)
      .send({ isActive: false })
      .expect(200);
  });

  it('creates and deletes alert', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/alerts')
      .send({ productId: PRODUCT_ID, thresholdPercentage: 15 })
      .expect(201);

    await request(app.getHttpServer())
      .delete(`/api/v1/alerts/${ALERT_ID}`)
      .expect(200);
  });
});

describe('Freemium limits (e2e)', () => {
  it('returns paywall response for favourite limit', async () => {
    const app = await initEngagementApp({ limitFavourite: true });
    await request(app.getHttpServer())
      .post('/api/v1/favourites')
      .send({ productId: PRODUCT_ID })
      .expect(402);
    await app.close();
  });

  it('returns paywall response for alert limit', async () => {
    const app = await initEngagementApp({ limitAlert: true });
    await request(app.getHttpServer())
      .post('/api/v1/alerts')
      .send({ productId: PRODUCT_ID, thresholdPercentage: 15 })
      .expect(402);
    await app.close();
  });
});
