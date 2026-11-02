"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

interface Lesson {
  id: string;
  title: string;
  slug: string;
  order: number;
  isFreePreview: boolean;
}

interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  level: string;
  productKey: string;
  published: boolean;
  lessons: Lesson[];
}

export default function EditCoursePage() {
  const { id } = useParams<{ id: string }>();
  const [course, setCourse] = useState<Course | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function load() {
    const res = await fetch(`/api/professor/courses/${id}`);
    const data = await res.json();
    setCourse(data.course ?? null);
  }

  useEffect(() => {
    load();
  }, [id]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!course) return;
    setSaving(true);
    setMessage(null);
    const res = await fetch(`/api/professor/courses/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: course.title,
        description: course.description,
        level: course.level,
        published: course.published,
      }),
    });
    setSaving(false);
    setMessage(res.ok ? "Salvo!" : "Erro ao salvar.");
  }

  if (!course) return <p className="text-brand-gray">Carregando...</p>;

  return (
    <div className="space-y-8">
      <Link href="/professor/cursos" className="text-sm text-brand-blue-dark underline">
        ← Voltar para cursos
      </Link>

      <form onSubmit={handleSave} className="grid gap-3 rounded-2xl bg-white p-5 shadow-sm sm:grid-cols-2">
        {message && <p className="col-span-2 text-sm text-brand-gray">{message}</p>}
        <input
          value={course.title}
          onChange={(e) => setCourse({ ...course, title: e.target.value })}
          className="rounded-lg border border-gray-200 px-3 py-2"
        />
        <input disabled value={course.slug} className="rounded-lg border border-gray-100 bg-gray-50 px-3 py-2 text-brand-gray" />
        <textarea
          value={course.description}
          onChange={(e) => setCourse({ ...course, description: e.target.value })}
          className="col-span-2 rounded-lg border border-gray-200 px-3 py-2"
        />
        <input
          value={course.level}
          onChange={(e) => setCourse({ ...course, level: e.target.value })}
          className="rounded-lg border border-gray-200 px-3 py-2"
        />
        <label className="flex items-center gap-2 text-sm text-brand-gray">
          <input
            type="checkbox"
            checked={course.published}
            onChange={(e) => setCourse({ ...course, published: e.target.checked })}
          />
          Publicado
        </label>
        <button
          type="submit"
          disabled={saving}
          className="col-span-2 w-fit rounded-full bg-brand-blue px-5 py-2 font-semibold text-white hover:bg-brand-blue-dark disabled:opacity-60"
        >
          {saving ? "Salvando..." : "Salvar"}
        </button>
      </form>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-heading text-lg font-semibold text-brand-dark">Aulas</h2>
          <Link
            href={`/professor/cursos/${id}/aulas/nova`}
            className="rounded-full bg-brand-blue px-4 py-2 text-sm font-semibold text-white hover:bg-brand-blue-dark"
          >
            + Nova aula
          </Link>
        </div>
        <ul className="space-y-2">
          {course.lessons
            .sort((a, b) => a.order - b.order)
            .map((lesson) => (
              <li key={lesson.id} className="flex items-center justify-between rounded-xl bg-white p-4 shadow-sm">
                <span>
                  {lesson.order}. {lesson.title} {lesson.isFreePreview && "🔓"}
                </span>
                <Link
                  href={`/professor/cursos/${id}/aulas/${lesson.id}`}
                  className="rounded-full bg-brand-light px-4 py-2 text-sm font-semibold text-brand-blue-dark hover:bg-brand-blue hover:text-white"
                >
                  Editar
                </Link>
              </li>
            ))}
        </ul>
      </div>
    </div>
  );
}
