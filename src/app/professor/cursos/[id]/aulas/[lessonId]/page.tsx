"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import { LessonForm, type LessonFormValues } from "@/components/LessonForm";

export default function EditLessonPage() {
  const { id, lessonId } = useParams<{ id: string; lessonId: string }>();
  const [initial, setInitial] = useState<LessonFormValues | null>(null);

  useEffect(() => {
    fetch(`/api/professor/lessons/${lessonId}`)
      .then((r) => r.json())
      .then((data) => {
        const lesson = data.lesson;
        if (!lesson) return;
        setInitial({
          title: lesson.title,
          slug: lesson.slug,
          order: lesson.order,
          videoUrl: lesson.videoUrl ?? "",
          isFreePreview: lesson.isFreePreview,
          vocabulary: lesson.vocabulary.map((v: { en: string; pt: string }) => ({ en: v.en, pt: v.pt })),
          phrases: lesson.phrases.map((p: { en: string; pt: string }) => ({ en: p.en, pt: p.pt })),
          exercises: lesson.exercises.map(
            (ex: { type: "TRANSLATE" | "FILL" | "SPEAK"; prompt: string; answer: string | null }) => ({
              type: ex.type,
              prompt: ex.prompt,
              answer: ex.answer ?? undefined,
            }),
          ),
        });
      });
  }, [lessonId]);

  return (
    <div className="space-y-4">
      <Link href={`/professor/cursos/${id}`} className="text-sm text-brand-blue-dark underline">
        ← Voltar para o curso
      </Link>
      <h1 className="font-heading text-2xl font-bold text-brand-dark">Editar aula</h1>
      {initial ? (
        <LessonForm courseId={id} lessonId={lessonId} initial={initial} />
      ) : (
        <p className="text-brand-gray">Carregando...</p>
      )}
    </div>
  );
}
