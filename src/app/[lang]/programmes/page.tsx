import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { createClient } from "@/lib/supabase/server";
import type { Programme } from "@/lib/types/database";

export default async function ProgrammesPage({
  params,
}: PageProps<"/[lang]/programmes">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = await getDictionary(lang);

  const supabase = await createClient();
  const { data: programmes } = await supabase
    .from("programmes")
    .select("*")
    .in("status", ["registration_open", "active"])
    .order("created_at", { ascending: false })
    .returns<Programme[]>();

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="font-[family-name:var(--font-heading)] text-2xl font-semibold text-bottle">
        {dict.programme.allProgrammes}
      </h1>

      {!programmes || programmes.length === 0 ? (
        <p className="mt-8 text-ink/70">{dict.programme.noProgrammesAvailable}</p>
      ) : (
        <ul className="mt-8 divide-y divide-line border-t border-line">
          {programmes.map((programme) => (
            <li key={programme.id} className="py-6">
              <Link href={`/${lang}/programmes/${programme.slug}`}>
                <h2 className="font-[family-name:var(--font-heading)] text-xl font-semibold text-ink hover:text-bottle transition-colors">
                  {programme.title}
                </h2>
                {programme.description && (
                  <p className="mt-2 max-w-xl text-ink/70">
                    {programme.description}
                  </p>
                )}
                <span className="mt-3 inline-block text-sm font-medium text-bottle underline decoration-brass underline-offset-4">
                  {dict.programme.viewProgramme}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
