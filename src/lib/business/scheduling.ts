export const SAO_PAULO_TZ = "America/Sao_Paulo";
export const NEW_YORK_TZ = "America/New_York";

export interface ZonedSlot {
  timeZone: string;
  label: string;
  isoOffset: string;
}

/**
 * Converte um horário (armazenado em UTC no banco) para a hora local em um
 * fuso específico, retornando um rótulo pronto para exibição (pt-BR) e o
 * offset UTC correspondente naquela data (considera horário de verão).
 */
export function formatInTimeZone(date: Date, timeZone: string): ZonedSlot {
  const formatter = new Intl.DateTimeFormat("pt-BR", {
    timeZone,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const label = formatter.format(date);

  const offsetFormatter = new Intl.DateTimeFormat("en-US", {
    timeZone,
    timeZoneName: "shortOffset",
  });
  const parts = offsetFormatter.formatToParts(date);
  const offsetPart = parts.find((p) => p.type === "timeZoneName");
  const isoOffset = normalizeOffset(offsetPart?.value ?? "GMT+0");

  return { timeZone, label, isoOffset };
}

function normalizeOffset(raw: string): string {
  // raw vem como "GMT-3", "GMT-03:00" ou "GMT"; normaliza para "-03:00"
  if (raw === "GMT" || raw === "UTC") return "+00:00";
  const match = raw.match(/GMT([+-])(\d{1,2})(?::(\d{2}))?/);
  if (!match) return "+00:00";
  const [, sign, hourPart, minutePart] = match;
  const hourDigits = hourPart!.padStart(2, "0");
  const minuteDigits = (minutePart ?? "00").padStart(2, "0");
  return `${sign}${hourDigits}:${minuteDigits}`;
}

export interface SlotZonedView {
  saoPaulo: ZonedSlot;
  newYork: ZonedSlot;
}

export function getSlotZonedView(utcDate: Date): SlotZonedView {
  return {
    saoPaulo: formatInTimeZone(utcDate, SAO_PAULO_TZ),
    newYork: formatInTimeZone(utcDate, NEW_YORK_TZ),
  };
}

/** Diferença, em minutos, entre o offset UTC de newYork e o de saoPaulo numa data. */
export function offsetDiffMinutes(utcDate: Date): number {
  const toMinutes = (offset: string) => {
    const sign = offset.startsWith("-") ? -1 : 1;
    const [h, m] = offset.slice(1).split(":").map(Number);
    return sign * ((h ?? 0) * 60 + (m ?? 0));
  };
  const view = getSlotZonedView(utcDate);
  return toMinutes(view.newYork.isoOffset) - toMinutes(view.saoPaulo.isoOffset);
}
