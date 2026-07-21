import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

export const LANGUAGE_STORAGE_KEY = 'lmi.language';

const resources = {
  en: {
    translation: {
      'home.greeting': 'Good morning',
      'search.placeholder': 'Search products and markets',
      'tabs.list': 'My list',
      'list.findCheapest': 'Find cheapest market',
      'actions.setAlert': 'Set alert',
      'network.offline': 'No connection',
      'actions.tryAgain': 'Try again',
      'auth.signIn': 'Sign in',
      'auth.createAccount': 'Create account',
      'favourites.empty': 'No favourites yet',
      'prices.loading': 'Loading prices...',
      'location.enable': 'Enable location to see nearby markets',
    },
  },
  pcm: {
    translation: {
      'home.greeting': 'Good morning',
      'search.placeholder': 'Find product and market dem',
      'tabs.list': 'My list',
      'list.findCheapest': 'Find cheapest market',
      'actions.setAlert': 'Set alert',
      'network.offline': 'Network no dey',
      'actions.tryAgain': 'Try again',
      'auth.signIn': 'Sign in',
      'auth.createAccount': 'Create account',
      'favourites.empty': 'You never save any product',
      'prices.loading': 'Dey load prices...',
      'location.enable': 'On location make you see market wey near you',
    },
  },
};

void i18n.use(initReactI18next).init({
  resources,
  lng: 'en',
  fallbackLng: 'en',
  compatibilityJSON: 'v3',
  interpolation: {
    escapeValue: false,
  },
});

export async function loadStoredLanguage(): Promise<void> {
  const stored = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
  if (stored === 'en' || stored === 'pcm') {
    await i18n.changeLanguage(stored);
  }
}

export async function setStoredLanguage(language: 'en' | 'pcm'): Promise<void> {
  await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  await i18n.changeLanguage(language);
}

export { i18n };
