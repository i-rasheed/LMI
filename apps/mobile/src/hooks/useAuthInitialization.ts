import { useEffect } from 'react';
import { fetchMe } from '../services/auth.service';
import { syncProfileToStore } from '../services/profile-sync';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../stores/authStore';

const AUTH_TIMEOUT_MS = 8_000;

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_resolve, reject) => {
      setTimeout(() => reject(new Error('Auth initialization timed out')), ms);
    }),
  ]);
}

export function useAuthInitialization() {
  const setSession = useAuthStore((state) => state.setSession);
  const setLoading = useAuthStore((state) => state.setLoading);
  const setInitialized = useAuthStore((state) => state.setInitialized);
  const setProfileLoading = useAuthStore((state) => state.setProfileLoading);
  const setProfile = useAuthStore((state) => state.setProfile);

  useEffect(() => {
    let mounted = true;

    const loadProfile = async () => {
      setProfileLoading(true);
      try {
        const profile = await withTimeout(fetchMe(), AUTH_TIMEOUT_MS);
        if (mounted) {
          syncProfileToStore(profile);
        }
      } catch {
        if (mounted) {
          setProfile(null);
        }
      } finally {
        if (mounted) {
          setProfileLoading(false);
        }
      }
    };

    const finishInitialization = () => {
      if (!mounted) {
        return;
      }

      setLoading(false);
      setInitialized(true);
    };

    const init = async () => {
      setLoading(true);

      try {
        const { data } = await withTimeout(
          supabase.auth.getSession(),
          AUTH_TIMEOUT_MS,
        );

        if (!mounted) {
          return;
        }

        setSession(data.session, data.session?.user ?? null);
        finishInitialization();

        if (data.session) {
          void loadProfile();
        } else {
          setProfile(null);
        }
      } catch {
        if (mounted) {
          setSession(null, null);
          setProfile(null);
          finishInitialization();
        }
      }
    };

    void init();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session, session?.user ?? null);
      finishInitialization();

      if (session) {
        void loadProfile();
      } else {
        setProfile(null);
        setProfileLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [
    setInitialized,
    setLoading,
    setProfile,
    setProfileLoading,
    setSession,
  ]);
}
