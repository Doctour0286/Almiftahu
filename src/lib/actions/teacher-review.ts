"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/require-role";
import { isLocale, defaultLocale } from "@/lib/i18n/config";
import type { SubmissionVerdict } from "@/lib/types/database";

export type ReviewSubmissionState = {
  error: string | null;
};

export async function reviewSubmissionAction(
  _prevState: ReviewSubmissionState,
  formData: FormData
): Promise<ReviewSubmissionState> {
  const langRaw = String(formData.get("lang") ?? "");
  const lang = isLocale(langRaw) ? langRaw : defaultLocale;

  const { supabase, profile } = await requireRole(lang, ["teacher", "admin"]);

  const submissionId = String(formData.get("submissionId") ?? "");
  const verdict = String(formData.get("verdict") ?? "") as SubmissionVerdict;
  const feedback = String(formData.get("feedback") ?? "").trim();

  if (!submissionId || !verdict) {
    return { error: "missing_fields" };
  }

  const { error } = await supabase
    .from("submissions")
    .update({
      status: "reviewed",
      verdict,
      feedback: feedback || null,
      reviewed_by: profile.id,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", submissionId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/${lang}/teacher`);
  return { error: null };
}
