import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { resolve } from 'path';

config({ path: resolve(process.cwd(), '.env') });
config({ path: resolve(process.cwd(), 'apps/api/.env') });

const email = process.argv[2]?.trim().toLowerCase();

if (!email) {
  console.error('Usage: pnpm create-admin <email>');
  process.exit(1);
}

const supabaseUrl = process.env.SUPABASE_URL?.trim();
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

if (!supabaseUrl || !serviceRoleKey) {
  console.error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function main() {
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, email, role')
    .eq('email', email)
    .maybeSingle();

  if (profileError) {
    throw profileError;
  }

  let userId = profile?.id as string | undefined;

  if (!userId) {
    const { data: authData, error: authError } =
      await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });

    if (authError) {
      throw authError;
    }

    const authUser = authData.users.find(
      (user) => user.email?.toLowerCase() === email,
    );

    if (!authUser) {
      console.error(`No user found for ${email}`);
      process.exit(1);
    }

    userId = authUser.id;
  }

  const { data, error } = await supabase
    .from('profiles')
    .update({
      role: 'admin',
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId)
    .select('id, email, role')
    .single();

  if (error) {
    throw error;
  }

  console.log(`Promoted ${data.email ?? email} to admin (${data.id}).`);
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
