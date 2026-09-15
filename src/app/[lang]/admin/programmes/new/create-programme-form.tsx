"use client";

import { useActionState } from "react";
import {
  createProgrammeAction,
  type CreateProgrammeState,
} from "@/lib/actions/admin-programme";
import type { Dictionary, Locale } from "@/lib/i18n/dictionaries";

const initialState: CreateProgrammeState = { error: null };

const inputClass =
  "mt-1.5 w-full rounded-sm border border-line bg-white px-3.5 py-2.5 text-ink outline-none focus:border-bottle focus:ring-1 focus:ring-bottle";
const labelClass = "block text-sm font-medium text-ink";

export function CreateProgrammeForm({
  lang,
  dict,
}: {
  lang: Locale;
  dict: Dictionary;
}) {
  const [state, formAction, pending] = useActionState(
    createProgrammeAction,
    initialState
  );
  const f = dict.admin.form;

  return (
    <form action={formAction} className="mt-8 space-y-6">
      <input type="hidden" name="lang" value={lang} />

      {state.error && (
        <p className="rounded-sm border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger">
          {state.error}
        </p>
      )}

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
          rows={4}
          className={inputClass}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="author" className={labelClass}>
            {f.author}
          </label>
          <input id="author" name="author" type="text" className={inputClass} />
        </div>
        <div>
          <label htmlFor="presenter" className={labelClass}>
            {f.presenter}
          </label>
          <input
            id="presenter"
            name="presenter"
            type="text"
            className={inputClass}
          />
        </div>
      </div>

      <fieldset>
        <legend className={labelClass}>{f.unlockMode}</legend>
        <div className="mt-2 space-y-2">
          <label className="flex items-center gap-2 text-sm text-ink">
            <input
              type="radio"
              name="unlockMode"
              value="drip"
              defaultChecked
            />
            {f.unlockModeDrip}
          </label>
          <label className="flex items-center gap-2 text-sm text-ink">
            <input type="radio" name="unlockMode" value="open" />
            {f.unlockModeOpen}
          </label>
        </div>
      </fieldset>

      <div>
        <label htmlFor="status" className={labelClass}>
          {f.status}
        </label>
        <select
          id="status"
          name="status"
          defaultValue="draft"
          className={inputClass}
        >
          <option value="draft">{f.statusDraft}</option>
          <option value="registration_open">
            {f.statusRegistrationOpen}
          </option>
          <option value="active">{f.statusActive}</option>
          <option value="completed">{f.statusCompleted}</option>
          <option value="archived">{f.statusArchived}</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="startsAt" className={labelClass}>
            {f.startsAt}
          </label>
          <input
            id="startsAt"
            name="startsAt"
            type="date"
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="endsAt" className={labelClass}>
            {f.endsAt}
          </label>
          <input
            id="endsAt"
            name="endsAt"
            type="date"
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label htmlFor="registrationClosesAt" className={labelClass}>
          {f.registrationClosesAt}
        </label>
        <input
          id="registrationClosesAt"
          name="registrationClosesAt"
          type="date"
          className={inputClass}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="submissionRetentionDays" className={labelClass}>
            {f.retentionDays}
          </label>
          <input
            id="submissionRetentionDays"
            name="submissionRetentionDays"
            type="number"
            min={1}
            defaultValue={60}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="strikesAllowed" className={labelClass}>
            {f.strikesAllowed}
          </label>
          <input
            id="strikesAllowed"
            name="strikesAllowed"
            type="number"
            min={0}
            defaultValue={2}
            className={inputClass}
          />
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm text-ink">
        <input
          type="checkbox"
          name="issuesCertificate"
          defaultChecked
        />
        {f.issuesCertificate}
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
