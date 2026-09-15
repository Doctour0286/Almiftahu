import { notFound, redirect } from "next/navigation";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { createClient } from "@/lib/supabase/server";
import type { Lesson, Enrollment, Programme, Submission } from "@/lib/types/database";
import { MarkCompleteButton } from "./mark-complete-button";
import { SubmissionPanel } from "./submission-panel";
import { YouTubeEmbed } from "./youtube-embed";

export default async function LessonPage({
  params,
}: PageProps<"/[lang]/programmes/[slug]/lessons/[lessonId]">) {
  const { lang, slug, lessonId } = await params;
  if (!isLocale(lang)) notFound();
  const dict = await getDictionary(lang);

  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  if (!claimsData?.claims) {
    redirect(`/${lang}/login?next=/${lang}/programmes/${slug}/lessons/${lessonId}`);
  }
  const userId = claimsData.claims.sub as string;

  const { data: programme } = await supabase
    .from("programmes")
    .select("*")
    .eq("slug", slug)
    .single<Programme>();
  if (!programme) notFound();

  const { data: enrollment } = await supabase
    .from("enrollments")
    .select("*")
    .eq("programme_id", programme.id)
    .eq("student_id", userId)
    .eq("status", "active")
    .maybeSingle<Enrollment>();
  if (!enrollment) {
    redirect(`/${lang}/programmes/${slug}`);
  }

  const { data: lesson } = await supabase
    .from("lessons")
    .select("*")
    .eq("id", lessonId)
    .eq("programme_id", programme.id)
    .single<Lesson>();
  if (!lesson) notFound();

  const isLocked =
    programme.unlock_mode === "drip" &&
    lesson.unlock_at !== null &&
    new Date(lesson.unlock_at) > new Date();
  if (isLocked) {
    redirect(`/${lang}/programmes/${slug}`);
  }

  const { data: progress } = await supabase
    .from("lesson_progress")
    .select("completed_at")
    .eq("enrollment_id", enrollment.id)
    .eq("lesson_id", lesson.id)
    .maybeSingle();

  const { data: submission } = await supabase
    .from("submissions")
    .select("*")
    .eq("enrollment_id", enrollment.id)
    .eq("lesson_id", lesson.id)
    .maybeSingle<Submission>();

  const currentPath = `/${lang}/programmes/${slug}/lessons/${lessonId}`;

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <p className="text-sm font-medium text-brass">
        {dict.programme.lessons} · #{lesson.order_index}
      </p>
      <h1 className="mt-1 font-[family-name:var(--font-heading)] text-2xl font-semibold text-bottle">
        {lesson.title}
      </h1>

      {lesson.video_url && (
        <div className="mt-6">
          <p className="mb-2 text-sm font-medium text-ink/60">
            {dict.lesson.video}
          </p>
          <YouTubeEmbed url={lesson.video_url} title={lesson.title} />
        </div>
      )}

      {lesson.audio_url && !lesson.video_url && (
        <div className="mt-6">
          <p className="mb-2 text-sm font-medium text-ink/60">
            {dict.lesson.audio}
          </p>
          <audio controls className="w-full" src={lesson.audio_url} />
        </div>
      )}

      {lesson.document_url && (
        <div className="mt-4">
          <a
            href={lesson.document_url}
            target="_blank"
            rel="noreferrer"
            className="text-sm font-medium text-bottle underline decoration-brass underline-offset-4"
          >
            {dict.lesson.document}
          </a>
        </div>
      )}

      {lesson.description && (
        <div className="mt-8">
          <h2 className="text-sm font-medium uppercase tracking-wide text-ink/50">
            {dict.lesson.about}
          </h2>
          <p className="mt-2 whitespace-pre-wrap leading-relaxed text-ink/80">
            {lesson.description}
          </p>
        </div>
      )}

      <div className="mt-8">
        <MarkCompleteButton
          enrollmentId={enrollment.id}
          lessonId={lesson.id}
          revalidateTarget={currentPath}
          completed={Boolean(progress?.completed_at)}
          dict={dict}
        />
      </div>

      {lesson.requires_submission && (
        <div className="mt-10 border-t border-line pt-8">
          <h2 className="font-[family-name:var(--font-heading)] text-lg font-semibold text-ink">
            {dict.lesson.submission}
          </h2>
          <SubmissionPanel
            enrollmentId={enrollment.id}
            lessonId={lesson.id}
            revalidateTarget={currentPath}
            existingSubmission={submission}
            dict={dict}
          />
        </div>
      )}
    </div>
  );
}
