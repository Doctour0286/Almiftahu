-- ============================================================================
-- Ma'had Miftah al-'Ilm — Initial Schema
-- ============================================================================
-- Roles: admin, teacher, student
-- Core model: Programme -> Lesson (flat, sequential) -> Enrollment -> Submission
-- Everything here is designed to be managed entirely through the admin UI —
-- no programme/lesson content is hardcoded in application code.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Extensions
-- ----------------------------------------------------------------------------
create extension if not exists "pgcrypto";

-- ----------------------------------------------------------------------------
-- 2. Role enum
-- ----------------------------------------------------------------------------
create type public.app_role as enum ('admin', 'teacher', 'student');

-- ----------------------------------------------------------------------------
-- 3. Profiles (extends auth.users)
-- ----------------------------------------------------------------------------
-- Supabase Auth owns auth.users (email/password). We keep a public profile
-- row per user for role + display data, created automatically on signup.
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null,
  role public.app_role not null default 'student',
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.profiles is 'Public profile + role for each authenticated user.';

-- Auto-create a profile row whenever a new auth user signs up.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.email),
    coalesce((new.raw_user_meta_data ->> 'role')::public.app_role, 'student')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ----------------------------------------------------------------------------
-- 4. Programmes
-- ----------------------------------------------------------------------------
create type public.unlock_mode as enum ('drip', 'open');
create type public.programme_status as enum ('draft', 'registration_open', 'active', 'completed', 'archived');

