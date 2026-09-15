// These types mirror `supabase/migrations/20260915090000_initial_schema.sql`.
// Once the Supabase CLI can be linked to the live project, prefer generating
// this file with `supabase gen types typescript` to keep it authoritative.

export type AppRole = "admin" | "teacher" | "student";
export type UnlockMode = "drip" | "open";
export type ProgrammeStatus =
  | "draft"
  | "registration_open"
  | "active"
  | "completed"
  | "archived";
export type LessonContentType = "video" | "audio" | "document" | "mixed";
export type EnrollmentStatus = "active" | "removed" | "completed";
export type SubmissionStatus = "pending" | "reviewed";
export type SubmissionVerdict = "correct" | "needs_correction";

export type Profile = {
  id: string;
  full_name: string;
  role: AppRole;
  phone: string | null;
  created_at: string;
  updated_at: string;
};

export type Programme = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  author: string | null;
  presenter: string | null;
  unlock_mode: UnlockMode;
  status: ProgrammeStatus;
  registration_opens_at: string | null;
  registration_closes_at: string | null;
  starts_at: string | null;
  ends_at: string | null;
  submission_retention_days: number;
  strikes_allowed: number;
  issues_certificate: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type Lesson = {
  id: string;
  programme_id: string;
  order_index: number;
  title: string;
  description: string | null;
  content_type: LessonContentType;
  video_url: string | null;
  audio_url: string | null;
  document_url: string | null;
  unlock_at: string | null;
  requires_submission: boolean;
  created_at: string;
  updated_at: string;
};

export type Enrollment = {
  id: string;
  programme_id: string;
  student_id: string;
  status: EnrollmentStatus;
  strikes: number;
  joined_at: string;
  removed_at: string | null;
  completed_at: string | null;
};

export type LessonProgress = {
  id: string;
  enrollment_id: string;
  lesson_id: string;
  completed_at: string | null;
};

export type Submission = {
  id: string;
  enrollment_id: string;
  lesson_id: string;
  audio_path: string;
  status: SubmissionStatus;
  verdict: SubmissionVerdict | null;
  feedback: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  submitted_at: string;
  expires_at: string;
};

export type Certificate = {
  id: string;
  enrollment_id: string;
  issued_by: string | null;
  issued_at: string;
  certificate_number: string;
  file_url: string | null;
};
