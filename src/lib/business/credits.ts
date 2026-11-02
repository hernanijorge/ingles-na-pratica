export interface ClassCreditLike {
  id: string;
  remainingCredits: number;
}

export class InsufficientCreditsError extends Error {
  constructor() {
    super("Pacote sem créditos suficientes para agendar esta aula.");
    this.name = "InsufficientCreditsError";
  }
}

/**
 * Debita 1 crédito do pacote ao agendar uma aula particular paga com pacote.
 * Retorna o novo saldo; lança erro se não houver saldo (nunca deixa negativo).
 */
export function debitClassCredit(credit: ClassCreditLike, amount = 1): number {
  if (credit.remainingCredits < amount) {
    throw new InsufficientCreditsError();
  }
  return credit.remainingCredits - amount;
}

/** Devolve 1 crédito ao pacote quando uma aula agendada com pacote é cancelada. */
export function refundClassCredit(credit: ClassCreditLike, totalCredits: number, amount = 1): number {
  return Math.min(totalCredits, credit.remainingCredits + amount);
}
