"use client";

import { useActionState } from "react";
import {
  forgotPasswordAction,
  type ForgotPasswordState,
} from "@/lib/actions/forgot-password";
import type { Dictionary, Locale } from "@/lib/i18n/dictionaries";

const initialState: ForgotPasswordState = { error: null, submitted: false };

export function ForgotPasswordForm({
  lang,
  dict,
}: {
  lang: Locale;
  dict: Dictionary;
}) {
  const [state, formAction, pending] = useActionState(
    forgotPasswordAction,
    initialState
  );

  if (state.submitted) {
    return (
      <p className="mt-8 rounded-sm border border-sage/30 bg-sage/10 px-4 py-3 text-sm text-bottle">
        {dict.auth.resetLinkSent}
      </p>
    );
  }

  return (
    <form action={formAction} className="mt-8 space-y-5">
      <input type="hidden" name="lang" value={lang} />

      {state.error && (
        <p className="rounded-sm border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger">
          {dict.auth.genericError}
        </p>
      )}

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-ink">
          {dict.auth.email}
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="mt-1.5 w-full rounded-sm border border-line bg-white px-3.5 py-2.5 text-ink outline-none focus:border-bottle focus:ring-1 focus:ring-bottle"
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-sm bg-bottle px-4 py-3 font-medium text-parchment transition-colors hover:bg-bottle-light disabled:opacity-60"
      >
        {pending ? dict.common.loading : dict.auth.sendResetLink}
      </button>
    </form>
  );
}
