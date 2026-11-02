"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

function formatBRL(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function BuyCourseButton({
  productKey,
  priceCents,
  loggedIn,
}: {
  productKey: string;
  priceCents: number;
  loggedIn: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    if (!loggedIn) {
      router.push("/entrar");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productKey }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) {
        setError(data.error ?? "Não foi possível iniciar o pagamento.");
        return;
      }
      window.location.href = data.url;
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      {error && <p className="mb-2 text-sm text-red-600">{error}</p>}
      <button
        onClick={handleClick}
        disabled={loading}
        className="rounded-full bg-brand-blue px-6 py-3 font-semibold text-white shadow-sm transition hover:bg-brand-blue-dark disabled:opacity-60"
      >
        {loading ? "Redirecionando..." : `Comprar por ${formatBRL(priceCents)}`}
      </button>
    </div>
  );
}
