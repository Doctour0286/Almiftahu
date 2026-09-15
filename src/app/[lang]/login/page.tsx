import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { LoginForm } from "./login-form";

export default async function LoginPage({
  params,
}: PageProps<"/[lang]/login">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = await getDictionary(lang);

  return (
    <div className="mx-auto max-w-md px-6 py-16">
      <h1 className="font-[family-name:var(--font-heading)] text-3xl font-semibold text-bottle">
        {dict.auth.loginTitle}
      </h1>
      <p className="mt-2 text-ink/70">{dict.auth.loginSubtitle}</p>

      <LoginForm lang={lang} dict={dict} />

      <p className="mt-6 text-sm text-ink/70">
        {dict.auth.noAccount}{" "}
        <Link
          href={`/${lang}/register`}
          className="font-medium text-bottle underline decoration-brass underline-offset-4"
        >
          {dict.auth.registerLink}
        </Link>
      </p>
    </div>
  );
}
