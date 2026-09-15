"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isLocale, defaultLocale } from "@/lib/i18n/config";

export type AuthActionState = {
  error: string | null;
};

function resolveLocale(value: FormDataEntryValue | null): string {
  const lang = typeof value === "string" ? value : "";
  return isLocale(lang) ? lang : defaultLocale;
}

export async function registerAction(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const lang = resolveLocale(formData.get("lang"));
  const fullName = String(formData.get("fullName") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (!fullName || !email || !password) {
    return { error: "missing_fields" };
  }
  if (password !== confirmPassword) {
    return { error: "password_mismatch" };
  }

  const supabase = await createClient();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        // role intentionally omitted — every self-registered account is a
        // student by default (see handle_new_user trigger). Teacher/admin
        // accounts are promoted by an admin, never chosen at signup.
      },
      emailRedirectTo: `${siteUrl}/${lang}/dashboard`,
    },
  });

  if (error) {
    return { error: error.message };
  }

  redirect(`/${lang}/dashboard`);
}

export async function loginAction(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const lang = resolveLocale(formData.get("lang"));
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "missing_fields" };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  redirect(`/${lang}/dashboard`);
}

export async function logoutAction(formData: FormData) {
  const lang = resolveLocale(formData.get("lang"));
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect(`/${lang}`);
}
