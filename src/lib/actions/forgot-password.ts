"use server";

import { createClient } from "@/lib/supabase/server";
import { isLocale, defaultLocale } from "@/lib/i18n/config";
export type ForgotPasswordState = {
  error: string | null;
  submitted: boolean;
};

export async function forgotPasswordAction(
  _prevState: ForgotPasswordState,
  formData: FormData
): Promise<ForgotPasswordState> {
  const langRaw = String(formData.get("lang") ?? "");
  const lang = isLocale(langRaw) ? langRaw : defaultLocale;
  const email = String(formData.get("email") ?? "").trim();

  if (!email) {
    return { error: "missing_fields", submitted: false };
  }

  const supabase = await createClient();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  // Supabase deliberately does not reveal whether the account exists, so we
  // always return the same success state regardless of the outcome here.
  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${siteUrl}/${lang}/reset-password`,
  });

  return { error: null, submitted: true };
}