create table public.programmes (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  description text,
  author text,               -- e.g. "Usaymiy" for الآداب العشرة
  presenter text,             -- e.g. "Hassan"
  unlock_mode public.unlock_mode not null default 'drip',
  status public.programme_status not null default 'draft',
  registration_opens_at timestamptz,
  registration_closes_at timestamptz,
  starts_at timestamptz,
  ends_at timestamptz,
  submission_retention_days integer not null default 60,
  strikes_allowed integer not null default 2,
  issues_certificate boolean not null default true,
  created_by uuid references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on column public.programmes.unlock_mode is 'drip = lessons unlock on their scheduled date; open = all lessons visible immediately once enrolled.';
comment on column public.programmes.submission_retention_days is 'Audio submissions for this programme are auto-deleted this many days after submission.';

-- ----------------------------------------------------------------------------
-- 5. Lessons
-- ----------------------------------------------------------------------------
create type public.lesson_content_type as enum ('video', 'audio', 'document', 'mixed');

create table public.lessons (
  id uuid primary key default gen_random_uuid(),
  programme_id uuid not null references public.programmes (id) on delete cascade,
  order_index integer not null,
  title text not null,
  description text,           -- commentary / sharh shown alongside the lesson
  content_type public.lesson_content_type not null default 'mixed',
  video_url text,              -- YouTube link/embed
  audio_url text,               -- YouTube link/embed or Supabase Storage path
  document_url text,
  unlock_at timestamptz,        -- used when programme.unlock_mode = 'drip'
  requires_submission boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (programme_id, order_index)
);

comment on column public.lessons.unlock_at is 'Only enforced when the parent programme unlock_mode = drip.';
comment on column public.lessons.requires_submission is 'Whether students are expected to submit an audio recitation/response for this lesson.';

-- ----------------------------------------------------------------------------
-- 6. Enrollments
-- ----------------------------------------------------------------------------
create type public.enrollment_status as enum ('active', 'removed', 'completed');

create table public.enrollments (
  id uuid primary key default gen_random_uuid(),
  programme_id uuid not null references public.programmes (id) on delete cascade,
  student_id uuid not null references public.profiles (id) on delete cascade,
  status public.enrollment_status not null default 'active',
  strikes integer not null default 0,
  joined_at timestamptz not null default now(),
  removed_at timestamptz,
  completed_at timestamptz,
  unique (programme_id, student_id)
);

-- ----------------------------------------------------------------------------
-- 7. Lesson progress (per-student completion tracking)
-- ----------------------------------------------------------------------------
create table public.lesson_progress (
  id uuid primary key default gen_random_uuid(),
  enrollment_id uuid not null references public.enrollments (id) on delete cascade,
  lesson_id uuid not null references public.lessons (id) on delete cascade,
  completed_at timestamptz,
  unique (enrollment_id, lesson_id)
);

-- ----------------------------------------------------------------------------
-- 8. Submissions (student audio recitation/response + teacher review)
-- ----------------------------------------------------------------------------
create type public.submission_status as enum ('pending', 'reviewed');
create type public.submission_verdict as enum ('correct', 'needs_correction');

create table public.submissions (
  id uuid primary key default gen_random_uuid(),
  enrollment_id uuid not null references public.enrollments (id) on delete cascade,
  lesson_id uuid not null references public.lessons (id) on delete cascade,
  audio_path text not null,     -- Supabase Storage object path
  status public.submission_status not null default 'pending',
  verdict public.submission_verdict,
  feedback text,
  reviewed_by uuid references public.profiles (id),
  reviewed_at timestamptz,
  submitted_at timestamptz not null default now(),
  expires_at timestamptz not null,  -- computed at insert time from programme retention window
  unique (enrollment_id, lesson_id)
);

comment on column public.submissions.expires_at is 'Audio is deleted by a scheduled job once past this timestamp; row may be retained with audio_path cleared.';

-- Automatically compute expires_at from the programme's retention window.
create function public.set_submission_expiry()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  retention_days integer;
begin
  select p.submission_retention_days into retention_days
  from public.enrollments e
  join public.programmes p on p.id = e.programme_id
  where e.id = new.enrollment_id;

  new.expires_at := now() + make_interval(days => coalesce(retention_days, 60));
  return new;
end;
$$;

create trigger set_submission_expiry_trigger
  before insert on public.submissions
  for each row execute procedure public.set_submission_expiry();

-- ----------------------------------------------------------------------------
-- 9. Certificates
-- ----------------------------------------------------------------------------
create table public.certificates (
  id uuid primary key default gen_random_uuid(),
  enrollment_id uuid not null references public.enrollments (id) on delete cascade,
  issued_by uuid references public.profiles (id),
  issued_at timestamptz not null default now(),
  certificate_number text not null unique,
  file_url text,
  unique (enrollment_id)
);

-- ----------------------------------------------------------------------------
-- 10. updated_at maintenance
-- ----------------------------------------------------------------------------
create function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger set_updated_at_profiles before update on public.profiles
  for each row execute procedure public.set_updated_at();
create trigger set_updated_at_programmes before update on public.programmes
  for each row execute procedure public.set_updated_at();
create trigger set_updated_at_lessons before update on public.lessons
  for each row execute procedure public.set_updated_at();

-- ----------------------------------------------------------------------------
-- 11. Helper function: current user's role (avoids recursive RLS lookups)
-- ----------------------------------------------------------------------------
create function public.current_role()
returns public.app_role
language sql
stable
security definer set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

-- ============================================================================
-- Row Level Security
-- ============================================================================

alter table public.profiles enable row level security;
alter table public.programmes enable row level security;
alter table public.lessons enable row level security;
alter table public.enrollments enable row level security;
alter table public.lesson_progress enable row level security;
alter table public.submissions enable row level security;
alter table public.certificates enable row level security;

-- ---- profiles -----------------------------------------------------------
create policy "profiles: users can read own" on public.profiles
  for select using (auth.uid() = id);

create policy "profiles: admins/teachers can read all" on public.profiles
  for select using (public.current_role() in ('admin', 'teacher'));

create policy "profiles: users can update own (not role)" on public.profiles
  for update using (auth.uid() = id)
  with check (auth.uid() = id and role = (select role from public.profiles where id = auth.uid()));

create policy "profiles: admins can update any" on public.profiles
  for update using (public.current_role() = 'admin');

-- ---- programmes -----------------------------------------------------------
create policy "programmes: anyone can read non-draft" on public.programmes
  for select using (status <> 'draft' or public.current_role() = 'admin');

create policy "programmes: admins manage" on public.programmes
  for all using (public.current_role() = 'admin')
  with check (public.current_role() = 'admin');

-- ---- lessons -----------------------------------------------------------
-- Students can read lessons of programmes they're actively enrolled in,
-- subject to unlock rules being enforced at the application layer (drip
-- lessons are still readable here for schedule display, but the unlock
-- gate on submission/content-open is checked in the app + submission RLS).
create policy "lessons: enrolled students can read" on public.lessons
  for select using (
    exists (
      select 1 from public.enrollments e
      where e.programme_id = lessons.programme_id
        and e.student_id = auth.uid()
        and e.status = 'active'
    )
    or public.current_role() in ('admin', 'teacher')
  );

create policy "lessons: admins manage" on public.lessons
  for all using (public.current_role() = 'admin')
  with check (public.current_role() = 'admin');

-- ---- enrollments -----------------------------------------------------------
create policy "enrollments: students read own" on public.enrollments
  for select using (student_id = auth.uid());

create policy "enrollments: students create own" on public.enrollments
  for insert with check (student_id = auth.uid());

create policy "enrollments: staff read all" on public.enrollments
  for select using (public.current_role() in ('admin', 'teacher'));

create policy "enrollments: admins manage all" on public.enrollments
  for all using (public.current_role() = 'admin')
  with check (public.current_role() = 'admin');

create policy "enrollments: teachers update strikes/status" on public.enrollments
  for update using (public.current_role() = 'teacher')
  with check (public.current_role() = 'teacher');

-- ---- lesson_progress -----------------------------------------------------------
create policy "lesson_progress: students manage own" on public.lesson_progress
  for all using (
    exists (
      select 1 from public.enrollments e
      where e.id = lesson_progress.enrollment_id and e.student_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.enrollments e
      where e.id = lesson_progress.enrollment_id and e.student_id = auth.uid()
    )
  );

create policy "lesson_progress: staff read all" on public.lesson_progress
  for select using (public.current_role() in ('admin', 'teacher'));

-- ---- submissions -----------------------------------------------------------
create policy "submissions: students manage own" on public.submissions
  for all using (
    exists (
      select 1 from public.enrollments e
      where e.id = submissions.enrollment_id and e.student_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.enrollments e
      where e.id = submissions.enrollment_id and e.student_id = auth.uid()
    )
  );

create policy "submissions: staff read all" on public.submissions
  for select using (public.current_role() in ('admin', 'teacher'));

create policy "submissions: teachers review" on public.submissions
  for update using (public.current_role() = 'teacher')
  with check (public.current_role() = 'teacher');

-- ---- certificates -----------------------------------------------------------
create policy "certificates: students read own" on public.certificates
  for select using (
    exists (
      select 1 from public.enrollments e
      where e.id = certificates.enrollment_id and e.student_id = auth.uid()
    )
  );

create policy "certificates: staff manage" on public.certificates
  for all using (public.current_role() in ('admin', 'teacher'))
  with check (public.current_role() in ('admin', 'teacher'));

-- ============================================================================
-- Storage bucket for student audio submissions
-- ============================================================================
insert into storage.buckets (id, name, public)
values ('submissions', 'submissions', false)
on conflict (id) do nothing;

-- Students can upload/read their own submission files, staff can read all.
-- Path convention: submissions/{enrollment_id}/{lesson_id}.webm (or similar)
create policy "submission audio: students manage own folder"
  on storage.objects for all
  using (
    bucket_id = 'submissions'
    and exists (
      select 1 from public.enrollments e
      where e.student_id = auth.uid()
        and (storage.foldername(name))[1] = e.id::text
    )
  )
  with check (
    bucket_id = 'submissions'
    and exists (
      select 1 from public.enrollments e
      where e.student_id = auth.uid()
        and (storage.foldername(name))[1] = e.id::text
    )
  );

create policy "submission audio: staff read all"
  on storage.objects for select
  using (
    bucket_id = 'submissions'
    and public.current_role() in ('admin', 'teacher')
  );
