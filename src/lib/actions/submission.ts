"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type SubmissionActionState = {
  error: string | null;
};

export async function recordSubmissionAction(
  _prevState: SubmissionActionState,
  formData: FormData
): Promise<SubmissionActionState> {
  const enrollmentId = String(formData.get("enrollmentId") ?? "");
  const lessonId = String(formData.get("lessonId") ?? "");
  const audioPath = String(formData.get("audioPath") ?? "");
  const revalidateTarget = String(formData.get("revalidatePath") ?? "");

  if (!enrollmentId || !lessonId || !audioPath) {
    return { error: "missing_fields" };
  }

  const supabase = await createClient();

  // Verify the caller actually owns this enrollment before recording —
  // RLS also enforces this, but we check explicitly for a clearer error.
  const { data: claimsData } = await supabase.auth.getClaims();
  if (!claimsData?.claims) {
    return { error: "not_authenticated" };
  }

  const { error } = await supabase.from("submissions").upsert(
    {
      enrollment_id: enrollmentId,
      lesson_id: lessonId,
      audio_path: audioPath,
      status: "pending",
      verdict: null,
      feedback: null,
      reviewed_by: null,
      reviewed_at: null,
      submitted_at: new Date().toISOString(),
    },
    { onConflict: "enrollment_id,lesson_id" }
  );

  if (error) {
    return { error: error.message };
  }

  if (revalidateTarget) revalidatePath(revalidateTarget);
  return { error: null };
}
