import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { createClient } from "@/lib/supabase/server";
import type { Profile, Enrollment, Programme } from "@/lib/types/database";

type EnrollmentWithProgramme = Enrollment & { programmes: Programme };

export default async function DashboardPage({
  params,
}: PageProps<"/[lang]/dashboard">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = await getDictionary(lang);

  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  if (!claimsData?.claims) {
    redirect(`/${lang}/login`);
  }
  const userId = claimsData.claims.sub as string;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single<Profile>();

  if (profile?.role === "teacher") {
    redirect(`/${lang}/teacher`);
  }
  if (profile?.role === "admin") {
    redirect(`/${lang}/admin`);
  }

  const { data: enrollments } = await supabase
    .from("enrollments")
    .select("*, programmes(*)")
    .eq("student_id", userId)
    .eq("status", "active")
    .returns<EnrollmentWithProgramme[]>();

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="font-[family-name:var(--font-heading)] text-2xl font-semibold text-bottle">
        {dict.dashboard.welcome}
        {profile?.full_name ? `, ${profile.full_name}` : ""}
      </h1>

      <section className="mt-10">
        <h2 className="font-[family-name:var(--font-heading)] text-lg font-semibold text-ink">
          {dict.dashboard.myProgrammes}
        </h2>

        {!enrollments || enrollments.length === 0 ? (
          <div className="mt-4 rounded-sm border border-dashed border-line px-6 py-10 text-center">
            <p className="text-ink/70">{dict.dashboard.noProgrammes}</p>
            <Link
              href={`/${lang}/programmes`}
              className="mt-4 inline-block font-medium text-bottle underline decoration-brass underline-offset-4"
            >
              {dict.dashboard.browseProgrammes}
            </Link>
          </div>
        ) : (
          <ul className="mt-4 divide-y divide-line border-t border-line">
            {enrollments.map((enrollment) => (
              <li key={enrollment.id} className="py-5">
                <Link
                  href={`/${lang}/programmes/${enrollment.programmes.slug}`}
                  className="flex items-center justify-between gap-4"
                >
                  <div>
                    <p className="font-medium text-ink">
                      {enrollment.programmes.title}
                    </p>
                    {enrollment.strikes > 0 && (
                      <p className="mt-1 text-sm text-danger">
                        {dict.dashboard.strikes}: {enrollment.strikes}/
                        {enrollment.programmes.strikes_allowed}
                      </p>
                    )}
                  </div>
                  <span className="whitespace-nowrap text-sm font-medium text-bottle underline decoration-brass underline-offset-4">
                    {dict.dashboard.continueLearning}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
