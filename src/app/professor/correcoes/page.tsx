"use client";

import { useEffect, useState } from "react";

interface SubmissionRow {
  id: string;
  audioUrl: string | null;
  status: string;
  teacherFeedback: string | null;
  user: { name: string; email: string };
  exercise: { prompt: string; lesson: { title: string; course: { title: string } } };
}

export default function CorrectionsPage() {
  const [submissions, setSubmissions] = useState<SubmissionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedbackDrafts, setFeedbackDrafts] = useState<Record<string, string>>({});

  async function load() {
    setLoading(true);
    const res = await fetch("/api/professor/submissions");
    const data = await res.json();
    setSubmissions(data.submissions ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function sendFeedback(id: string) {
    const teacherFeedback = feedbackDrafts[id];
    if (!teacherFeedback?.trim()) return;
    await fetch(`/api/professor/submissions/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ teacherFeedback }),
    });
    load();
  }

  const pending = submissions.filter((s) => s.status === "AWAITING_FEEDBACK");
  const reviewed = submissions.filter((s) => s.status === "REVIEWED");

  return (
    <div className="space-y-8">
      <h1 className="font-heading text-2xl font-bold text-brand-dark">Correção de áudios</h1>

      {loading ? (
        <p className="text-brand-gray">Carregando...</p>
      ) : (
        <>
          <section>
            <h2 className="mb-3 font-heading text-lg font-semibold text-brand-dark">
              Aguardando correção ({pending.length})
            </h2>
            <ul className="space-y-4">
              {pending.map((s) => (
                <li key={s.id} className="rounded-xl bg-white p-4 shadow-sm">
                  <p className="text-sm text-brand-gray">
                    {s.user.name} — {s.exercise.lesson.course.title} / {s.exercise.lesson.title}
                  </p>
                  <p className="mb-2 font-medium text-brand-dark">{s.exercise.prompt}</p>
                  {s.audioUrl && (
                    <audio controls src={s.audioUrl} className="w-full">
                      <track kind="captions" />
                    </audio>
                  )}
                  <div className="mt-2 flex gap-2">
                    <input
                      placeholder="Escreva um feedback..."
                      value={feedbackDrafts[s.id] ?? ""}
                      onChange={(e) => setFeedbackDrafts({ ...feedbackDrafts, [s.id]: e.target.value })}
                      className="flex-1 rounded-lg border border-gray-200 px-3 py-2"
                    />
                    <button
                      onClick={() => sendFeedback(s.id)}
                      className="rounded-lg bg-brand-blue px-4 py-2 font-semibold text-white hover:bg-brand-blue-dark"
                    >
                      Enviar
                    </button>
                  </div>
                </li>
              ))}
              {pending.length === 0 && <p className="text-brand-gray">Nenhum áudio pendente. 🎉</p>}
            </ul>
          </section>

          <section>
            <h2 className="mb-3 font-heading text-lg font-semibold text-brand-dark">Já corrigidos</h2>
            <ul className="space-y-2">
              {reviewed.map((s) => (
                <li key={s.id} className="rounded-xl bg-white p-4 shadow-sm">
                  <p className="text-sm text-brand-gray">{s.user.name}</p>
                  <p className="text-sm text-brand-dark">{s.teacherFeedback}</p>
                </li>
              ))}
            </ul>
          </section>
        </>
      )}
    </div>
  );
}
