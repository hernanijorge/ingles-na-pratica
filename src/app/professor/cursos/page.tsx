"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

interface CourseRow {
  id: string;
  title: string;
  slug: string;
  published: boolean;
  productKey: string;
  lessons: { id: string }[];
}

const PRODUCT_KEYS = ["COURSE_FULL", "COURSE_CONSTRUCTION", "SINGLE_CLASS", "PACKAGE_4"];

export default function ProfessorCoursesPage() {
  const [courses, setCourses] = useState<CourseRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: "",
    slug: "",
    description: "",
    level: "Iniciante",
    productKey: "COURSE_FULL",
    published: false,
  });

  async function load() {
    setLoading(true);
    const res = await fetch("/api/professor/courses");
    const data = await res.json();
    setCourses(data.courses ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const res = await fetch("/api/professor/courses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, order: courses.length }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Não foi possível criar o curso.");
      return;
    }
    setForm({ title: "", slug: "", description: "", level: "Iniciante", productKey: "COURSE_FULL", published: false });
    load();
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-2xl font-bold text-brand-dark">Cursos</h1>
      </div>

      <form onSubmit={handleCreate} className="grid gap-3 rounded-2xl bg-white p-5 shadow-sm sm:grid-cols-2">
        {error && <p className="col-span-2 rounded-lg bg-red-50 p-2 text-sm text-red-600">{error}</p>}
        <input
          required
          placeholder="Título"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          className="rounded-lg border border-gray-200 px-3 py-2"
        />
        <input
          required
          placeholder="slug-do-curso"
          value={form.slug}
          onChange={(e) => setForm({ ...form, slug: e.target.value })}
          className="rounded-lg border border-gray-200 px-3 py-2"
        />
        <textarea
          required
          placeholder="Descrição"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="col-span-2 rounded-lg border border-gray-200 px-3 py-2"
        />
        <input
          placeholder="Nível (ex: Iniciante)"
          value={form.level}
          onChange={(e) => setForm({ ...form, level: e.target.value })}
          className="rounded-lg border border-gray-200 px-3 py-2"
        />
        <select
          value={form.productKey}
          onChange={(e) => setForm({ ...form, productKey: e.target.value })}
          className="rounded-lg border border-gray-200 px-3 py-2"
        >
          {PRODUCT_KEYS.map((key) => (
            <option key={key} value={key}>
              {key}
            </option>
          ))}
        </select>
        <label className="col-span-2 flex items-center gap-2 text-sm text-brand-gray">
          <input
            type="checkbox"
            checked={form.published}
            onChange={(e) => setForm({ ...form, published: e.target.checked })}
          />
          Publicado (visível no site)
        </label>
        <button
          type="submit"
          className="col-span-2 w-fit rounded-full bg-brand-blue px-5 py-2 font-semibold text-white hover:bg-brand-blue-dark"
        >
          Criar curso
        </button>
      </form>

      {loading ? (
        <p className="text-brand-gray">Carregando...</p>
      ) : (
        <ul className="space-y-3">
          {courses.map((course) => (
            <li key={course.id} className="flex items-center justify-between rounded-xl bg-white p-4 shadow-sm">
              <div>
                <p className="font-medium text-brand-dark">{course.title}</p>
                <p className="text-sm text-brand-gray">
                  {course.lessons.length} aulas · {course.published ? "Publicado" : "Rascunho"}
                </p>
              </div>
              <Link
                href={`/professor/cursos/${course.id}`}
                className="rounded-full bg-brand-blue px-4 py-2 text-sm font-semibold text-white hover:bg-brand-blue-dark"
              >
                Gerenciar
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
