import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { createClient } from "@/lib/supabase/server";
import type { Programme, Lesson, Enrollment } from "@/lib/types/database";
import { EnrollButton } from "./enroll-button";
import { LessonRow } from "./lesson-row";

export default async function ProgrammeDetailPage({
  params,
}: PageProps<"/[lang]/programmes/[slug]">) {
  const { lang, slug } = await params;
  if (!isLocale(lang)) notFound();
  const dict = await getDictionary(lang);

  const supabase = await createClient();

  const { data: programme } = await supabase
    .from("programmes")
    .select("*")
    .eq("slug", slug)
    .single<Programme>();

  if (!programme) notFound();

  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub as string | undefined;

  let enrollment: Enrollment | null = null;
  if (userId) {
    const { data } = await supabase
      .from("enrollments")
      .select("*")
      .eq("programme_id", programme.id)
      .eq("student_id", userId)
      .maybeSingle<Enrollment>();
    enrollment = data;
  }

  // Lesson content is only fetched/shown once enrolled — RLS also enforces
  // this server-side, but we avoid the query entirely for logged-out or
  // not-yet-enrolled visitors to keep the page fast and the intent clear.
  let lessons: Lesson[] = [];
  let completedLessonIds = new Set<string>();
  if (enrollment && enrollment.status === "active") {
    const { data: lessonRows } = await supabase
      .from("lessons")
      .select("*")
      .eq("programme_id", programme.id)
      .order("order_index", { ascending: true })
      .returns<Lesson[]>();
    lessons = lessonRows ?? [];

    const { data: progressRows } = await supabase
      .from("lesson_progress")
      .select("lesson_id")
      .eq("enrollment_id", enrollment.id)
      .not("completed_at", "is", null);
    completedLessonIds = new Set(
      (progressRows ?? []).map((r) => r.lesson_id as string)
    );
  }

  const registrationOpen =
    programme.status === "registration_open" &&
    (!programme.registration_closes_at ||
      new Date(programme.registration_closes_at) > new Date());

  const dateFormatter = new Intl.DateTimeFormat(
    lang === "ar" ? "ar" : lang === "ha" ? "ha" : "en",
    { day: "numeric", month: "long", year: "numeric" }
  );

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="font-[family-name:var(--font-heading)] text-3xl font-semibold text-bottle">
        {programme.title}
      </h1>

      {(programme.author || programme.presenter) && (
        <p className="mt-2 text-sm text-ink/60">
          {programme.author && `${dict.programme.byAuthor}: ${programme.author}`}
          {programme.author && programme.presenter && "  ·  "}
          {programme.presenter &&
            `${dict.programme.presentedBy}: ${programme.presenter}`}
        </p>
      )}

      {programme.description && (
        <p className="mt-6 max-w-xl leading-relaxed text-ink/80">
          {programme.description}
        </p>
      )}

      <dl className="mt-6 flex flex-wrap gap-x-8 gap-y-2 text-sm text-ink/70">
        {programme.starts_at && (
          <div>
            <dt className="inline font-medium text-ink">
              {dict.programme.startDate}:{" "}
            </dt>
            <dd className="inline">
              {dateFormatter.format(new Date(programme.starts_at))}
            </dd>
          </div>
        )}
        {programme.ends_at && (
          <div>
            <dt className="inline font-medium text-ink">
              {dict.programme.endDate}:{" "}
            </dt>
            <dd className="inline">
              {dateFormatter.format(new Date(programme.ends_at))}
            </dd>
          </div>
        )}
      </dl>

      <div className="mt-8">
        {!userId ? (
          <a
            href={`/${lang}/login?next=/${lang}/programmes/${slug}`}
            className="inline-block rounded-sm bg-bottle px-6 py-3 font-medium text-parchment hover:bg-bottle-light transition-colors"
          >
            {dict.nav.login}
          </a>
        ) : enrollment ? (
          <p className="font-medium text-sage">{dict.programme.enrolled}</p>
        ) : registrationOpen ? (
          <EnrollButton
            lang={lang}
            slug={slug}
            programmeId={programme.id}
            dict={dict}
          />
        ) : (
          <p className="font-medium text-ink/50">
            {dict.programme.registrationClosed}
          </p>
        )}
      </div>

      {enrollment && enrollment.status === "active" && lessons.length > 0 && (
        <section className="mt-12">
          <h2 className="font-[family-name:var(--font-heading)] text-lg font-semibold text-ink">
            {dict.programme.lessons}
          </h2>
          <ul className="mt-4 divide-y divide-line border-t border-line">
            {lessons.map((lesson) => (
              <LessonRow
                key={lesson.id}
                lang={lang}
                slug={slug}
                lesson={lesson}
                unlockMode={programme.unlock_mode}
                completed={completedLessonIds.has(lesson.id)}
                dict={dict}
              />
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
