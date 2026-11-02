"use client";

import { useEffect, useState } from "react";

interface SlotRow {
  id: string;
  startsAt: string;
  endsAt: string;
  isBooked: boolean;
  meetingLink: string | null;
  booking: { student: { name: string; email: string } } | null;
}

export default function ProfessorAgendaPage() {
  const [slots, setSlots] = useState<SlotRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [startsAt, setStartsAt] = useState("");
  const [duration, setDuration] = useState(50);
  const [meetingLink, setMeetingLink] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/professor/availability");
    const data = await res.json();
    setSlots(data.slots ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const res = await fetch("/api/professor/availability", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        startsAt: new Date(startsAt).toISOString(),
        durationMinutes: duration,
        meetingLink,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Não foi possível criar o horário.");
      return;
    }
    setStartsAt("");
    load();
  }

  async function handleDelete(id: string) {
    await fetch(`/api/professor/availability/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div className="space-y-8">
      <h1 className="font-heading text-2xl font-bold text-brand-dark">Minha agenda</h1>

      <form onSubmit={handleCreate} className="grid gap-3 rounded-2xl bg-white p-5 shadow-sm sm:grid-cols-4">
        {error && <p className="col-span-4 text-sm text-red-600">{error}</p>}
        <input
          required
          type="datetime-local"
          value={startsAt}
          onChange={(e) => setStartsAt(e.target.value)}
          className="rounded-lg border border-gray-200 px-3 py-2"
        />
        <input
          type="number"
          min={15}
          value={duration}
          onChange={(e) => setDuration(Number(e.target.value))}
          className="rounded-lg border border-gray-200 px-3 py-2"
          placeholder="Minutos"
        />
        <input
          placeholder="Link do Meet/Zoom"
          value={meetingLink}
          onChange={(e) => setMeetingLink(e.target.value)}
          className="rounded-lg border border-gray-200 px-3 py-2"
        />
        <button type="submit" className="rounded-full bg-brand-blue px-4 py-2 font-semibold text-white hover:bg-brand-blue-dark">
          Adicionar horário
        </button>
      </form>

      {loading ? (
        <p className="text-brand-gray">Carregando...</p>
      ) : (
        <ul className="space-y-2">
          {slots.map((slot) => (
            <li key={slot.id} className="flex items-center justify-between rounded-xl bg-white p-4 shadow-sm">
              <div>
                <p className="font-medium text-brand-dark">
                  {new Date(slot.startsAt).toLocaleString("pt-BR")}
                </p>
                {slot.booking ? (
                  <p className="text-sm text-brand-gray">Agendado com {slot.booking.student.name}</p>
                ) : (
                  <p className="text-sm text-brand-gray">Livre</p>
                )}
              </div>
              {!slot.isBooked && (
                <button
                  onClick={() => handleDelete(slot.id)}
                  className="rounded-full border border-red-300 px-3 py-1 text-xs font-semibold text-red-600 hover:bg-red-50"
                >
                  Remover
                </button>
              )}
            </li>
          ))}
          {slots.length === 0 && <p className="text-brand-gray">Nenhum horário cadastrado ainda.</p>}
        </ul>
      )}
    </div>
  );
}
