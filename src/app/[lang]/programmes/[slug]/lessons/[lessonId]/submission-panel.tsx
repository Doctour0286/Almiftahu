"use client";

import { useActionState, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  recordSubmissionAction,
  type SubmissionActionState,
} from "@/lib/actions/submission";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import type { Submission } from "@/lib/types/database";

const initialState: SubmissionActionState = { error: null };

function pickRecordingMimeType(): string {
  const candidates = [
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/mp4",
    "audio/ogg;codecs=opus",
  ];
  return (
    candidates.find((type) => MediaRecorder.isTypeSupported(type)) ?? ""
  );
}

export function SubmissionPanel({
  enrollmentId,
  lessonId,
  revalidateTarget,
  existingSubmission,
  dict,
}: {
  enrollmentId: string;
  lessonId: string;
  revalidateTarget: string;
  existingSubmission: Submission | null;
  dict: Dictionary;
}) {
  const [state, formAction, pending] = useActionState(
    recordSubmissionAction,
    initialState
  );

  const [isRecording, setIsRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadedPath, setUploadedPath] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  async function startRecording() {
    setUploadError(null);
    setSelectedFile(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
      const mimeType = pickRecordingMimeType();
      const recorder = new MediaRecorder(
        stream,
        mimeType ? { mimeType } : undefined
      );
      chunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, {
          type: mimeType || "audio/webm",
        });
        setRecordedBlob(blob);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      setIsRecording(true);
    } catch {
      setUploadError("mic_permission_denied");
    }
  }

  function stopRecording() {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  }

  async function handleUpload() {
    const fileOrBlob = selectedFile ?? recordedBlob;
    if (!fileOrBlob) return;

    setUploading(true);
    setUploadError(null);

    try {
      const supabase = createClient();
      const extension =
        selectedFile?.name.split(".").pop() ||
        (fileOrBlob.type.includes("mp4") ? "m4a" : "webm");
      const path = `${enrollmentId}/${lessonId}.${extension}`;

      const { error } = await supabase.storage
        .from("submissions")
        .upload(path, fileOrBlob, {
          upsert: true,
          contentType: fileOrBlob.type || undefined,
        });

      if (error) {
        setUploadError(error.message);
        return;
      }

      setUploadedPath(path);
    } finally {
      setUploading(false);
    }
  }

  const alreadySubmitted = Boolean(existingSubmission);

  return (
    <div className="mt-4">
      {existingSubmission && (
        <div className="mb-6 rounded-sm border border-line bg-parchment-dim px-4 py-4">
          <p className="text-sm font-medium text-ink">
            {existingSubmission.status === "pending"
              ? dict.lesson.submitted
              : dict.lesson.reviewed}
          </p>
          {existingSubmission.verdict && (
            <p className="mt-1 text-sm text-ink/70">
              {existingSubmission.verdict === "correct"
                ? dict.lesson.verdictCorrect
                : dict.lesson.verdictNeedsCorrection}
            </p>
          )}
          {existingSubmission.feedback && (
            <p className="mt-2 text-sm leading-relaxed text-ink/80">
              <span className="font-medium">{dict.lesson.feedback}: </span>
              {existingSubmission.feedback}
            </p>
          )}
        </div>
      )}

      {!uploadedPath ? (
        <div className="space-y-4">
          <p className="text-sm font-medium text-ink/60">
            {dict.lesson.chooseMethod}
          </p>

          <div className="flex flex-wrap items-center gap-3">
            {!isRecording ? (
              <button
                type="button"
                onClick={startRecording}
                className="rounded-sm border border-bottle px-4 py-2 text-sm font-medium text-bottle hover:bg-bottle hover:text-parchment transition-colors"
              >
                🎙 {dict.lesson.recordAudio}
              </button>
            ) : (
              <button
                type="button"
                onClick={stopRecording}
                className="rounded-sm bg-danger px-4 py-2 text-sm font-medium text-white"
              >
                ⏹ {dict.lesson.stopRecording} — {dict.lesson.recording}
              </button>
            )}

            <label className="cursor-pointer rounded-sm border border-line px-4 py-2 text-sm font-medium text-ink hover:border-bottle transition-colors">
              {dict.lesson.uploadAudio}
              <input
                type="file"
                accept="audio/*"
                className="hidden"
                onChange={(e) => {
                  setRecordedBlob(null);
                  setSelectedFile(e.target.files?.[0] ?? null);
                }}
              />
            </label>
          </div>

          {(recordedBlob || selectedFile) && (
            <div>
              <p className="mb-1 text-sm text-ink/60">
                {dict.lesson.recordedPreview}
              </p>
              <audio
                controls
                src={URL.createObjectURL(
                  (selectedFile ?? recordedBlob) as Blob
                )}
                className="w-full"
              />
            </div>
          )}

          {uploadError && (
            <p className="text-sm text-danger">{dict.auth.genericError}</p>
          )}

          {(recordedBlob || selectedFile) && (
            <button
              type="button"
              onClick={handleUpload}
              disabled={uploading}
              className="rounded-sm bg-brass px-5 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-brass-light disabled:opacity-60"
            >
              {uploading ? dict.lesson.uploading : dict.lesson.submit}
            </button>
          )}
        </div>
      ) : (
        <form action={formAction} className="space-y-3">
          <input type="hidden" name="enrollmentId" value={enrollmentId} />
          <input type="hidden" name="lessonId" value={lessonId} />
          <input type="hidden" name="audioPath" value={uploadedPath} />
          <input
            type="hidden"
            name="revalidatePath"
            value={revalidateTarget}
          />
          {state.error && (
            <p className="text-sm text-danger">{dict.auth.genericError}</p>
          )}
          <button
            type="submit"
            disabled={pending}
            className="rounded-sm bg-bottle px-5 py-2.5 text-sm font-medium text-parchment transition-colors hover:bg-bottle-light disabled:opacity-60"
          >
            {pending
              ? dict.common.loading
              : alreadySubmitted
                ? dict.lesson.resubmit
                : dict.lesson.submit}
          </button>
        </form>
      )}
    </div>
  );
}
