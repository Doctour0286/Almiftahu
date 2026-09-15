"use client";

import { useActionState } from "react";
import {
  reviewSubmissionAction,
  type ReviewSubmissionState,
} from "@/lib/actions/teacher-review";
import type { Dictionary, Locale } from "@/lib/i18n/dictionaries";

const initialState: ReviewSubmissionState = { error: null };

export function ReviewForm({
  lang,
  submissionId,
  dict,
}: {
  lang: Locale;
  submissionId: string;
  dict: Dictionary;
}) {
  const [state, formAction, pending] = useActionState(
    reviewSubmissionAction,
    initialState
  );

  return (
    <form action={formAction} className="mt-4 space-y-3">
      <input type="hidden" name="lang" value={lang} />
      <input type="hidden" name="submissionId" value={submissionId} />

      {state.error && (
        <p className="text-sm text-danger">{dict.auth.genericError}</p>
      )}

      <textarea
        name="feedback"
        rows={2}
        placeholder={dict.teacher.leaveFeedback}
        className="w-full rounded-sm border border-line bg-white px-3.5 py-2.5 text-sm text-ink outline-none focus:border-bottle focus:ring-1 focus:ring-bottle"
      />

      <div className="flex gap-3">
        <button
          type="submit"
          name="verdict"
          value="correct"
          disabled={pending}
          className="rounded-sm bg-sage px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {dict.teacher.markCorrect}
        </button>
        <button
          type="submit"
          name="verdict"
          value="needs_correction"
          disabled={pending}
          className="rounded-sm border border-danger px-4 py-2 text-sm font-medium text-danger transition-colors hover:bg-danger hover:text-white disabled:opacity-60"
        >
          {dict.teacher.markNeedsCorrection}
        </button>
      </div>
    </form>
  );
}
