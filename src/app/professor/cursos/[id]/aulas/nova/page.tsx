"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { LessonForm } from "@/components/LessonForm";

export default function NewLessonPage() {
  const { id } = useParams<{ id: string }>();

  return (
    <div className="space-y-4">
      <Link href={`/professor/cursos/${id}`} className="text-sm text-brand-blue-dark underline">
        ← Voltar para o curso
      </Link>
      <h1 className="font-heading text-2xl font-bold text-brand-dark">Nova aula</h1>
      <LessonForm
        courseId={id}
        initial={{
          title: "",
          slug: "",
          order: 1,
          videoUrl: "",
          isFreePreview: false,
          vocabulary: [],
          phrases: [],
          exercises: [],
        }}
      />
    </div>
  );
}
