import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Profile, AppRole } from "@/lib/types/database";

/**
 * Verifies the current user is authenticated and has one of the allowed
 * roles. Redirects to login (if unauthenticated) or the dashboard (if
 * authenticated but unauthorized). This is a defense-in-depth UX guard —
 * RLS policies are the actual security boundary.
 */
export async function requireRole(lang: string, allowed: AppRole[]) {
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  if (!claimsData?.claims) {
    redirect(`/${lang}/login`);
  }
  const userId = claimsData.claims.sub as string;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single<Profile>();

  if (!profile || !allowed.includes(profile.role)) {
    redirect(`/${lang}/dashboard`);
  }

  return { supabase, profile };
}
