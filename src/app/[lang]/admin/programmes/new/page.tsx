import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { requireRole } from "@/lib/auth/require-role";
import { CreateProgrammeForm } from "./create-programme-form";

export default async function NewProgrammePage({
  params,
}: PageProps<"/[lang]/admin/programmes/new">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = await getDictionary(lang);

  await requireRole(lang, ["admin"]);

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <h1 className="font-[family-name:var(--font-heading)] text-2xl font-semibold text-bottle">
        {dict.admin.createProgramme}
      </h1>
      <CreateProgrammeForm lang={lang} dict={dict} />
    </div>
  );
}
