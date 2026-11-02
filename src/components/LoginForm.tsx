"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Logo } from "@/components/Logo";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Não foi possível entrar.");
        return;
      }
      const redirectTo =
        searchParams.get("redirecionar") ??
        (data.role === "ADMIN" ? "/admin" : data.role === "PROFESSOR" ? "/professor" : "/app");
      router.push(redirectTo);
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
        <h1 className="font-heading text-xl font-semibold text-brand-dark">Entrar</h1>
        {error && <p className="rounded-lg bg-red-50 p-2 text-sm text-red-600">{error}</p>}
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
          <label className="mb-1 block text-sm text-brand-gray" htmlFor="password">
            Senha
          </label>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 outline-brand-blue"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-brand-blue py-2.5 font-semibold text-white transition hover:bg-brand-blue-dark disabled:opacity-60"
        >
          {loading ? "Entrando..." : "Entrar"}
        </button>
        <p className="text-center text-sm text-brand-gray">
          Não tem conta?{" "}
          <Link href="/cadastro" className="text-brand-blue-dark underline">
            Cadastre-se
          </Link>
        </p>
      </form>
    </main>
  );
}
