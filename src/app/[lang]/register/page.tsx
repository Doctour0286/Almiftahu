import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { RegisterForm } from "./register-form";

export default async function RegisterPage({
  params,
}: PageProps<"/[lang]/register">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = await getDictionary(lang);

  return (
    <div className="mx-auto max-w-md px-6 py-16">
      <h1 className="font-[family-name:var(--font-heading)] text-3xl font-semibold text-bottle">
        {dict.auth.registerTitle}
      </h1>
      <p className="mt-2 text-ink/70">{dict.auth.registerSubtitle}</p>

      <RegisterForm lang={lang} dict={dict} />

      <p className="mt-6 text-sm text-ink/70">
        {dict.auth.haveAccount}{" "}
        <Link
          href={`/${lang}/login`}
          className="font-medium text-bottle underline decoration-brass underline-offset-4"
        >
          {dict.auth.loginLink}
        </Link>
      </p>
    </div>
  );
}
