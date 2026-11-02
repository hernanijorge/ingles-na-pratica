import { describe, expect, it } from "vitest";
import { debitClassCredit, InsufficientCreditsError, refundClassCredit } from "./credits";

describe("pacote de 4 aulas debitando saldo", () => {
  it("debita 1 crédito ao agendar uma aula com o pacote", () => {
    const credit = { id: "c1", remainingCredits: 4 };
    expect(debitClassCredit(credit)).toBe(3);
  });

  it("permite debitar até o último crédito do pacote", () => {
    const credit = { id: "c1", remainingCredits: 1 };
    expect(debitClassCredit(credit)).toBe(0);
  });

  it("lança erro ao tentar agendar sem saldo no pacote", () => {
    const credit = { id: "c1", remainingCredits: 0 };
    expect(() => debitClassCredit(credit)).toThrow(InsufficientCreditsError);
  });

  it("devolve 1 crédito ao cancelar uma aula agendada com pacote, sem passar do total", () => {
    const credit = { id: "c1", remainingCredits: 2 };
    expect(refundClassCredit(credit, 4)).toBe(3);
    expect(refundClassCredit({ id: "c1", remainingCredits: 4 }, 4)).toBe(4);
  });
});
