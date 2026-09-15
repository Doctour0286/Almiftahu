import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { requireRole } from "@/lib/auth/require-role";
import { CreateLessonForm } from "./create-lesson-form";

export default async function NewLessonPage({
  params,
}: PageProps<"/[lang]/admin/programmes/[programmeId]/lessons/new">) {
  const { lang, programmeId } = await params;
  if (!isLocale(lang)) notFound();
  const dict = await getDictionary(lang);

  const { supabase } = await requireRole(lang, ["admin"]);

  const { count } = await supabase
    .from("lessons")
    .select("id", { count: "exact", head: true })
    .eq("programme_id", programmeId);

  const nextOrderIndex = (count ?? 0) + 1;

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <h1 className="font-[family-name:var(--font-heading)] text-2xl font-semibold text-bottle">
        {dict.admin.programmeDetail.addLesson}
      </h1>
      <CreateLessonForm
        lang={lang}
        programmeId={programmeId}
        nextOrderIndex={nextOrderIndex}
        dict={dict}
      />
    </div>
  );
}
