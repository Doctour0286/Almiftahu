"use server";

import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth/require-role";
import { isLocale, defaultLocale } from "@/lib/i18n/config";
import type { LessonContentType } from "@/lib/types/database";

export type CreateLessonState = {
  error: string | null;
};

export async function createLessonAction(
  _prevState: CreateLessonState,
  formData: FormData
): Promise<CreateLessonState> {
  const langRaw = String(formData.get("lang") ?? "");
  const lang = isLocale(langRaw) ? langRaw : defaultLocale;
  const programmeId = String(formData.get("programmeId") ?? "");

  const { supabase } = await requireRole(lang, ["admin"]);

  const orderIndex = Number(formData.get("orderIndex") ?? 0);
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const contentType = String(
    formData.get("contentType") ?? "mixed"
  ) as LessonContentType;
  const videoUrl = String(formData.get("videoUrl") ?? "").trim();
  const audioUrl = String(formData.get("audioUrl") ?? "").trim();
  const documentUrl = String(formData.get("documentUrl") ?? "").trim();
  const unlockAt = String(formData.get("unlockAt") ?? "");
  const requiresSubmission = formData.get("requiresSubmission") === "on";

  if (!programmeId || !title || !Number.isFinite(orderIndex)) {
    return { error: "missing_fields" };
  }

  const { error } = await supabase.from("lessons").insert({
    programme_id: programmeId,
    order_index: orderIndex,
    title,
    description: description || null,
    content_type: contentType,
    video_url: videoUrl || null,
    audio_url: audioUrl || null,
    document_url: documentUrl || null,
    unlock_at: unlockAt || null,
    requires_submission: requiresSubmission,
  });

  if (error) {
    return { error: error.message };
  }

  redirect(`/${lang}/admin/programmes/${programmeId}`);
}
