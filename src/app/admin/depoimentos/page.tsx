"use client";

import { useEffect, useState } from "react";

interface TestimonialRow {
  id: string;
  content: string;
  rating: number;
  approved: boolean;
  user: { name: string; email: string };
}

export default function AdminTestimonialsPage() {
  const [testimonials, setTestimonials] = useState<TestimonialRow[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/testimonials");
    const data = await res.json();
    setTestimonials(data.testimonials ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function toggleApproved(id: string, approved: boolean) {
    await fetch(`/api/admin/testimonials/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ approved }),
    });
    load();
  }

  return (
    <div className="space-y-4">
      <h1 className="font-heading text-2xl font-bold text-brand-dark">Depoimentos</h1>
      {loading ? (
        <p className="text-brand-gray">Carregando...</p>
      ) : (
        <ul className="space-y-3">
          {testimonials.map((t) => (
            <li key={t.id} className="rounded-xl bg-white p-4 shadow-sm">
              <p className="text-sm text-brand-gray">
                {t.user.name} · {t.rating}★ · {t.approved ? "Aprovado" : "Pendente"}
              </p>
              <p className="mt-1 text-brand-dark">{t.content}</p>
              <div className="mt-3 flex gap-2">
                {!t.approved ? (
                  <button
                    onClick={() => toggleApproved(t.id, true)}
                    className="rounded-full bg-green-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-green-700"
                  >
                    Aprovar
                  </button>
                ) : (
                  <button
                    onClick={() => toggleApproved(t.id, false)}
                    className="rounded-full border border-gray-200 px-4 py-1.5 text-sm text-brand-gray hover:bg-gray-50"
                  >
                    Remover aprovação
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
