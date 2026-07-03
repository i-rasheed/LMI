import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import axios from 'axios';
import { createHmac, timingSafeEqual } from 'crypto';
import { SupabaseService } from '../supabase/supabase.service';
import { AuthUser } from '../users/users.types';
import { InitializeSubscriptionInput } from './subscriptions.dto';
import {
  PaystackInitializeResponse,
  PaystackWebhookPayload,
  SubscriptionPlanItem,
  SubscriptionPlanRow,
  SubscriptionRow,
  SubscriptionStatusResponse,
} from './subscriptions.types';

function first<T>(value: T | T[]): T {
  return Array.isArray(value) ? value[0] : value;
}

@Injectable()
export class SubscriptionsService {
  private readonly paystackSecretKey = process.env.PAYSTACK_SECRET_KEY ?? '';
  private readonly paystackBaseUrl = 'https://api.paystack.co';

  constructor(private readonly supabase: SupabaseService) {}

  async listPlans(): Promise<SubscriptionPlanItem[]> {
    return this.listPlansByTypes(['shopper_premium']);
  }

  async listVendorPlans(): Promise<SubscriptionPlanItem[]> {
    return this.listPlansByTypes(['vendor_basic', 'vendor_pro']);
  }

  private async listPlansByTypes(
    planTypes: string[],
  ): Promise<SubscriptionPlanItem[]> {
    const { data, error } = await this.supabase.db
      .from('subscription_plans')
      .select('*')
      .in('plan_type', planTypes)
      .eq('is_active', true)
      .order('amount_kobo', { ascending: true });

    if (error) {
      throw error;
    }

    return ((data as SubscriptionPlanRow[]) ?? []).map(this.mapPlan);
  }

  async getMine(userId: string): Promise<SubscriptionStatusResponse> {
    const { data, error } = await this.supabase.db
      .from('subscriptions')
      .select(
        `
        *,
        subscription_plans!inner (
          id,
          plan_type,
          name,
          amount_kobo,
          billing_interval,
          paystack_plan_code,
          is_active,
          created_at
        )
      `,
      )
      .eq('user_id', userId)
      .eq('subscription_type', 'shopper_premium')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!data) {
      return { isPremium: false, subscription: null };
    }

    const row = data as unknown as SubscriptionRow;
    const plan = row.subscription_plans ? first(row.subscription_plans) : null;
    const isPremium =
      row.status === 'active' &&
      (!row.current_period_end ||
        new Date(row.current_period_end).getTime() > Date.now());

