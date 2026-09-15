import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { requireRole } from "@/lib/auth/require-role";
import type { Submission, Lesson, Enrollment, Profile } from "@/lib/types/database";
import { ReviewForm } from "./review-form";

type SubmissionRow = Submission & {
  lessons: Lesson;
  enrollments: Enrollment & { profiles: Profile };
};

export default async function TeacherPage({
  params,
}: PageProps<"/[lang]/teacher">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = await getDictionary(lang);

  const { supabase } = await requireRole(lang, ["teacher", "admin"]);

  const { data: submissions } = await supabase
    .from("submissions")
    .select("*, lessons(*), enrollments(*, profiles(*))")
    .order("submitted_at", { ascending: true })
    .returns<SubmissionRow[]>();

  const pending = (submissions ?? []).filter((s) => s.status === "pending");

  // Signed URLs are generated per-submission at render time (server-only,
  // service handled entirely by the caller's own RLS-checked session).
  const signedUrls = await Promise.all(
    pending.map((s) =>
      supabase.storage.from("submissions").createSignedUrl(s.audio_path, 3600)
    )
  );

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="font-[family-name:var(--font-heading)] text-2xl font-semibold text-bottle">
        {dict.teacher.title}
      </h1>

      <section className="mt-10">
        <h2 className="font-[family-name:var(--font-heading)] text-lg font-semibold text-ink">
          {dict.teacher.reviewQueue}
        </h2>

        {pending.length === 0 ? (
          <p className="mt-4 text-ink/70">{dict.teacher.noSubmissions}</p>
        ) : (
          <ul className="mt-4 divide-y divide-line border-t border-line">
            {pending.map((submission, i) => (
              <li key={submission.id} className="py-6">
                <p className="text-sm text-ink/60">
                  {dict.teacher.student}:{" "}
                  <span className="font-medium text-ink">
                    {submission.enrollments.profiles.full_name}
                  </span>
                </p>
                <p className="mt-0.5 text-sm text-ink/60">
                  {dict.teacher.lesson}:{" "}
                  <span className="font-medium text-ink">
                    {submission.lessons.title}
                  </span>
                </p>

                {signedUrls[i]?.data?.signedUrl && (
                  <div className="mt-3">
                    <p className="mb-1 text-xs font-medium uppercase tracking-wide text-ink/50">
                      {dict.teacher.listen}
                    </p>
                    <audio
                      controls
                      src={signedUrls[i]!.data!.signedUrl}
                      className="w-full"
                    />
                  </div>
                )}

                <ReviewForm
                  lang={lang}
                  submissionId={submission.id}
                  dict={dict}
                />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
