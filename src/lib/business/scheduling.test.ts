import { describe, expect, it } from "vitest";
import { formatInTimeZone, getSlotZonedView, NEW_YORK_TZ, offsetDiffMinutes, SAO_PAULO_TZ } from "./scheduling";

describe("conversão de fuso no agendamento", () => {
  it("formata o mesmo instante com horários diferentes em São Paulo e Nova York", () => {
    // 2026-01-15 15:00 UTC
    const utc = new Date("2026-01-15T15:00:00.000Z");
    const view = getSlotZonedView(utc);

    expect(view.saoPaulo.timeZone).toBe(SAO_PAULO_TZ);
    expect(view.newYork.timeZone).toBe(NEW_YORK_TZ);

    // São Paulo é UTC-3 o ano inteiro (sem horário de verão desde 2019)
    expect(view.saoPaulo.label).toContain("12:00");
    expect(view.saoPaulo.isoOffset).toBe("-03:00");

    // Em janeiro, Nova York está em EST (UTC-5)
    expect(view.newYork.label).toContain("10:00");
    expect(view.newYork.isoOffset).toBe("-05:00");
  });

  it("ajusta o offset de Nova York no horário de verão (EDT, UTC-4)", () => {
    // 2026-07-15 15:00 UTC -> horário de verão nos EUA
    const utc = new Date("2026-07-15T15:00:00.000Z");
    const view = getSlotZonedView(utc);

    expect(view.newYork.isoOffset).toBe("-04:00");
    expect(view.newYork.label).toContain("11:00");
    // São Paulo permanece fixo em -03:00
    expect(view.saoPaulo.isoOffset).toBe("-03:00");
  });

  it("calcula a diferença de offset entre os dois fusos", () => {
    const janUtc = new Date("2026-01-15T15:00:00.000Z");
    expect(offsetDiffMinutes(janUtc)).toBe(-120); // NY está 2h atrás de SP no inverno americano

    const julUtc = new Date("2026-07-15T15:00:00.000Z");
    expect(offsetDiffMinutes(julUtc)).toBe(-60); // NY está 1h atrás de SP no horário de verão
  });

  it("formatInTimeZone retorna a data corretamente formatada em pt-BR", () => {
    const utc = new Date("2026-03-10T12:00:00.000Z");
    const result = formatInTimeZone(utc, SAO_PAULO_TZ);
    expect(result.label).toMatch(/10\/03\/2026/);
  });
});
