"use client";

import { useActionState } from "react";
import {
  markLessonCompleteAction,
  type MarkCompleteState,
} from "@/lib/actions/progress";
import type { Dictionary } from "@/lib/i18n/dictionaries";

const initialState: MarkCompleteState = { error: null };

export function MarkCompleteButton({
  enrollmentId,
  lessonId,
  revalidateTarget,
  completed,
  dict,
}: {
  enrollmentId: string;
  lessonId: string;
  revalidateTarget: string;
  completed: boolean;
  dict: Dictionary;
}) {
  const [, formAction, pending] = useActionState(
    markLessonCompleteAction,
    initialState
  );

  if (completed) {
    return (
      <span className="inline-flex items-center gap-2 rounded-sm bg-sage/10 px-4 py-2 text-sm font-medium text-bottle">
        ✓ {dict.lesson.completed}
      </span>
    );
  }

  return (
    <form action={formAction}>
      <input type="hidden" name="enrollmentId" value={enrollmentId} />
      <input type="hidden" name="lessonId" value={lessonId} />
      <input type="hidden" name="revalidatePath" value={revalidateTarget} />
      <button
        type="submit"
        disabled={pending}
        className="rounded-sm border border-bottle px-4 py-2 text-sm font-medium text-bottle transition-colors hover:bg-bottle hover:text-parchment disabled:opacity-60"
      >
        {pending ? dict.common.loading : dict.lesson.markComplete}
      </button>
    </form>
  );
}
