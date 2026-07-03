import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';
import { AuthUser } from '../../users/users.types';

@Injectable()
export class AdminRoleGuard implements CanActivate {
  constructor(private readonly supabase: SupabaseService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<{ user?: AuthUser }>();
    const user = request.user;

    if (!user) {
      return false;
    }

    const { data, error } = await this.supabase.db
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();

    if (error) {
      throw new ForbiddenException('Unable to verify admin role');
    }

    if (data?.role !== 'admin') {
      throw new ForbiddenException('Admin role required');
    }

    return true;
  }
}
