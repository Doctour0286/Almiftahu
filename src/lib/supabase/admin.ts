import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Admin client using the service_role key. This BYPASSES Row Level Security.
 *
 * NEVER import this into any file that could end up in a Client Component
 * bundle. The `server-only` import above will throw a build error if that
 * ever happens by mistake.
 *
 * Use this only for trusted server-side operations that legitimately need
 * to act across users/roles (e.g. an admin creating a programme, a teacher
 * dashboard aggregating submissions across students, scheduled cleanup of
 * expired submission audio). Every call site must independently verify the
 * calling user's role before using this client — it does not do that for you.
 */
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
