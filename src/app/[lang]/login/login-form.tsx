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

      <div>
        <div className="flex items-center justify-between">
          <label htmlFor="password" className="block text-sm font-medium text-ink">
            {dict.auth.password}
          </label>
          <Link
            href={`/${lang}/forgot-password`}
            className="text-xs text-bottle underline decoration-brass underline-offset-4"
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
          className="mt-1.5 w-full rounded-sm border border-line bg-white px-3.5 py-2.5 text-ink outline-none focus:border-bottle focus:ring-1 focus:ring-bottle"
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-sm bg-bottle px-4 py-3 font-medium text-parchment transition-colors hover:bg-bottle-light disabled:opacity-60"
      >
        {pending ? dict.common.loading : dict.auth.submitLogin}
      </button>
    </form>
  );
}
