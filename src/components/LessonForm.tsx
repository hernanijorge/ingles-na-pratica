"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { uploadVideoFile } from "@/lib/client/upload";

export interface LessonFormValues {
  title: string;
  slug: string;
  order: number;
  videoUrl: string;
  isFreePreview: boolean;
  vocabulary: { en: string; pt: string }[];
  phrases: { en: string; pt: string }[];
  exercises: { type: "TRANSLATE" | "FILL" | "SPEAK"; prompt: string; answer?: string }[];
}

function linesToPairs(text: string): { en: string; pt: string }[] {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [en, pt] = line.split("|").map((p) => p.trim());
      return { en: en ?? "", pt: pt ?? "" };
    })
    .filter((p) => p.en && p.pt);
}

function pairsToLines(pairs: { en: string; pt: string }[]): string {
  return pairs.map((p) => `${p.en} | ${p.pt}`).join("\n");
}

function linesToExercises(text: string): LessonFormValues["exercises"] {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [type, prompt, answer] = line.split("|").map((p) => p.trim());
      return {
        type: (type as LessonFormValues["exercises"][number]["type"]) ?? "TRANSLATE",
        prompt: prompt ?? "",
        answer: answer || undefined,
      };
    })
    .filter((e) => e.prompt);
}

function exercisesToLines(exercises: LessonFormValues["exercises"]): string {
  return exercises.map((e) => `${e.type} | ${e.prompt}${e.answer ? ` | ${e.answer}` : ""}`).join("\n");
}

export function LessonForm({
  courseId,
  lessonId,
  initial,
}: {
  courseId: string;
  lessonId?: string;
  initial: LessonFormValues;
}) {
  const router = useRouter();
  const [title, setTitle] = useState(initial.title);
  const [slug, setSlug] = useState(initial.slug);
  const [order, setOrder] = useState(initial.order);
  const [videoUrl, setVideoUrl] = useState(initial.videoUrl);
  const [isFreePreview, setIsFreePreview] = useState(initial.isFreePreview);
  const [vocabularyText, setVocabularyText] = useState(pairsToLines(initial.vocabulary));
  const [phrasesText, setPhrasesText] = useState(pairsToLines(initial.phrases));
  const [exercisesText, setExercisesText] = useState(exercisesToLines(initial.exercises));
  const [uploading, setUploading] = useState(false);
  const [uploadPct, setUploadPct] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const publicUrl = await uploadVideoFile(file, setUploadPct);
      setVideoUrl(publicUrl);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const payload = {
      title,
      slug,
      order,
      videoUrl,
      isFreePreview,
      vocabulary: linesToPairs(vocabularyText),
      phrases: linesToPairs(phrasesText),
      exercises: linesToExercises(exercisesText),
    };

    const url = lessonId ? `/api/professor/lessons/${lessonId}` : `/api/professor/courses/${courseId}/lessons`;
    const method = lessonId ? "PATCH" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Não foi possível salvar.");
        return;
      }
      router.push(`/professor/cursos/${courseId}`);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl bg-white p-5 shadow-sm">
      {error && <p className="rounded-lg bg-red-50 p-2 text-sm text-red-600">{error}</p>}
      <div className="grid gap-3 sm:grid-cols-2">
        <input
          required
          placeholder="Título da aula"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="rounded-lg border border-gray-200 px-3 py-2"
        />
        <input
          required
          placeholder="slug-da-aula"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          className="rounded-lg border border-gray-200 px-3 py-2"
        />
        <input
          required
          type="number"
          min={1}
          value={order}
          onChange={(e) => setOrder(Number(e.target.value))}
          className="rounded-lg border border-gray-200 px-3 py-2"
        />
        <label className="flex items-center gap-2 text-sm text-brand-gray">
          <input type="checkbox" checked={isFreePreview} onChange={(e) => setIsFreePreview(e.target.checked)} />
          Aula grátis (preview)
        </label>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-brand-dark">Vídeo da aula</label>
        <input type="file" accept="video/*" onChange={handleFileChange} disabled={uploading} />
        {uploading && <p className="mt-1 text-sm text-brand-gray">Enviando... {uploadPct}%</p>}
        {videoUrl && <p className="mt-1 break-all text-sm text-brand-gray">{videoUrl}</p>}
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-brand-dark">
          Vocabulário — uma linha por item: <code>inglês | português</code>
        </label>
        <textarea
          rows={5}
          value={vocabularyText}
          onChange={(e) => setVocabularyText(e.target.value)}
          className="w-full rounded-lg border border-gray-200 px-3 py-2 font-mono text-sm"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-brand-dark">
          Frases úteis — uma linha por frase: <code>inglês | português</code>
        </label>
        <textarea
          rows={4}
          value={phrasesText}
          onChange={(e) => setPhrasesText(e.target.value)}
          className="w-full rounded-lg border border-gray-200 px-3 py-2 font-mono text-sm"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-brand-dark">
          Exercícios — uma linha por exercício: <code>TRANSLATE|FILL|SPEAK | enunciado | resposta (opcional p/ SPEAK)</code>
        </label>
        <textarea
          rows={5}
          value={exercisesText}
          onChange={(e) => setExercisesText(e.target.value)}
          className="w-full rounded-lg border border-gray-200 px-3 py-2 font-mono text-sm"
        />
      </div>

      <button
        type="submit"
        disabled={saving || uploading}
        className="rounded-full bg-brand-blue px-6 py-2.5 font-semibold text-white hover:bg-brand-blue-dark disabled:opacity-60"
      >
        {saving ? "Salvando..." : "Salvar aula"}
      </button>
    </form>
  );
}
