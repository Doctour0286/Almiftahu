"use client";

import { useActionState } from "react";
import {
  createLessonAction,
  type CreateLessonState,
} from "@/lib/actions/admin-lesson";
import type { Dictionary, Locale } from "@/lib/i18n/dictionaries";

const initialState: CreateLessonState = { error: null };

const inputClass =
  "mt-1.5 w-full rounded-sm border border-line bg-white px-3.5 py-2.5 text-ink outline-none focus:border-bottle focus:ring-1 focus:ring-bottle";
const labelClass = "block text-sm font-medium text-ink";

export function CreateLessonForm({
  lang,
  programmeId,
  nextOrderIndex,
  dict,
}: {
  lang: Locale;
  programmeId: string;
  nextOrderIndex: number;
  dict: Dictionary;
}) {
  const [state, formAction, pending] = useActionState(
    createLessonAction,
    initialState
  );
  const f = dict.admin.lessonForm;

  return (
    <form action={formAction} className="mt-8 space-y-6">
      <input type="hidden" name="lang" value={lang} />
      <input type="hidden" name="programmeId" value={programmeId} />

      {state.error && (
        <p className="rounded-sm border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger">
          {state.error}
        </p>
      )}

      <div>
        <label htmlFor="orderIndex" className={labelClass}>
          {f.orderIndex}
        </label>
        <input
          id="orderIndex"
          name="orderIndex"
          type="number"
          min={1}
          required
          defaultValue={nextOrderIndex}
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="title" className={labelClass}>
          {f.title}
        </label>
        <input
          id="title"
          name="title"
          type="text"
          required
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="description" className={labelClass}>
          {f.description}
        </label>
        <textarea
          id="description"
          name="description"
          rows={5}
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="contentType" className={labelClass}>
          {f.contentType}
        </label>
        <select
          id="contentType"
          name="contentType"
          defaultValue="mixed"
          className={inputClass}
        >
          <option value="video">{f.contentTypeVideo}</option>
          <option value="audio">{f.contentTypeAudio}</option>
          <option value="document">{f.contentTypeDocument}</option>
          <option value="mixed">{f.contentTypeMixed}</option>
        </select>
      </div>

      <div>
        <label htmlFor="videoUrl" className={labelClass}>
          {f.videoUrl}
        </label>
        <input
          id="videoUrl"
          name="videoUrl"
          type="url"
          placeholder="https://www.youtube.com/watch?v=..."
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="audioUrl" className={labelClass}>
          {f.audioUrl}
        </label>
        <input id="audioUrl" name="audioUrl" type="url" className={inputClass} />
      </div>

      <div>
        <label htmlFor="documentUrl" className={labelClass}>
          {f.documentUrl}
        </label>
        <input
          id="documentUrl"
          name="documentUrl"
          type="url"
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="unlockAt" className={labelClass}>
          {f.unlockAt}
        </label>
        <input
          id="unlockAt"
          name="unlockAt"
          type="date"
          className={inputClass}
        />
      </div>

      <label className="flex items-center gap-2 text-sm text-ink">
        <input type="checkbox" name="requiresSubmission" />
        {f.requiresSubmission}
      </label>

      <button
        type="submit"
        disabled={pending}
        className="rounded-sm bg-bottle px-6 py-3 font-medium text-parchment transition-colors hover:bg-bottle-light disabled:opacity-60"
      >
        {pending ? dict.common.loading : f.submit}
      </button>
    </form>
  );
}
