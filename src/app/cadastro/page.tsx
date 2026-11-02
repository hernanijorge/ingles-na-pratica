"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Logo } from "@/components/Logo";

export default function CadastroPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [password, setPassword] = useState("");
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, whatsapp, password, consent }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Não foi possível cadastrar.");
        return;
      }
      router.push("/app");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-brand-light px-4 py-10">
      <Link href="/" className="mb-8">
        <Logo className="text-xl" />
      </Link>
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm space-y-4 rounded-2xl bg-white p-6 shadow-sm"
      >
        <h1 className="font-heading text-xl font-semibold text-brand-dark">Criar conta</h1>
        {error && <p className="rounded-lg bg-red-50 p-2 text-sm text-red-600">{error}</p>}
        <div>
          <label className="mb-1 block text-sm text-brand-gray" htmlFor="name">
            Nome completo
          </label>
          <input
            id="name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 outline-brand-blue"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-brand-gray" htmlFor="email">
            E-mail
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 outline-brand-blue"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-brand-gray" htmlFor="whatsapp">
            WhatsApp
          </label>
          <input
            id="whatsapp"
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
            placeholder="(11) 91234-5678"
            className="w-full rounded-lg border border-gray-200 px-3 py-2 outline-brand-blue"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-brand-gray" htmlFor="password">
            Senha
          </label>
          <input
            id="password"
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 outline-brand-blue"
          />
        </div>
        <label className="flex items-start gap-2 text-sm text-brand-gray">
          <input
            type="checkbox"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            className="mt-1"
          />
          Aceito os termos de uso e a política de privacidade (LGPD) e autorizo o uso dos meus
          dados para acesso à plataforma.
        </label>
        <button
          type="submit"
          disabled={loading || !consent}
          className="w-full rounded-lg bg-brand-blue py-2.5 font-semibold text-white transition hover:bg-brand-blue-dark disabled:opacity-60"
        >
          {loading ? "Criando conta..." : "Criar conta"}
        </button>
        <p className="text-center text-sm text-brand-gray">
          Já tem conta?{" "}
          <Link href="/entrar" className="text-brand-blue-dark underline">
            Entrar
          </Link>
        </p>
      </form>
    </main>
  );
}
