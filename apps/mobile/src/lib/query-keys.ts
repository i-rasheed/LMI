export const queryKeys = {
  appConfig: ['app-config'] as const,
  markets: {
    all: ['markets'] as const,
    list: (params?: Record<string, unknown>) =>
      ['markets', 'list', params] as const,
    nearby: (lat: number, lng: number) =>
      ['markets', 'nearby', lat, lng] as const,
    detail: (id: string) => ['markets', id] as const,
  },
  products: {
    search: (q: string) => ['products', 'search', q] as const,
    trending: ['products', 'trending'] as const,
    categories: ['products', 'categories'] as const,
    byCategory: (category: string) =>
      ['products', 'category', category] as const,
    detail: (id: string) => ['products', id] as const,
  },
  prices: {
    compare: (
      productId: string,
      sort: string,
      lat?: number,
      lng?: number,
      filters?: Record<string, unknown>,
    ) => ['prices', 'compare', productId, sort, lat, lng, filters] as const,
    history: (productId: string) => ['prices', 'history', productId] as const,
    marketAverage: (productId: string, marketId: string, unit: string) =>
      ['prices', 'average', productId, marketId, unit] as const,
  },
  admin: {
    dashboard: ['admin', 'dashboard'] as const,
    flags: (params?: Record<string, unknown>) =>
      ['admin', 'flags', params] as const,
    flagDetail: (id: string) => ['admin', 'flags', id] as const,
    claims: ['admin', 'claims'] as const,
    claimDetail: (id: string) => ['admin', 'claims', id] as const,
  },
  vendor: {
    claimStatus: ['vendor', 'claim-status'] as const,
    dashboard: ['vendor', 'dashboard'] as const,
    products: ['vendor', 'products'] as const,
    plans: ['vendor', 'plans'] as const,
    analytics: ['vendor', 'analytics'] as const,
  },
  warnings: {
    pending: ['warnings', 'pending'] as const,
  },
  notifications: {
    inbox: ['notifications', 'inbox'] as const,
  },
  subscriptions: {
    plans: ['subscriptions', 'plans'] as const,
    me: ['subscriptions', 'me'] as const,
  },
  ai: {
    search: (query: string) => ['ai', 'search', query] as const,
  },
  favourites: {
    all: ['favourites'] as const,
  },
  alerts: {
    all: ['alerts'] as const,
  },
  shoppingList: {
    items: ['shopping-list', 'items'] as const,
    optimise: ['shopping-list', 'optimise'] as const,
  },
};
