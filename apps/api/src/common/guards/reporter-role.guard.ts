import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';
import { AuthUser } from '../../users/users.types';

@Injectable()
export class ReporterRoleGuard implements CanActivate {
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
      throw new ForbiddenException('Unable to verify reporter role');
    }

    const role = data?.role as string | undefined;
    const accountStatus = data?.account_status as string | undefined;

    if (accountStatus !== 'active' && accountStatus !== 'pending_deletion') {
      throw new ForbiddenException('Account is not active');
    }

    if (role !== 'reporter' && role !== 'admin') {
      throw new ForbiddenException('Reporter role required');
    }

    return true;
  }
}
