"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AccountPage() {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    setLoading(true);
    try {
      await fetch("/api/account/delete", { method: "POST" });
      router.push("/");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md space-y-6">
      <h1 className="font-heading text-2xl font-bold text-brand-dark">Minha conta</h1>

      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="font-heading font-semibold text-brand-dark">Seus dados (LGPD)</h2>
        <p className="mt-2 text-sm text-brand-gray">
          Você pode baixar uma cópia de todos os seus dados ou excluir permanentemente sua conta.
        </p>
        <a
          href="/api/account/export"
          className="mt-4 inline-block rounded-full bg-brand-blue px-4 py-2 text-sm font-semibold text-white hover:bg-brand-blue-dark"
        >
          Exportar meus dados
        </a>
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="font-heading font-semibold text-red-600">Excluir conta</h2>
        <p className="mt-2 text-sm text-brand-gray">
          Isso remove seus dados pessoais da plataforma. Esta ação não pode ser desfeita.
        </p>
        {!confirming ? (
          <button
            onClick={() => setConfirming(true)}
            className="mt-4 rounded-full border border-red-500 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
          >
            Quero excluir minha conta
          </button>
        ) : (
          <div className="mt-4 flex gap-2">
            <button
              onClick={handleDelete}
              disabled={loading}
              className="rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
            >
              {loading ? "Excluindo..." : "Confirmar exclusão"}
            </button>
            <button
              onClick={() => setConfirming(false)}
              className="rounded-full border border-gray-200 px-4 py-2 text-sm text-brand-gray"
            >
              Cancelar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
