"use client";

import { useEffect, useState } from "react";

interface ProductRow {
  id: string;
  key: string;
  name: string;
  priceCents: number;
  currency: string;
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/products");
    const data = await res.json();
    setProducts(data.products ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleSave(id: string) {
    const value = drafts[id];
    if (!value) return;
    const priceCents = Math.round(Number(value.replace(",", ".")) * 100);
    if (!Number.isFinite(priceCents) || priceCents <= 0) {
      setMessage("Preço inválido.");
      return;
    }
    const res = await fetch(`/api/admin/products/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ priceCents }),
    });
    setMessage(res.ok ? "Preço atualizado!" : "Erro ao atualizar.");
    load();
  }

  return (
    <div className="space-y-4">
      <h1 className="font-heading text-2xl font-bold text-brand-dark">Produtos e preços</h1>
      {message && <p className="text-sm text-brand-gray">{message}</p>}
      {loading ? (
        <p className="text-brand-gray">Carregando...</p>
      ) : (
        <ul className="space-y-3">
          {products.map((p) => (
            <li key={p.id} className="flex items-center justify-between rounded-xl bg-white p-4 shadow-sm">
              <div>
                <p className="font-medium text-brand-dark">{p.name}</p>
                <p className="text-sm text-brand-gray">
                  Preço atual: {(p.priceCents / 100).toLocaleString("pt-BR", { style: "currency", currency: p.currency })}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <input
                  placeholder="Novo preço (ex: 97,00)"
                  value={drafts[p.id] ?? ""}
                  onChange={(e) => setDrafts({ ...drafts, [p.id]: e.target.value })}
                  className="w-36 rounded-lg border border-gray-200 px-3 py-2 text-sm"
                />
                <button
                  onClick={() => handleSave(p.id)}
                  className="rounded-full bg-brand-blue px-4 py-2 text-sm font-semibold text-white hover:bg-brand-blue-dark"
                >
                  Salvar
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
