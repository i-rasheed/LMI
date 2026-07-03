import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';
import { AuthUser } from '../../users/users.types';

@Injectable()
export class VendorRoleGuard implements CanActivate {
  constructor(private readonly supabase: SupabaseService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<{ user?: AuthUser }>();
    const user = request.user;

    if (!user) {
      return false;
    }

    const { data, error } = await this.supabase.db
      .from('profiles')
      .select('role, account_status')
      .eq('id', user.id)
      .maybeSingle();

    if (error) {
      throw new ForbiddenException('Unable to verify vendor role');
    }

    const role = data?.role as string | undefined;
    const accountStatus = data?.account_status as string | undefined;

    if (accountStatus !== 'active' && accountStatus !== 'pending_deletion') {
      throw new ForbiddenException('Account is not active');
    }

    if (role !== 'vendor' && role !== 'admin') {
      throw new ForbiddenException('Vendor role required');
    }

    return true;
  }
}
