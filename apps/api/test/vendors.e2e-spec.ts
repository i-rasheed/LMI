import { ExecutionContext, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { AuthGuard } from '../src/common/guards/auth.guard';
import { ActiveAccountGuard } from '../src/common/guards/active-account.guard';
import { AdminRoleGuard } from '../src/common/guards/admin-role.guard';
import { VendorRoleGuard } from '../src/common/guards/vendor-role.guard';
import { AdminClaimsService } from '../src/admin/admin-claims.service';
import { VendorsService } from '../src/vendors/vendors.service';
import { request } from './e2e-utils';

const USER_ID = '44444444-4444-4444-4444-444444444444';
const CLAIM_ID = '77777777-7777-7777-7777-777777777777';
const MARKET_ID = '22222222-2222-2222-2222-222222222222';
const PRODUCT_ID = '11111111-1111-1111-1111-111111111111';
const LISTING_ID = '88888888-8888-8888-8888-888888888888';

const mockClaimStatus = {
  hasClaim: true,
  id: CLAIM_ID,
  stallName: 'Mama Ngozi Tomatoes',
  marketId: MARKET_ID,
  marketName: 'Mile 12 Market',
  marketArea: 'Kosofe',
  description: 'Fresh tomatoes daily',
  locationHint: 'Row B, Stall 14',
  categories: ['vegetables'],
  photos: [],
  claimStatus: 'approved',
  rejectionReason: null,
  vendorTier: null,
  isVerified: false,
  reviewedAt: new Date().toISOString(),
  canPublishProducts: true,
};

const mockDashboard = {
  stall: {
    id: CLAIM_ID,
    stallName: 'Mama Ngozi Tomatoes',
    marketName: 'Mile 12 Market',
    marketArea: 'Kosofe',
    claimStatus: 'approved',
    isVerified: true,
    vendorTier: 'basic',
    description: 'Fresh tomatoes daily',
    locationHint: 'Row B, Stall 14',
    categories: ['vegetables'],
    photos: [],
  },
  stats: {
    profileViews7d: 12,
    productCount: 1,
    productClicks7d: null,
  },
  canPublishProducts: true,
};

async function initVendorApp(): Promise<INestApplication> {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  })
    .overrideProvider(VendorsService)
    .useValue({
      submitClaim: jest.fn().mockResolvedValue(mockClaimStatus),
      getClaimStatus: jest.fn().mockResolvedValue(mockClaimStatus),
      resubmitClaim: jest.fn().mockResolvedValue({
        ...mockClaimStatus,
        claimStatus: 'approved',
        rejectionReason: null,
      }),
      getDashboard: jest.fn().mockResolvedValue(mockDashboard),
      listProducts: jest.fn().mockResolvedValue([
        {
          id: LISTING_ID,
          productId: PRODUCT_ID,
          productName: 'Tomatoes',
          productSlug: 'tomatoes',
          category: 'vegetables',
          priceNaira: 1200,
          unit: 'kg',
          photoUrl: null,
          status: 'live',
          isAvailableToday: true,
          updatedAt: new Date().toISOString(),
        },
      ]),
      addProduct: jest.fn().mockResolvedValue({
        id: LISTING_ID,
        productId: PRODUCT_ID,
        priceNaira: 1200,
        unit: 'kg',
        photoUrl: null,
        status: 'live',
        isAvailableToday: true,
        updatedAt: new Date().toISOString(),
      }),
      updateProduct: jest.fn().mockResolvedValue({
        id: LISTING_ID,
        productId: PRODUCT_ID,
        priceNaira: 1300,
        unit: 'kg',
        photoUrl: null,
        status: 'live',
        isAvailableToday: true,
        updatedAt: new Date().toISOString(),
      }),
      listSubscriptionPlans: jest.fn().mockResolvedValue([
        {
          id: '99999999-9999-9999-9999-999999999999',
          planType: 'vendor_pro',
          name: 'Vendor Pro',
          amountKobo: 1200000,
          amountNaira: 12000,
          billingInterval: 'monthly',
          paystackPlanCode: null,
        },
      ]),
      initializeSubscription: jest.fn().mockResolvedValue({
        authorizationUrl: 'https://checkout.paystack.com/vendor',
        accessCode: 'access-code',
        reference: 'vendor-reference',
      }),
      getAnalytics: jest.fn().mockResolvedValue({
        profileViews7d: 8,
        productClicks7d: 3,
        daily: [
          {
            date: new Date().toISOString().slice(0, 10),
            profileViews: 8,
            productClicks: 3,
          },
        ],
      }),
      recordAnalyticsEvent: jest.fn().mockResolvedValue({ recorded: true }),
      getPendingClaimCount: jest.fn().mockResolvedValue(1),
    })
    .overrideProvider(AdminClaimsService)
    .useValue({
      listClaimQueue: jest.fn().mockResolvedValue([
        {
          id: CLAIM_ID,
          stallName: 'Mama Ngozi Tomatoes',
          marketId: MARKET_ID,
          marketName: 'Mile 12 Market',
          marketArea: 'Kosofe',
          ownerId: USER_ID,
          ownerDisplayName: 'Ngozi',
          claimStatus: 'pending',
          categories: ['vegetables'],
          description: 'Fresh tomatoes daily',
          locationHint: 'Row B, Stall 14',
          photos: [],
          createdAt: new Date().toISOString(),
        },
      ]),
      getClaimReview: jest.fn().mockResolvedValue({
        id: CLAIM_ID,
        stallName: 'Mama Ngozi Tomatoes',
        marketId: MARKET_ID,
        marketName: 'Mile 12 Market',
        marketArea: 'Kosofe',
        ownerId: USER_ID,
        ownerDisplayName: 'Ngozi',
        claimStatus: 'pending',
        categories: ['vegetables'],
        description: 'Fresh tomatoes daily',
        locationHint: 'Row B, Stall 14',
        photos: [],
        createdAt: new Date().toISOString(),
        rejectionReason: null,
        reviewedAt: null,
      }),
      applyClaimAction: jest.fn().mockResolvedValue({
        claimId: CLAIM_ID,
        claimStatus: 'approved',
        action: 'approve',
      }),
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
    .overrideGuard(VendorRoleGuard)
    .useValue({ canActivate: () => true })
    .overrideGuard(AdminRoleGuard)
    .useValue({ canActivate: () => true })
    .compile();

  const app = moduleFixture.createNestApplication();
  app.setGlobalPrefix('api/v1');
  await app.init();
  return app;
}

describe('Vendors (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await initVendorApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /vendors/claim submits stall claim', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/vendors/claim')
      .send({
        marketId: MARKET_ID,
        stallName: 'Mama Ngozi Tomatoes',
        categories: ['vegetables'],
        description: 'Fresh tomatoes daily',
        locationHint: 'Row B, Stall 14',
      })
      .expect(201);

    expect(response.body.claimStatus).toBe('approved');
  });

  it('GET /vendors/claim/status returns claim status', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/v1/vendors/claim/status')
      .expect(200);

    expect(response.body.stallName).toBe('Mama Ngozi Tomatoes');
  });

  it('POST /vendors/products creates vendor listing', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/vendors/products')
      .send({
        productId: PRODUCT_ID,
        priceNaira: 1200,
        unit: 'kg',
        isAvailableToday: true,
      })
      .expect(201);

    expect(response.body.status).toBe('live');
  });

  it('GET /vendors/subscription/plans lists vendor plans', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/v1/vendors/subscription/plans')
      .expect(200);

    expect(response.body[0].planType).toBe('vendor_pro');
  });

  it('POST /vendors/subscription/initialize starts vendor checkout', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/vendors/subscription/initialize')
      .send({
        planId: '99999999-9999-9999-9999-999999999999',
        callbackUrl: 'https://lmi.ng/paystack/success',
      })
      .expect(201);

    expect(response.body.authorizationUrl).toContain('paystack');
  });

  it('GET /vendors/analytics returns Pro analytics', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/v1/vendors/analytics')
      .expect(200);

    expect(response.body.productClicks7d).toBe(3);
  });

  it('POST /vendors/analytics/event records shopper event', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/vendors/analytics/event')
      .send({
        vendorStallId: CLAIM_ID,
        eventType: 'profile_view',
      })
      .expect(201);

    expect(response.body.recorded).toBe(true);
  });

  it('GET /admin/claims lists pending claims', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/v1/admin/claims')
      .expect(200);

    expect(response.body).toHaveLength(1);
  });

  it('PATCH /admin/claims/:id approves claim', async () => {
    const response = await request(app.getHttpServer())
      .patch(`/api/v1/admin/claims/${CLAIM_ID}`)
      .send({ action: 'approve' })
      .expect(200);

    expect(response.body.claimStatus).toBe('approved');
  });
});
