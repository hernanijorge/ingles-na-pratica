"use client";

import { useState } from "react";

export default function TestimonialPage() {
  const [content, setContent] = useState("");
  const [rating, setRating] = useState(5);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/testimonials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, rating }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Não foi possível enviar.");
        return;
      }
      setSent(true);
      setContent("");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md">
      <h1 className="mb-4 font-heading text-2xl font-bold text-brand-dark">Deixe seu depoimento</h1>
      {sent ? (
        <p className="rounded-xl bg-green-50 p-4 text-green-700">
          Obrigado! Seu depoimento foi enviado e aparecerá no site após aprovação.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3 rounded-2xl bg-white p-6 shadow-sm">
          {error && <p className="rounded-lg bg-red-50 p-2 text-sm text-red-600">{error}</p>}
          <label className="block text-sm text-brand-gray">
            Nota
            <select
              value={rating}
              onChange={(e) => setRating(Number(e.target.value))}
              className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2"
            >
              {[5, 4, 3, 2, 1].map((n) => (
                <option key={n} value={n}>
                  {n} estrela{n > 1 ? "s" : ""}
                </option>
              ))}
            </select>
          </label>
          <textarea
            required
            minLength={10}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Conte como o Descomplica English te ajudou..."
            rows={4}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 outline-brand-blue"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-brand-blue py-2.5 font-semibold text-white hover:bg-brand-blue-dark disabled:opacity-60"
          >
            {loading ? "Enviando..." : "Enviar depoimento"}
          </button>
        </form>
      )}
    </div>
  );
}
