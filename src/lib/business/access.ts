export interface LessonAccessInput {
  isFreePreview: boolean;
  userRole: "ALUNO" | "PROFESSOR" | "ADMIN" | null;
  isEnrolled: boolean;
}

/**
 * Regra de liberação de aula por compra:
 * - A aula 1 (isFreePreview) é sempre liberada, mesmo sem login.
 * - Professores e admins têm acesso total (gestão de conteúdo).
 * - Demais aulas exigem matrícula (Enrollment), criada na compra do curso.
 */
export function hasLessonAccess(input: LessonAccessInput): boolean {
  if (input.isFreePreview) return true;
  if (input.userRole === "PROFESSOR" || input.userRole === "ADMIN") return true;
  return input.isEnrolled;
}

export interface CourseAccessInput {
  userRole: "ALUNO" | "PROFESSOR" | "ADMIN" | null;
  isEnrolled: boolean;
}

export function hasFullCourseAccess(input: CourseAccessInput): boolean {
  if (input.userRole === "PROFESSOR" || input.userRole === "ADMIN") return true;
  return input.isEnrolled;
}
