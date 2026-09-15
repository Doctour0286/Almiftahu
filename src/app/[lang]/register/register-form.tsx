"use client";

import { useActionState } from "react";
import { registerAction, type AuthActionState } from "@/lib/actions/auth";
import type { Dictionary, Locale } from "@/lib/i18n/dictionaries";

const initialState: AuthActionState = { error: null };

export function RegisterForm({
  lang,
  dict,
}: {
  lang: Locale;
  dict: Dictionary;
}) {
  const [state, formAction, pending] = useActionState(
    registerAction,
    initialState
  );

  const errorMessage =
    state.error === "password_mismatch"
      ? dict.auth.passwordMismatch
      : state.error === "missing_fields"
        ? dict.auth.genericError
        : state.error
          ? dict.auth.genericError
          : null;

  return (
    <form action={formAction} className="mt-8 space-y-5">
      <input type="hidden" name="lang" value={lang} />

      {errorMessage && (
        <p className="rounded-sm border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger">
          {errorMessage}
        </p>
      )}

      <div>
        <label htmlFor="fullName" className="block text-sm font-medium text-ink">
          {dict.auth.fullName}
        </label>
        <input
          id="fullName"
          name="fullName"
          type="text"
          required
          autoComplete="name"
          className="mt-1.5 w-full rounded-sm border border-line bg-white px-3.5 py-2.5 text-ink outline-none focus:border-bottle focus:ring-1 focus:ring-bottle"
        />
      </div>

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

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-ink">
          {dict.auth.password}
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className="mt-1.5 w-full rounded-sm border border-line bg-white px-3.5 py-2.5 text-ink outline-none focus:border-bottle focus:ring-1 focus:ring-bottle"
        />
      </div>

      <div>
        <label
          htmlFor="confirmPassword"
          className="block text-sm font-medium text-ink"
        >
          {dict.auth.confirmPassword}
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          onPaste={(e) => e.preventDefault()}
          className="mt-1.5 w-full rounded-sm border border-line bg-white px-3.5 py-2.5 text-ink outline-none focus:border-bottle focus:ring-1 focus:ring-bottle"
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-sm bg-bottle px-4 py-3 font-medium text-parchment transition-colors hover:bg-bottle-light disabled:opacity-60"
      >
        {pending ? dict.common.loading : dict.auth.submitRegister}
      </button>
    </form>
  );
}
