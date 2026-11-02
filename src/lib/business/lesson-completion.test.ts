import { describe, expect, it } from "vitest";
import { isLessonComplete, type ExerciseLike, type SubmissionLike } from "./lesson-completion";

const exercises: ExerciseLike[] = [
  { id: "ex-translate", type: "TRANSLATE" },
  { id: "ex-fill", type: "FILL" },
  { id: "ex-speak", type: "SPEAK" },
];

describe("isLessonComplete - conclusão de aula", () => {
  it("não conclui aula sem nenhum exercício enviado", () => {
    expect(isLessonComplete(exercises, [])).toBe(false);
  });

  it("não conclui enquanto faltar pelo menos um exercício", () => {
    const submissions: SubmissionLike[] = [
      { exerciseId: "ex-translate", status: "CORRECT" },
      { exerciseId: "ex-fill", status: "CORRECT" },
    ];
    expect(isLessonComplete(exercises, submissions)).toBe(false);
  });

  it("não conclui se exercício de tradução/completar está incorreto", () => {
    const submissions: SubmissionLike[] = [
      { exerciseId: "ex-translate", status: "INCORRECT" },
      { exerciseId: "ex-fill", status: "CORRECT" },
      { exerciseId: "ex-speak", status: "AWAITING_FEEDBACK" },
    ];
    expect(isLessonComplete(exercises, submissions)).toBe(false);
  });

  it("conclui quando o exercício de fala foi apenas enviado (sem precisar de feedback do professor)", () => {
    const submissions: SubmissionLike[] = [
      { exerciseId: "ex-translate", status: "CORRECT" },
      { exerciseId: "ex-fill", status: "CORRECT" },
      { exerciseId: "ex-speak", status: "AWAITING_FEEDBACK" },
    ];
    expect(isLessonComplete(exercises, submissions)).toBe(true);
  });

  it("continua concluída após o professor revisar o áudio", () => {
    const submissions: SubmissionLike[] = [
      { exerciseId: "ex-translate", status: "CORRECT" },
      { exerciseId: "ex-fill", status: "CORRECT" },
      { exerciseId: "ex-speak", status: "REVIEWED" },
    ];
    expect(isLessonComplete(exercises, submissions)).toBe(true);
  });
});
