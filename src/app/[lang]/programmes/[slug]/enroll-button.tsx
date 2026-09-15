"use client";

import { useActionState } from "react";
import { enrollAction, type EnrollActionState } from "@/lib/actions/enrollment";
import type { Dictionary, Locale } from "@/lib/i18n/dictionaries";

const initialState: EnrollActionState = { error: null };

export function EnrollButton({
  lang,
  slug,
  programmeId,
  dict,
}: {
  lang: Locale;
  slug: string;
  programmeId: string;
  dict: Dictionary;
}) {
  const [state, formAction, pending] = useActionState(
    enrollAction,
    initialState
  );

  return (
    <form action={formAction}>
      <input type="hidden" name="lang" value={lang} />
      <input type="hidden" name="slug" value={slug} />
      <input type="hidden" name="programmeId" value={programmeId} />
      {state.error && (
        <p className="mb-3 text-sm text-danger">{dict.auth.genericError}</p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="rounded-sm bg-bottle px-6 py-3 font-medium text-parchment transition-colors hover:bg-bottle-light disabled:opacity-60"
      >
        {pending ? dict.common.loading : dict.programme.register}
      </button>
    </form>
  );
}
