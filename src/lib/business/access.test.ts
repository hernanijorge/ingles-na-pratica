import { describe, expect, it } from "vitest";
import { hasLessonAccess } from "./access";

describe("hasLessonAccess - liberação por compra", () => {
  it("libera a aula gratuita mesmo sem login", () => {
    expect(hasLessonAccess({ isFreePreview: true, userRole: null, isEnrolled: false })).toBe(true);
  });

  it("bloqueia aula paga para aluno não matriculado", () => {
    expect(hasLessonAccess({ isFreePreview: false, userRole: "ALUNO", isEnrolled: false })).toBe(false);
  });

  it("libera aula paga para aluno que comprou o curso (matriculado)", () => {
    expect(hasLessonAccess({ isFreePreview: false, userRole: "ALUNO", isEnrolled: true })).toBe(true);
  });

  it("libera qualquer aula para professor e admin, mesmo sem matrícula", () => {
    expect(hasLessonAccess({ isFreePreview: false, userRole: "PROFESSOR", isEnrolled: false })).toBe(true);
    expect(hasLessonAccess({ isFreePreview: false, userRole: "ADMIN", isEnrolled: false })).toBe(true);
  });
});
