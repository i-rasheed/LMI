import AsyncStorage from '@react-native-async-storage/async-storage';
import { PriceUnit } from '@lmi/shared';
import { create } from 'zustand';
import {
  RecentMarketEntry,
  RecentProductEntry,
  SubmissionResponse,
} from '../types/submit';

const RECENT_MARKETS_KEY = 'lmi:recent-markets';
const RECENT_PRODUCTS_KEY = 'lmi:recent-products';

interface SubmitState {
  marketId: string | null;
  marketName: string | null;
  productId: string | null;
  productName: string | null;
  priceNaira: number | null;
  unit: PriceUnit | null;
  photoUri: string | null;
  photoUrl: string | null;
  replacesSubmissionId: string | null;
  confirmOutlier: boolean;
  lastSubmission: SubmissionResponse | null;
  setMarket: (market: RecentMarketEntry) => void;
  setProduct: (product: RecentProductEntry) => void;
  setPrice: (priceNaira: number, unit: PriceUnit) => void;
  setPhotoUri: (uri: string | null) => void;
  setPhotoUrl: (url: string | null) => void;
  setConfirmOutlier: (confirmOutlier: boolean) => void;
  setLastSubmission: (submission: SubmissionResponse) => void;
  reset: () => void;
}

const initialState = {
  marketId: null,
  marketName: null,
  productId: null,
  productName: null,
  priceNaira: null,
  unit: null,
  photoUri: null,
  photoUrl: null,
  replacesSubmissionId: null,
  confirmOutlier: false,
  lastSubmission: null,
};

export const useSubmitStore = create<SubmitState>((set) => ({
  ...initialState,
  setMarket: (market) =>
    set({
      marketId: market.id,
      marketName: market.name,
      productId: null,
      productName: null,
      priceNaira: null,
      unit: null,
      photoUri: null,
      photoUrl: null,
      confirmOutlier: false,
    }),
  setProduct: (product) =>
    set({
      productId: product.id,
      productName: product.name,
      unit: (product.defaultUnit as PriceUnit) ?? null,
      priceNaira: null,
      confirmOutlier: false,
    }),
  setPrice: (priceNaira, unit) => set({ priceNaira, unit, confirmOutlier: false }),
  setPhotoUri: (photoUri) => set({ photoUri }),
  setPhotoUrl: (photoUrl) => set({ photoUrl }),
  setConfirmOutlier: (confirmOutlier) => set({ confirmOutlier }),
  setLastSubmission: (lastSubmission) => set({ lastSubmission }),
  reset: () => set({ ...initialState }),
}));

export async function loadRecentMarkets(): Promise<RecentMarketEntry[]> {
  try {
    const raw = await AsyncStorage.getItem(RECENT_MARKETS_KEY);
    if (!raw) {
      return [];
    }
    return JSON.parse(raw) as RecentMarketEntry[];
  } catch {
    return [];
  }
}

export async function saveRecentMarket(market: RecentMarketEntry): Promise<void> {
  const existing = await loadRecentMarkets();
  const next = [
    market,
    ...existing.filter((entry) => entry.id !== market.id),
  ].slice(0, 5);
  await AsyncStorage.setItem(RECENT_MARKETS_KEY, JSON.stringify(next));
}

export async function loadRecentProducts(): Promise<RecentProductEntry[]> {
  try {
    const raw = await AsyncStorage.getItem(RECENT_PRODUCTS_KEY);
    if (!raw) {
      return [];
    }
    return JSON.parse(raw) as RecentProductEntry[];
  } catch {
    return [];
  }
}

export async function saveRecentProduct(
  product: RecentProductEntry,
): Promise<void> {
  const existing = await loadRecentProducts();
  const next = [
    product,
    ...existing.filter((entry) => entry.id !== product.id),
  ].slice(0, 5);
  await AsyncStorage.setItem(RECENT_PRODUCTS_KEY, JSON.stringify(next));
}