    return {
      isPremium,
      subscription: {
        id: row.id,
        planId: row.plan_id,
        status: row.status,
        billingInterval: plan?.billing_interval ?? null,
        currentPeriodEnd: row.current_period_end,
        cancelAtPeriodEnd: row.cancel_at_period_end,
      },
    };
  }

  async initialize(
    user: AuthUser,
    input: InitializeSubscriptionInput,
  ): Promise<PaystackInitializeResponse> {
    return this.initializePlan(user, input, {
      allowedPlanTypes: ['shopper_premium'],
    });
  }

  async initializeVendor(
    user: AuthUser,
    input: InitializeSubscriptionInput & { vendorStallId: string },
  ): Promise<PaystackInitializeResponse> {
    return this.initializePlan(user, input, {
      allowedPlanTypes: ['vendor_basic', 'vendor_pro'],
      vendorStallId: input.vendorStallId,
    });
  }

  private async initializePlan(
    user: AuthUser,
    input: InitializeSubscriptionInput,
    options: { allowedPlanTypes: string[]; vendorStallId?: string },
  ): Promise<PaystackInitializeResponse> {
    if (!this.paystackSecretKey) {
      throw new InternalServerErrorException('Paystack is not configured');
    }

    const plan = await this.getPlan(input.planId);
    if (!options.allowedPlanTypes.includes(plan.plan_type) || !plan.is_active) {
      throw new BadRequestException('Plan is not available');
    }

    const email = user.email ?? (await this.getUserEmail(user.id));
    if (!email) {
      throw new BadRequestException('Add an email before subscribing');
    }

    const response = await axios.post(
      `${this.paystackBaseUrl}/transaction/initialize`,
      {
        email,
        amount: plan.amount_kobo,
        plan: plan.paystack_plan_code ?? undefined,
        callback_url: input.callbackUrl,
        metadata: {
          userId: user.id,
          planId: plan.id,
          subscriptionType: plan.plan_type,
          vendorStallId: options.vendorStallId,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${this.paystackSecretKey}`,
          'Content-Type': 'application/json',
        },
      },
    );

    const data = response.data?.data;
    if (!data?.authorization_url || !data?.access_code || !data?.reference) {
      throw new InternalServerErrorException('Paystack checkout failed');
    }

    return {
      authorizationUrl: data.authorization_url,
      accessCode: data.access_code,
      reference: data.reference,
    };
  }

  async handleWebhook(
    payload: PaystackWebhookPayload,
    signature: string | undefined,
    rawBody: Buffer | undefined,
  ): Promise<{ received: true }> {
    this.verifyWebhookSignature(signature, rawBody);

    if (payload.event !== 'charge.success') {
      return { received: true };
    }

    const data = payload.data;
    const reference = data?.reference;
    const userId = data?.metadata?.userId;
    const planId = data?.metadata?.planId;
    const subscriptionType = data?.metadata?.subscriptionType ?? 'shopper_premium';
    const vendorStallId = data?.metadata?.vendorStallId;

    if (!reference || !userId || !planId) {
      throw new BadRequestException('Webhook metadata is incomplete');
    }

    const existing = await this.getPaymentByReference(reference);
    if (existing) {
      return { received: true };
    }

    const plan = await this.getPlan(planId);
    const now = new Date();
    const periodEnd = this.addBillingPeriod(now, plan.billing_interval);
    const subscription =
      subscriptionType === 'vendor_basic' || subscriptionType === 'vendor_pro'
        ? await this.upsertVendorSubscription({
            userId,
            vendorStallId,
            plan,
            currentPeriodStart: now.toISOString(),
            currentPeriodEnd: periodEnd.toISOString(),
            paystackCustomerCode: data?.customer?.customer_code ?? null,
            paystackSubscriptionCode: data?.subscription?.subscription_code ?? null,
            paystackEmailToken: data?.subscription?.email_token ?? null,
          })
        : await this.upsertShopperSubscription({
      userId,
      plan,
      currentPeriodStart: now.toISOString(),
      currentPeriodEnd: periodEnd.toISOString(),
      paystackCustomerCode: data?.customer?.customer_code ?? null,
      paystackSubscriptionCode: data?.subscription?.subscription_code ?? null,
      paystackEmailToken: data?.subscription?.email_token ?? null,
        });

    const { error } = await this.supabase.db.from('payment_transactions').insert({
      user_id: userId,
      subscription_id: subscription.id,
      paystack_reference: reference,
      amount_kobo: data?.amount ?? plan.amount_kobo,
      currency: data?.currency ?? 'NGN',
      status: data?.status ?? 'success',
      channel: data?.channel ?? null,
      paid_at: data?.paid_at ?? now.toISOString(),
      raw_payload: payload,
    });

    if (error) {
      if (error.code === '23505') {
        return { received: true };
      }
      throw error;
    }

    return { received: true };
  }

  private verifyWebhookSignature(
    signature: string | undefined,
    rawBody: Buffer | undefined,
  ): void {
    if (!this.paystackSecretKey) {
      throw new InternalServerErrorException('Paystack is not configured');
    }
    if (!signature || !rawBody) {
      throw new UnauthorizedException('Missing Paystack signature');
    }

    const expected = createHmac('sha512', this.paystackSecretKey)
      .update(rawBody)
      .digest('hex');

    const signatureBuffer = Buffer.from(signature, 'hex');
    const expectedBuffer = Buffer.from(expected, 'hex');

    if (
      signatureBuffer.length !== expectedBuffer.length ||
      !timingSafeEqual(signatureBuffer, expectedBuffer)
    ) {
      throw new UnauthorizedException('Invalid Paystack signature');
    }
  }

  private async getPlan(planId: string): Promise<SubscriptionPlanRow> {
    const { data, error } = await this.supabase.db
      .from('subscription_plans')
      .select('*')
      .eq('id', planId)
      .maybeSingle();

    if (error) {
      throw error;
    }
    if (!data) {
      throw new NotFoundException('Plan not found');
    }

    return data as SubscriptionPlanRow;
  }

  private async getUserEmail(userId: string): Promise<string | null> {
    const { data, error } = await this.supabase.db
      .from('profiles')
      .select('email')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      throw error;
    }

    return data?.email ?? null;
  }

  private async getPaymentByReference(reference: string): Promise<{ id: string } | null> {
    const { data, error } = await this.supabase.db
      .from('payment_transactions')
      .select('id')
      .eq('paystack_reference', reference)
      .maybeSingle();

    if (error) {
      throw error;
    }

    return data ?? null;
  }

  private async upsertShopperSubscription(input: {
    userId: string;
    plan: SubscriptionPlanRow;
    currentPeriodStart: string;
    currentPeriodEnd: string;
    paystackCustomerCode: string | null;
    paystackSubscriptionCode: string | null;
    paystackEmailToken: string | null;
  }): Promise<SubscriptionRow> {
    const { data: existing, error: existingError } = await this.supabase.db
      .from('subscriptions')
      .select('*')
      .eq('user_id', input.userId)
      .eq('subscription_type', 'shopper_premium')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (existingError) {
      throw existingError;
    }

    const payload = {
      plan_id: input.plan.id,
      subscription_type: 'shopper_premium',
      status: 'active',
      current_period_start: input.currentPeriodStart,
      current_period_end: input.currentPeriodEnd,
      cancel_at_period_end: false,
      cancelled_at: null,
      paystack_customer_code: input.paystackCustomerCode,
      paystack_subscription_code: input.paystackSubscriptionCode,
      paystack_email_token: input.paystackEmailToken,
      updated_at: new Date().toISOString(),
    };

    if (existing) {
      const { data, error } = await this.supabase.db
        .from('subscriptions')
        .update(payload)
        .eq('id', (existing as SubscriptionRow).id)
        .select('*')
        .single();

      if (error) {
        throw error;
      }
      return data as SubscriptionRow;
    }

    const { data, error } = await this.supabase.db
      .from('subscriptions')
      .insert({
        ...payload,
        user_id: input.userId,
        vendor_stall_id: null,
      })
      .select('*')
      .single();

    if (error) {
      throw error;
    }
    return data as SubscriptionRow;
  }

  private async upsertVendorSubscription(input: {
    userId: string;
    vendorStallId?: string;
    plan: SubscriptionPlanRow;
    currentPeriodStart: string;
    currentPeriodEnd: string;
    paystackCustomerCode: string | null;
    paystackSubscriptionCode: string | null;
    paystackEmailToken: string | null;
  }): Promise<SubscriptionRow> {
    if (!input.vendorStallId) {
      throw new BadRequestException('Vendor stall metadata is required');
    }

    const { data: stall, error: stallError } = await this.supabase.db
      .from('vendor_stalls')
      .select('id, owner_id')
      .eq('id', input.vendorStallId)
      .eq('owner_id', input.userId)
      .maybeSingle();

    if (stallError) {
      throw stallError;
    }

    if (!stall) {
      throw new BadRequestException('Vendor stall not found');
    }

    const { data: existing, error: existingError } = await this.supabase.db
      .from('subscriptions')
      .select('*')
      .eq('vendor_stall_id', input.vendorStallId)
      .in('subscription_type', ['vendor_basic', 'vendor_pro'])
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (existingError) {
      throw existingError;
    }

    const payload = {
      plan_id: input.plan.id,
      subscription_type: input.plan.plan_type,
      status: 'active',
      current_period_start: input.currentPeriodStart,
      current_period_end: input.currentPeriodEnd,
      cancel_at_period_end: false,
      cancelled_at: null,
      paystack_customer_code: input.paystackCustomerCode,
      paystack_subscription_code: input.paystackSubscriptionCode,
      paystack_email_token: input.paystackEmailToken,
      updated_at: new Date().toISOString(),
    };

    const subscription = existing
      ? await this.updateSubscription((existing as SubscriptionRow).id, payload)
      : await this.insertSubscription({
          ...payload,
          user_id: input.userId,
          vendor_stall_id: input.vendorStallId,
        });

    const { error: stallUpdateError } = await this.supabase.db
      .from('vendor_stalls')
      .update({
        vendor_tier: input.plan.plan_type === 'vendor_pro' ? 'pro' : 'basic',
        updated_at: new Date().toISOString(),
      })
      .eq('id', input.vendorStallId);

    if (stallUpdateError) {
      throw stallUpdateError;
    }

    return subscription;
  }

  private async updateSubscription(
    id: string,
    payload: Record<string, unknown>,
  ): Promise<SubscriptionRow> {
    const { data, error } = await this.supabase.db
      .from('subscriptions')
      .update(payload)
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      throw error;
    }
    return data as SubscriptionRow;
  }

  private async insertSubscription(
    payload: Record<string, unknown>,
  ): Promise<SubscriptionRow> {
    const { data, error } = await this.supabase.db
      .from('subscriptions')
      .insert(payload)
      .select('*')
      .single();

    if (error) {
      throw error;
    }
    return data as SubscriptionRow;
  }

  private addBillingPeriod(date: Date, interval: string): Date {
    const next = new Date(date);
    if (interval === 'annual') {
      next.setFullYear(next.getFullYear() + 1);
      return next;
    }
    next.setMonth(next.getMonth() + 1);
    return next;
  }

  private mapPlan(row: SubscriptionPlanRow): SubscriptionPlanItem {
    return {
      id: row.id,
      planType: row.plan_type,
      name: row.name,
      amountKobo: row.amount_kobo,
      amountNaira: row.amount_kobo / 100,
      billingInterval: row.billing_interval,
      paystackPlanCode: row.paystack_plan_code,
    };
  }
}
