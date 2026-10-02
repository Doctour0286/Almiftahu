"use client";

import { useActionState } from "react";
import Link from "next/link";
import { loginAction, type AuthActionState } from "@/lib/actions/auth";
import type { Dictionary, Locale } from "@/lib/i18n/dictionaries";

const initialState: AuthActionState = { error: null };

export function LoginForm({ lang, dict }: { lang: Locale; dict: Dictionary }) {
  const [state, formAction, pending] = useActionState(
    loginAction,
    initialState
  );

  return (
    <form action={formAction} className="mt-8 space-y-5">
      <input type="hidden" name="lang" value={lang} />

      {state.error && (
        <p className="enter rounded-sm border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger">
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
          className="field mt-1.5"
        />
      </div>

      <div>
        <div className="flex items-center justify-between">
          <label
            htmlFor="password"
            className="block text-sm font-medium text-ink"
          >
            {dict.auth.password}
          </label>
          <Link
            href={`/${lang}/forgot-password`}
            className="link-accent text-xs"
          >
            {dict.auth.forgotPassword}
          </Link>
        </div>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="field mt-1.5"
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="btn btn-primary w-full py-3"
      >
        {pending && (
          <span
            aria-hidden
            className="h-4 w-4 animate-spin rounded-full border-2 border-parchment/40 border-t-parchment"
          />
        )}
        {pending ? dict.common.loading : dict.auth.submitLogin}
      </button>
    </form>
  );
}
