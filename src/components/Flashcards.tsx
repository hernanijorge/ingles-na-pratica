"use client";

import { useState } from "react";
import { SpeakButton } from "./SpeakButton";

export function Flashcards({ items }: { items: { en: string; pt: string }[] }) {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  if (items.length === 0) return null;
  const current = items[index]!;

  function next() {
    setFlipped(false);
    setIndex((i) => (i + 1) % items.length);
  }

  function prev() {
    setFlipped(false);
    setIndex((i) => (i - 1 + items.length) % items.length);
  }

  return (
    <div className="mx-auto max-w-sm">
      <button
        type="button"
        onClick={() => setFlipped((f) => !f)}
        className="flex h-40 w-full flex-col items-center justify-center gap-2 rounded-2xl bg-brand-light p-4 text-center shadow-sm"
      >
        <span className="font-heading text-2xl font-semibold text-brand-dark">
          {flipped ? current.pt : current.en}
        </span>
        <span className="text-xs text-brand-gray">Toque para {flipped ? "ver em inglês" : "ver em português"}</span>
      </button>
      <div className="mt-3 flex items-center justify-between">
        <button type="button" onClick={prev} className="rounded-full px-3 py-1 text-sm text-brand-gray hover:bg-gray-100">
          ← Anterior
        </button>
        <SpeakButton text={current.en} />
        <span className="text-xs text-brand-gray">
          {index + 1}/{items.length}
        </span>
        <button type="button" onClick={next} className="rounded-full px-3 py-1 text-sm text-brand-gray hover:bg-gray-100">
          Próxima →
        </button>
      </div>
    </div>
  );
}
