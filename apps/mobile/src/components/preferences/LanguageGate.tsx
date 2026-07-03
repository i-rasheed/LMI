import { useEffect } from 'react';
import { loadStoredLanguage } from '../../i18n';

export function LanguageGate() {
  useEffect(() => {
    void loadStoredLanguage();
  }, []);

  return null;
}
