function normalize(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[.,!?;:]/g, "")
    .replace(/\s+/g, " ");
}

/** Correção automática de exercícios de tradução/completar: compara a resposta normalizada. */
export function gradeTextAnswer(answer: string, expected: string): boolean {
  return normalize(answer) === normalize(expected);
}
