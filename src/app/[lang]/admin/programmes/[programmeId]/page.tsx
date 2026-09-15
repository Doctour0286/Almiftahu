import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { requireRole } from "@/lib/auth/require-role";
import type { Programme, Lesson } from "@/lib/types/database";

export default async function AdminProgrammeDetailPage({
  params,
}: PageProps<"/[lang]/admin/programmes/[programmeId]">) {
  const { lang, programmeId } = await params;
  if (!isLocale(lang)) notFound();
  const dict = await getDictionary(lang);

  const { supabase } = await requireRole(lang, ["admin"]);

  const { data: programme } = await supabase
    .from("programmes")
    .select("*")
    .eq("id", programmeId)
    .single<Programme>();
  if (!programme) notFound();

  const { data: lessons } = await supabase
    .from("lessons")
    .select("*")
    .eq("programme_id", programmeId)
    .order("order_index", { ascending: true })
    .returns<Lesson[]>();

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <p className="text-xs font-medium uppercase tracking-wide text-brass">
        {programme.status}
      </p>
      <h1 className="mt-1 font-[family-name:var(--font-heading)] text-2xl font-semibold text-bottle">
        {programme.title}
      </h1>
      <p className="mt-1 text-sm text-ink/60">/{programme.slug}</p>

      <section className="mt-10">
        <div className="flex items-center justify-between">
          <h2 className="font-[family-name:var(--font-heading)] text-lg font-semibold text-ink">
            {dict.admin.programmeDetail.lessons}
          </h2>
          <Link
            href={`/${lang}/admin/programmes/${programmeId}/lessons/new`}
            className="rounded-sm bg-bottle px-4 py-2 text-sm font-medium text-parchment hover:bg-bottle-light transition-colors"
          >
            {dict.admin.programmeDetail.addLesson}
          </Link>
        </div>

        {!lessons || lessons.length === 0 ? (
          <p className="mt-4 text-ink/70">
            {dict.admin.programmeDetail.noLessons}
          </p>
        ) : (
          <ul className="mt-4 divide-y divide-line border-t border-line">
            {lessons.map((lesson) => (
              <li key={lesson.id} className="flex items-center gap-3 py-4">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-line text-xs text-ink/50">
                  {lesson.order_index}
                </span>
                <div>
                  <p className="font-medium text-ink">{lesson.title}</p>
                  <p className="text-xs text-ink/50">
                    {lesson.content_type}
                    {lesson.requires_submission ? " · +submission" : ""}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
