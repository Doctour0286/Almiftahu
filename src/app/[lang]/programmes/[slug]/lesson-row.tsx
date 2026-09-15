import Link from "next/link";
import type { Lesson, UnlockMode } from "@/lib/types/database";
import type { Dictionary, Locale } from "@/lib/i18n/dictionaries";

export function LessonRow({
  lang,
  slug,
  lesson,
  unlockMode,
  completed,
  dict,
}: {
  lang: Locale;
  slug: string;
  lesson: Lesson;
  unlockMode: UnlockMode;
  completed: boolean;
  dict: Dictionary;
}) {
  const isLocked =
    unlockMode === "drip" &&
    lesson.unlock_at !== null &&
    new Date(lesson.unlock_at) > new Date();

  const dateFormatter = new Intl.DateTimeFormat(
    lang === "ar" ? "ar" : lang === "ha" ? "ha" : "en",
    { day: "numeric", month: "short" }
  );

  const content = (
    <div className="flex items-center justify-between gap-4 py-4">
      <div className="flex items-center gap-3">
        <span
          className={
            completed
              ? "flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sage text-xs font-bold text-white"
              : "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-line text-xs text-ink/40"
          }
        >
          {completed ? "✓" : lesson.order_index}
        </span>
        <div>
          <p
            className={
              isLocked
                ? "font-medium text-ink/40"
                : "font-medium text-ink"
            }
          >
            {lesson.title}
          </p>
          {isLocked && lesson.unlock_at && (
            <p className="mt-0.5 text-xs text-ink/50">
              {dict.lesson.unlocksOn} {dateFormatter.format(new Date(lesson.unlock_at))}
            </p>
          )}
        </div>
      </div>
    </div>
  );

  if (isLocked) {
    return <li className="opacity-60">{content}</li>;
  }

  return (
    <li>
      <Link href={`/${lang}/programmes/${slug}/lessons/${lesson.id}`}>
        {content}
      </Link>
    </li>
  );
}
