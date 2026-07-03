import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AdminClaimActionInput } from '@lmi/shared';
import { SupabaseService } from '../supabase/supabase.service';
import {
  ClaimActionResult,
  ClaimQueueItem,
  ClaimReviewDetail,
  mapClaimQueueItem,
  VendorStallRow,
} from '../vendors/vendors.types';

@Injectable()
export class AdminClaimsService {
  constructor(private readonly supabase: SupabaseService) {}

  async listClaimQueue(): Promise<ClaimQueueItem[]> {
    const { data, error } = await this.supabase.db
      .from('vendor_stalls')
      .select(
        `
        *,
        markets!inner ( id, name, slug, area ),
        profiles!inner ( id, display_name )
      `,
      )
      .eq('claim_status', 'pending')
      .order('created_at', { ascending: true });

    if (error) {
      throw error;
    }

    return (
      (data as Array<
        VendorStallRow & {
          markets: { id: string; name: string; slug: string; area: string };
          profiles: { id: string; display_name: string | null };
        }
      >) ?? []
    ).map(mapClaimQueueItem);
  }

  async getClaimReview(claimId: string): Promise<ClaimReviewDetail> {
    const { data, error } = await this.supabase.db
      .from('vendor_stalls')
      .select(
        `
        *,
        markets!inner ( id, name, slug, area ),
        profiles!inner ( id, display_name )
      `,
      )
      .eq('id', claimId)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!data) {
      throw new NotFoundException('Claim not found');
    }

    const item = mapClaimQueueItem(
      data as VendorStallRow & {
        markets: { id: string; name: string; slug: string; area: string };
        profiles: { id: string; display_name: string | null };
      },
    );

    return {
      ...item,
      rejectionReason: (data as VendorStallRow).rejection_reason,
      reviewedAt: (data as VendorStallRow).reviewed_at,
    };
  }

  async applyClaimAction(
    adminId: string,
    claimId: string,
    action: AdminClaimActionInput,
  ): Promise<ClaimActionResult> {
    const review = await this.getClaimReview(claimId);

    if (review.claimStatus !== 'pending') {
      throw new BadRequestException('Only pending claims can be reviewed');
    }

    const now = new Date().toISOString();

    if (action.action === 'approve') {
      const { error } = await this.supabase.db
        .from('vendor_stalls')
        .update({
          claim_status: 'approved',
          rejection_reason: null,
          reviewed_by: adminId,
          reviewed_at: now,
          is_verified: true,
          vendor_tier: 'basic',
        })
        .eq('id', claimId);

      if (error) {
        throw error;
      }

      await this.logAdminAction(adminId, 'claim_approve', claimId);

      return {
        claimId,
        claimStatus: 'approved',
        action: 'approve',
      };
    }

    if (action.action === 'reject') {
      if (!action.rejectionReason) {
        throw new BadRequestException('rejectionReason is required for reject');
      }

      const { error } = await this.supabase.db
        .from('vendor_stalls')
        .update({
          claim_status: 'rejected',
          rejection_reason: action.rejectionReason,
          reviewed_by: adminId,
          reviewed_at: now,
        })
        .eq('id', claimId);

      if (error) {
        throw error;
      }

      await this.logAdminAction(adminId, 'claim_reject', claimId, {
        rejectionReason: action.rejectionReason,
      });

      return {
        claimId,
        claimStatus: 'rejected',
        action: 'reject',
      };
    }

    throw new BadRequestException('Unsupported claim action');
  }

  private async logAdminAction(
    adminId: string,
    actionType: string,
    targetId: string,
    metadata: Record<string, unknown> = {},
  ): Promise<void> {
    const { error } = await this.supabase.db.from('admin_actions').insert({
      admin_id: adminId,
      action_type: actionType,
      target_type: 'vendor_stall',
      target_id: targetId,
      metadata,
    });

    if (error) {
      throw error;
    }
  }
}
