import { useEffect } from 'react';
import { fetchMe } from '../services/auth.service';
import { syncProfileToStore } from '../services/profile-sync';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../stores/authStore';

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
        const profile = await fetchMe();
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

    const init = async () => {
      setLoading(true);
      const { data } = await supabase.auth.getSession();

      if (!mounted) {
        return;
      }

      setSession(data.session, data.session?.user ?? null);

      if (data.session) {
        await loadProfile();
      } else {
        setProfile(null);
      }

      setLoading(false);
      setInitialized(true);
    };

    void init();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session, session?.user ?? null);

      if (session) {
        await loadProfile();
      } else {
        setProfile(null);
        setProfileLoading(false);
      }

      setLoading(false);
      setInitialized(true);
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
