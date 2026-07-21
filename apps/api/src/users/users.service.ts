import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { DeleteAccountInput, SignupRole, UpdateProfileInput } from '@lmi/shared';
import { SupabaseService } from '../supabase/supabase.service';
import {
  AuthUser,
  ProfileResponse,
  ProfileRow,
  toProfileResponse,
} from './users.types';

@Injectable()
export class UsersService {
  constructor(private readonly supabase: SupabaseService) {}

  async getMe(authUser: AuthUser): Promise<ProfileResponse> {
    let profile = await this.getOrCreateProfile(authUser);
    if (profile.account_status === 'pending_deletion') {
      await this.cancelDeletion(authUser.id);
      const refreshed = await this.fetchProfile(authUser.id);
      if (refreshed) {
        profile = refreshed;
      }
    }
    const isPremium = await this.hasActivePremium(authUser.id);
    return toProfileResponse(profile, isPremium);
  }

  async setRole(authUser: AuthUser, role: SignupRole): Promise<ProfileResponse> {
    await this.assertAccountMutable(authUser.id);

    const { data, error } = await this.supabase.db
      .from('profiles')
      .update({
        role,
        role_selected_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', authUser.id)
      .select('*')
      .single();

    if (error) {
      throw error;
    }

    const isPremium = await this.hasActivePremium(authUser.id);
    return toProfileResponse(data as ProfileRow, isPremium);
  }

  async updateProfile(
    authUser: AuthUser,
    input: UpdateProfileInput,
  ): Promise<ProfileResponse> {
    await this.assertAccountMutable(authUser.id);
    await this.getOrCreateProfile(authUser);

    const { data, error } = await this.supabase.db
      .from('profiles')
      .update({
        display_name: input.displayName.trim(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', authUser.id)
      .select('*')
      .single();

    if (error) {
      throw error;
    }

    const isPremium = await this.hasActivePremium(authUser.id);
    return toProfileResponse(data as ProfileRow, isPremium);
  }

  async completeOnboarding(authUser: AuthUser): Promise<ProfileResponse> {
    await this.assertAccountMutable(authUser.id);

    const { data, error } = await this.supabase.db
      .from('profiles')
      .update({
        onboarding_completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', authUser.id)
      .select('*')
      .single();

    if (error) {
      throw error;
    }

    const isPremium = await this.hasActivePremium(authUser.id);
    return toProfileResponse(data as ProfileRow, isPremium);
  }

  async acceptGuidelines(authUser: AuthUser): Promise<ProfileResponse> {
    await this.assertAccountMutable(authUser.id);

    const { data, error } = await this.supabase.db
      .from('profiles')
      .update({
        guidelines_accepted_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', authUser.id)
      .select('*')
      .single();

    if (error) {
      throw error;
    }

    const isPremium = await this.hasActivePremium(authUser.id);
    return toProfileResponse(data as ProfileRow, isPremium);
  }

  async getPendingWarnings(authUser: AuthUser) {
    const { data, error } = await this.supabase.db
      .from('account_warnings')
      .select('id, title, body, related_submission_id, created_at')
      .eq('user_id', authUser.id)
      .is('acknowledged_at', null)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return (data ?? []).map((row) => ({
      id: row.id as string,
      title: row.title as string,
      body: row.body as string,
      relatedSubmissionId: row.related_submission_id as string | null,
      createdAt: row.created_at as string,
    }));
  }

  async acknowledgeWarning(authUser: AuthUser, warningId: string) {
    const { data, error } = await this.supabase.db
      .from('account_warnings')
      .update({
        acknowledged_at: new Date().toISOString(),
      })
      .eq('id', warningId)
      .eq('user_id', authUser.id)
      .select('id')
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!data) {
      throw new BadRequestException('Warning not found');
    }

    return { acknowledged: true };
  }

  async requestAccountDeletion(
    authUser: AuthUser,
    _input: DeleteAccountInput,
  ): Promise<{ scheduled: true; permanentDeleteAt: string | null }> {
    await this.assertAccountMutable(authUser.id);

    const { error } = await this.supabase.db.rpc('schedule_account_deletion', {
      p_user_id: authUser.id,
    });

    if (error) {
      throw error;
    }

    const profile = await this.fetchProfile(authUser.id);
    return {
      scheduled: true,
      permanentDeleteAt: profile?.permanent_delete_at ?? null,
    };
  }

  async cancelAccountDeletion(authUser: AuthUser): Promise<ProfileResponse> {
    await this.cancelDeletion(authUser.id);
    const profile = await this.fetchProfile(authUser.id);

    if (!profile) {
      throw new BadRequestException('Profile not found');
    }

    const isPremium = await this.hasActivePremium(authUser.id);
    return toProfileResponse(profile, isPremium);
  }

  private async cancelDeletion(userId: string): Promise<void> {
    const { error } = await this.supabase.db.rpc('cancel_account_deletion', {
      p_user_id: userId,
    });

    if (error) {
      throw error;
    }
  }

  private async assertAccountMutable(userId: string): Promise<void> {
    const profile = await this.fetchProfile(userId);

    if (!profile) {
      throw new BadRequestException('Profile not found');
    }

    if (profile.account_status === 'suspended' || profile.account_status === 'banned') {
      throw new ForbiddenException('Account is not active');
    }
  }

  private async getOrCreateProfile(authUser: AuthUser): Promise<ProfileRow> {
    const existing = await this.fetchProfile(authUser.id);
    if (existing) {
      return existing;
    }

    const displayName = this.resolveDisplayName(authUser);

    const { data, error } = await this.supabase.db
      .from('profiles')
      .insert({
        id: authUser.id,
        email: authUser.email ?? null,
        phone: authUser.phone ?? null,
        display_name: displayName,
      })
      .select('*')
      .single();

    if (error) {
      if (error.code === '23505') {
        const raced = await this.fetchProfile(authUser.id);
        if (raced) {
          return raced;
        }
      }
      throw error;
    }

    return data as ProfileRow;
  }

  private async fetchProfile(userId: string): Promise<ProfileRow | null> {
    const { data, error } = await this.supabase.db
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      throw error;
    }

    return (data as ProfileRow | null) ?? null;
  }

  private resolveDisplayName(authUser: AuthUser): string {
    const metadata = authUser.userMetadata ?? {};
    const candidates = [
      metadata.display_name,
      metadata.full_name,
      metadata.name,
    ];

    for (const candidate of candidates) {
      if (typeof candidate === 'string' && candidate.trim()) {
        return candidate.trim();
      }
    }

    if (authUser.email) {
      return authUser.email.split('@')[0] ?? 'User';
    }

    if (authUser.phone) {
      return authUser.phone.slice(-4).padStart(8, 'User ');
    }

    return 'User';
  }

  private async hasActivePremium(userId: string): Promise<boolean> {
    const { data, error } = await this.supabase.db
      .from('subscriptions')
      .select('id, status, current_period_end')
      .eq('user_id', userId)
      .eq('subscription_type', 'shopper_premium')
      .eq('status', 'active')
      .maybeSingle();

    if (error || !data) {
      return false;
    }

    if (!data.current_period_end) {
      return true;
    }

    return new Date(data.current_period_end).getTime() > Date.now();
  }
}
