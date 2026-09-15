# Ma'had Miftah al-'Ilm — Online Learning Platform

Online learning platform for Ma'had Miftah al-'Ilm (معهد مفتاح العلم), built to
run cohort-based Islamic studies programmes: sequential daily lessons (video/
audio/document), student audio submissions with teacher review, progress
tracking, and certificates.

## Stack

- **Framework**: Next.js 16 (App Router), TypeScript, Tailwind CSS
- **Database / Auth / Storage**: Supabase (Postgres + Row Level Security)
- **Hosting**: Vercel
- **Lesson media**: linked/embedded from YouTube (not re-hosted)
- **Student submissions**: audio uploaded to Supabase Storage, auto-expired
  per a programme-configurable retention window

## Roles

- **Admin** — creates/edits programmes and lessons, manages users, views all
  activity, issues certificates. Everything content-related is managed
  through the admin UI; nothing is hardcoded.
- **Teacher** — reviews student submissions, leaves feedback, tracks
  attendance/strikes.
- **Student** — enrolls in programmes, views lessons on schedule, submits
  audio recitations/responses, tracks own progress and certificates.

## Local setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy `.env.example` to `.env.local` and fill in your Supabase project's
   URL and keys (Project Settings → API in the Supabase dashboard):
   ```bash
   cp .env.example .env.local
   ```
3. Apply the database schema: open the Supabase SQL Editor for your project
   and run the contents of `supabase/migrations/` in order (currently just
   `20260915090000_initial_schema.sql`). If you have the Supabase CLI linked
   to this project instead, `supabase db push` works too.
4. Run the dev server:
   ```bash
   npm run dev
   ```
   Open http://localhost:3000.

## Project structure

```
src/
  app/                # Next.js App Router pages
  lib/
    supabase/
      client.ts        # Browser Supabase client
      server.ts        # Server Component / Server Action Supabase client
      admin.ts          # service_role client — server-only, bypasses RLS
      proxy.ts           # session refresh + route protection logic
  proxy.ts              # Next.js 16 proxy (formerly "middleware")
supabase/
  migrations/           # Versioned SQL schema — source of truth for the DB
```

## Database schema overview

See `supabase/migrations/20260915090000_initial_schema.sql` for full detail.

- `profiles` — one row per authenticated user; holds `role` (admin/teacher/student)
- `programmes` — a course/cohort; `unlock_mode` (drip vs open) and retention
  window are configured per-programme via the admin UI
- `lessons` — sequential, belong to a programme; video/audio/document links
- `enrollments` — student ↔ programme, tracks strikes and status
- `lesson_progress` — per-student lesson completion
- `submissions` — student audio + teacher feedback, auto-expiring
- `certificates` — issued on programme completion

All tables have Row Level Security enabled — students can only see their own
data, teachers can review submissions and manage attendance, admins have
full access.
