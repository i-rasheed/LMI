import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';
import { AuthUser, ProfileRow } from '../../users/users.types';

@Injectable()
export class ActiveAccountGuard implements CanActivate {
  constructor(private readonly supabase: SupabaseService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<{ user?: AuthUser }>();
    const user = request.user;

    if (!user) {
      return false;
    }

    const { data, error } = await this.supabase.db
      .from('profiles')
      .select('account_status')
      .eq('id', user.id)
      .maybeSingle();

    if (error) {
      throw new ForbiddenException('Unable to verify account status');
    }

    const status =
      (data as Pick<ProfileRow, 'account_status'> | null)?.account_status ??
      'active';

    if (status !== 'active' && status !== 'pending_deletion') {
      throw new ForbiddenException('Account is not active');
    }

    return true;
  }
}
