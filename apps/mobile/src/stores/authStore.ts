import type { Session, User } from '@supabase/supabase-js';
import { UserRole } from '@lmi/shared';
import { create } from 'zustand';
import { supabase } from '../lib/supabase';

export interface AuthProfile {
  id: string;
  displayName: string | null;
  role: UserRole;
  accountStatus: string;
  onboardingCompletedAt: string | null;
  roleSelectedAt: string | null;
  guidelinesAcceptedAt: string | null;
  isPremium: boolean;
}

interface AuthState {
  session: Session | null;
  user: User | null;
  role: UserRole | null;
  profile: AuthProfile | null;
  isLoading: boolean;
  isInitialized: boolean;
  isProfileLoading: boolean;
  setSession: (session: Session | null, user: User | null) => void;
  setProfile: (profile: AuthProfile | null) => void;
  setRole: (role: UserRole | null) => void;
  setLoading: (isLoading: boolean) => void;
  setInitialized: (isInitialized: boolean) => void;
  setProfileLoading: (isProfileLoading: boolean) => void;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  user: null,
  role: null,
  profile: null,
  isLoading: true,
  isInitialized: false,
  isProfileLoading: false,
  setSession: (session, user) => set({ session, user }),
  setProfile: (profile) =>
    set({
      profile,
      role: profile?.role ?? null,
    }),
  setRole: (role) => set({ role }),
  setLoading: (isLoading) => set({ isLoading }),
  setInitialized: (isInitialized) => set({ isInitialized }),
  setProfileLoading: (isProfileLoading) => set({ isProfileLoading }),
  signOut: async () => {
    await supabase.auth.signOut();
    set({
      session: null,
      user: null,
      role: null,
      profile: null,
    });
  },
}));
