import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { requireRole } from "@/lib/auth/require-role";
import type { Programme } from "@/lib/types/database";

export default async function AdminPage({
  params,
}: PageProps<"/[lang]/admin">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = await getDictionary(lang);

  const { supabase } = await requireRole(lang, ["admin"]);

  const { data: programmes } = await supabase
    .from("programmes")
    .select("*")
    .order("created_at", { ascending: false })
    .returns<Programme[]>();

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <div className="flex items-center justify-between">
        <h1 className="font-[family-name:var(--font-heading)] text-2xl font-semibold text-bottle">
          {dict.admin.title}
        </h1>
        <Link
          href={`/${lang}/admin/programmes/new`}
          className="rounded-sm bg-bottle px-4 py-2 text-sm font-medium text-parchment hover:bg-bottle-light transition-colors"
        >
          {dict.admin.createProgramme}
        </Link>
      </div>

      <section className="mt-10">
        <h2 className="font-[family-name:var(--font-heading)] text-lg font-semibold text-ink">
          {dict.admin.programmes}
        </h2>

        {!programmes || programmes.length === 0 ? (
          <p className="mt-4 text-ink/70">{dict.admin.noProgrammes}</p>
        ) : (
          <ul className="mt-4 divide-y divide-line border-t border-line">
            {programmes.map((programme) => (
              <li key={programme.id} className="py-4">
                <Link
                  href={`/${lang}/admin/programmes/${programme.id}`}
                  className="flex items-center justify-between"
                >
                  <div>
                    <p className="font-medium text-ink">{programme.title}</p>
                    <p className="text-xs uppercase tracking-wide text-ink/50">
                      {programme.status}
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
