"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { isLocale, defaultLocale } from "@/lib/i18n/config";

export type EnrollActionState = {
  error: string | null;
};

export async function enrollAction(
  _prevState: EnrollActionState,
  formData: FormData
): Promise<EnrollActionState> {
  const langRaw = String(formData.get("lang") ?? "");
  const lang = isLocale(langRaw) ? langRaw : defaultLocale;
  const programmeId = String(formData.get("programmeId") ?? "");
  const slug = String(formData.get("slug") ?? "");

  if (!programmeId) {
    return { error: "missing_programme" };
  }

  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  if (!claimsData?.claims) {
    return { error: "not_authenticated" };
  }
  const userId = claimsData.claims.sub as string;

  const { error } = await supabase.from("enrollments").insert({
    programme_id: programmeId,
    student_id: userId,
  });

  if (error) {
    // Unique violation means they're already enrolled — treat as success.
    if (error.code !== "23505") {
      return { error: error.message };
    }
  }

  revalidatePath(`/${lang}/programmes/${slug}`);
  return { error: null };
}
