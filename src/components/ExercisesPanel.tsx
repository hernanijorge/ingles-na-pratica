"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

export interface ExerciseView {
  id: string;
  type: "TRANSLATE" | "FILL" | "SPEAK";
  prompt: string;
}

export interface SubmissionView {
  status: "PENDING" | "CORRECT" | "INCORRECT" | "AWAITING_FEEDBACK" | "REVIEWED";
  textAnswer?: string | null;
  audioUrl?: string | null;
  teacherFeedback?: string | null;
}

function statusBadge(status: SubmissionView["status"] | undefined) {
  switch (status) {
    case "CORRECT":
      return <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">Correto ✅</span>;
    case "INCORRECT":
      return <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">Tente novamente</span>;
    case "AWAITING_FEEDBACK":
      return <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">Enviado, aguardando correção</span>;
    case "REVIEWED":
      return <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">Corrigido pelo professor ✅</span>;
    default:
      return null;
  }
}

function ExerciseItem({
  exercise,
  submission,
  index,
}: {
  exercise: ExerciseView;
  submission?: SubmissionView;
  index: number;
}) {
  const router = useRouter();
  const [answer, setAnswer] = useState(submission?.textAnswer ?? "");
  const [current, setCurrent] = useState<SubmissionView | undefined>(submission);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [recording, setRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);

  async function submitText(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/exercises/${exercise.id}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind: "text", textAnswer: answer }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Não foi possível enviar.");
        return;
      }
      setCurrent(data.submission);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  async function startRecording() {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      chunksRef.current = [];
      const recorder = new MediaRecorder(stream);
      recorder.ondataavailable = (e) => chunksRef.current.push(e.data);
      recorder.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
      };
      recorder.start();
      mediaRecorderRef.current = recorder;
      setRecording(true);
    } catch {
      setError("Não foi possível acessar o microfone.");
    }
  }

  async function stopRecordingAndSend() {
    const recorder = mediaRecorderRef.current;
    if (!recorder) return;
    setRecording(false);
    setLoading(true);
    setError(null);

    await new Promise<void>((resolve) => {
      recorder.onstop = () => {
        recorder.stream.getTracks().forEach((t) => t.stop());
        resolve();
      };
      recorder.stop();
    });

    try {
      const blob = new Blob(chunksRef.current, { type: "audio/webm" });
      const presignRes = await fetch("/api/uploads/presign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          folder: "audio-exercicios",
          fileName: `exercicio-${exercise.id}.webm`,
          contentType: blob.type,
          sizeBytes: blob.size,
        }),
      });
      const presignData = await presignRes.json();
      if (!presignRes.ok) {
        setError(presignData.error ?? "Não foi possível preparar o envio do áudio.");
        return;
      }

      await fetch(presignData.url, { method: "PUT", headers: { "Content-Type": blob.type }, body: blob });

      const submitRes = await fetch(`/api/exercises/${exercise.id}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind: "audio", audioUrl: presignData.publicUrl }),
      });
      const submitData = await submitRes.json();
      if (!submitRes.ok) {
        setError(submitData.error ?? "Não foi possível enviar o áudio.");
        return;
      }
      setCurrent(submitData.submission);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-xl border border-gray-100 p-4">
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="text-sm font-medium text-brand-gray">Exercício {index + 1}</p>
        {statusBadge(current?.status)}
      </div>
      <p className="mb-3 text-brand-dark">{exercise.prompt}</p>

      {exercise.type !== "SPEAK" ? (
        <form onSubmit={submitText} className="flex flex-col gap-2 sm:flex-row">
          <input
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Sua resposta"
            className="flex-1 rounded-lg border border-gray-200 px-3 py-2 outline-brand-blue"
          />
          <button
            type="submit"
            disabled={loading || !answer.trim()}
            className="rounded-lg bg-brand-blue px-4 py-2 font-semibold text-white hover:bg-brand-blue-dark disabled:opacity-60"
          >
            Enviar
          </button>
        </form>
      ) : (
        <div className="flex flex-col gap-2">
          {current?.audioUrl && (
            <audio controls src={current.audioUrl} className="w-full">
              <track kind="captions" />
            </audio>
          )}
          {!recording ? (
            <button
              type="button"
              onClick={startRecording}
              disabled={loading}
              className="w-fit rounded-lg bg-brand-blue px-4 py-2 font-semibold text-white hover:bg-brand-blue-dark disabled:opacity-60"
            >
              🎙️ Gravar resposta
            </button>
          ) : (
            <button
              type="button"
              onClick={stopRecordingAndSend}
              className="w-fit rounded-lg bg-red-500 px-4 py-2 font-semibold text-white hover:bg-red-600"
            >
              ⏹ Parar e enviar
            </button>
          )}
          {current?.teacherFeedback && (
            <p className="rounded-lg bg-brand-light p-3 text-sm text-brand-dark">
              <strong>Feedback do professor:</strong> {current.teacherFeedback}
            </p>
          )}
        </div>
      )}
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}

export function ExercisesPanel({
  exercises,
  submissions,
}: {
  exercises: ExerciseView[];
  submissions: Record<string, SubmissionView>;
}) {
  return (
    <div className="space-y-4">
      {exercises.map((exercise, index) => (
        <ExerciseItem key={exercise.id} exercise={exercise} submission={submissions[exercise.id]} index={index} />
      ))}
    </div>
  );
}
