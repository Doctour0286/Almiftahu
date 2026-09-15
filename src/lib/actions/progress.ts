"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type MarkCompleteState = {
  error: string | null;
};

export async function markLessonCompleteAction(
  _prevState: MarkCompleteState,
  formData: FormData
): Promise<MarkCompleteState> {
  const enrollmentId = String(formData.get("enrollmentId") ?? "");
  const lessonId = String(formData.get("lessonId") ?? "");
  const revalidateTarget = String(formData.get("revalidatePath") ?? "");

  if (!enrollmentId || !lessonId) {
    return { error: "missing_fields" };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("lesson_progress").upsert(
    {
      enrollment_id: enrollmentId,
      lesson_id: lessonId,
      completed_at: new Date().toISOString(),
    },
    { onConflict: "enrollment_id,lesson_id" }
  );

  if (error) {
    return { error: error.message };
  }

  if (revalidateTarget) revalidatePath(revalidateTarget);
  return { error: null };
}
