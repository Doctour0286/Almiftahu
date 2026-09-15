import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { ForgotPasswordForm } from "./forgot-password-form";

export default async function ForgotPasswordPage({
  params,
}: PageProps<"/[lang]/forgot-password">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = await getDictionary(lang);

  return (
    <div className="mx-auto max-w-md px-6 py-16">
      <h1 className="font-[family-name:var(--font-heading)] text-3xl font-semibold text-bottle">
        {dict.auth.forgotPasswordTitle}
      </h1>
      <p className="mt-2 text-ink/70">{dict.auth.forgotPasswordSubtitle}</p>

      <ForgotPasswordForm lang={lang} dict={dict} />
    </div>
  );
}
