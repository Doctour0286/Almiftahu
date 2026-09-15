"use server";

import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth/require-role";
import { isLocale, defaultLocale } from "@/lib/i18n/config";
import type { ProgrammeStatus, UnlockMode } from "@/lib/types/database";

export type CreateProgrammeState = {
  error: string | null;
};

function slugify(title: string): string {
  return (
    title
      .trim()
      .toLowerCase()
      .replace(/[^\p{L}\p{N}]+/gu, "-")
      .replace(/^-+|-+$/g, "") || "programme"
  );
}

export async function createProgrammeAction(
  _prevState: CreateProgrammeState,
  formData: FormData
): Promise<CreateProgrammeState> {
  const langRaw = String(formData.get("lang") ?? "");
  const lang = isLocale(langRaw) ? langRaw : defaultLocale;

  // Enforces admin-only access; also gives us a server client tied to the
  // caller's session (RLS still applies on top of this check).
  const { supabase, profile } = await requireRole(lang, ["admin"]);

  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const author = String(formData.get("author") ?? "").trim();
  const presenter = String(formData.get("presenter") ?? "").trim();
  const unlockMode = String(formData.get("unlockMode") ?? "drip") as UnlockMode;
  const status = String(
    formData.get("status") ?? "draft"
  ) as ProgrammeStatus;
  const startsAt = String(formData.get("startsAt") ?? "");
  const endsAt = String(formData.get("endsAt") ?? "");
  const registrationClosesAt = String(
    formData.get("registrationClosesAt") ?? ""
  );
  const retentionDays = Number(
    formData.get("submissionRetentionDays") ?? 60
  );
  const strikesAllowed = Number(formData.get("strikesAllowed") ?? 2);
  const issuesCertificate = formData.get("issuesCertificate") === "on";

  if (!title) {
    return { error: "missing_title" };
  }

  const slug = slugify(title);

  const { data, error } = await supabase
    .from("programmes")
    .insert({
      title,
      slug,
      description: description || null,
      author: author || null,
      presenter: presenter || null,
      unlock_mode: unlockMode,
      status,
      starts_at: startsAt || null,
      ends_at: endsAt || null,
      registration_closes_at: registrationClosesAt || null,
      submission_retention_days: Number.isFinite(retentionDays)
        ? retentionDays
        : 60,
      strikes_allowed: Number.isFinite(strikesAllowed) ? strikesAllowed : 2,
      issues_certificate: issuesCertificate,
      created_by: profile.id,
    })
    .select("id")
    .single();

  if (error || !data) {
    return { error: error?.message ?? "unknown_error" };
  }

  redirect(`/${lang}/admin/programmes/${data.id}`);
}
