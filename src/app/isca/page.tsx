"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Logo } from "@/components/Logo";

export default function IscaPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, whatsapp }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Não foi possível enviar.");
        return;
      }
      router.push("/isca/obrigado");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-brand-light px-4 py-10">
      <Link href="/" className="mb-8">
        <Logo className="text-xl" />
      </Link>
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-sm">
        <h1 className="font-heading text-2xl font-semibold text-brand-dark">
          Baixe grátis: Inglês simples para o dia a dia
        </h1>
        <p className="mt-2 text-sm text-brand-gray">
          15 frases essenciais em inglês, com tradução, para você usar hoje mesmo. É só preencher
          abaixo.
        </p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-3">
          {error && <p className="rounded-lg bg-red-50 p-2 text-sm text-red-600">{error}</p>}
          <input
            required
            placeholder="Seu nome"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 outline-brand-blue"
          />
          <input
            required
            type="email"
            placeholder="Seu e-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 outline-brand-blue"
          />
          <input
            required
            placeholder="Seu WhatsApp"
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 outline-brand-blue"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-brand-blue py-2.5 font-semibold text-white transition hover:bg-brand-blue-dark disabled:opacity-60"
          >
            {loading ? "Enviando..." : "Quero o PDF grátis"}
          </button>
        </form>
      </div>
    </main>
  );
}
