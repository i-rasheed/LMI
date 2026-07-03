import {
  ExecutionContext,
  HttpException,
  HttpStatus,
  INestApplication,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { AuthGuard } from '../src/common/guards/auth.guard';
import { ActiveAccountGuard } from '../src/common/guards/active-account.guard';
import { ShoppingListService } from '../src/shopping-list/shopping-list.service';
import { request } from './e2e-utils';

const USER_ID = '44444444-4444-4444-4444-444444444444';
const ITEM_ID = '55555555-5555-5555-5555-555555555555';
const PRODUCT_ID = '11111111-1111-1111-1111-111111111111';

const listItem = {
  id: ITEM_ID,
  productId: PRODUCT_ID,
  quantity: 1,
  sortOrder: 0,
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

const optimiseResult = {
  bestMarket: {
    marketId: '22222222-2222-2222-2222-222222222222',
    marketName: 'Mile 12 Market',
    marketArea: 'Kosofe',
    totalCostNaira: 1800,
    coverageCount: 2,
    itemCount: 3,
    breakdown: [
      {
        productId: PRODUCT_ID,
        productName: 'Tomatoes',
        quantity: 2,
        unit: 'kg',
        priceNaira: 900,
        lineTotalNaira: 1800,
      },
      {
        productId: '33333333-3333-3333-3333-333333333333',
        productName: 'Rice',
        quantity: 1,
        unit: 'kg',
        priceNaira: null,
        lineTotalNaira: null,
      },
    ],
  },
  markets: [],
  itemCount: 3,
};

async function initShoppingListApp(
  options: { limitList?: boolean } = {},
): Promise<INestApplication> {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  })
    .overrideProvider(ShoppingListService)
    .useValue({
      listItems: jest.fn().mockResolvedValue([listItem]),
      addItem: options.limitList
        ? jest.fn().mockRejectedValue(
            new HttpException(
              {
                code: 'FREEMIUM_LIMIT',
                message: 'Free accounts can keep up to 5 list items.',
                resource: 'list_items',
              },
              HttpStatus.PAYMENT_REQUIRED,
            ),
          )
        : jest.fn().mockResolvedValue(listItem),
      deleteItem: jest.fn().mockResolvedValue(undefined),
      optimise: jest.fn().mockResolvedValue(optimiseResult),
    })
    .overrideGuard(AuthGuard)
    .useValue({
      canActivate: (context: ExecutionContext) => {
        const req = context
          .switchToHttp()
          .getRequest<{ user?: { id: string } }>();
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

describe('Shopping list (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await initShoppingListApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it('lists items', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/v1/list/items')
      .expect(200);

    expect(response.body[0].product.name).toBe('Tomatoes');
  });

  it('adds and deletes item', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/list/items')
      .send({ productId: PRODUCT_ID, quantity: 1 })
      .expect(201);

    await request(app.getHttpServer())
      .delete(`/api/v1/list/items/${ITEM_ID}`)
      .expect(200);
  });

  it('optimises list and includes coverage breakdown', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/list/optimise')
      .send({})
      .expect(201);

    expect(response.body.bestMarket.marketName).toBe('Mile 12 Market');
    expect(response.body.bestMarket.coverageCount).toBe(2);
    expect(response.body.bestMarket.breakdown[1].lineTotalNaira).toBeNull();
  });
});

describe('Shopping list freemium limit (e2e)', () => {
  it('returns paywall response for 6th free item', async () => {
    const app = await initShoppingListApp({ limitList: true });

    await request(app.getHttpServer())
      .post('/api/v1/list/items')
      .send({ productId: PRODUCT_ID, quantity: 1 })
      .expect(402);

    await app.close();
  });
});
