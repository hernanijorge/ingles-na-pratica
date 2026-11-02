export interface SubmissionLike {
  exerciseId: string;
  status: "PENDING" | "CORRECT" | "INCORRECT" | "AWAITING_FEEDBACK" | "REVIEWED";
}

export interface ExerciseLike {
  id: string;
  type: "TRANSLATE" | "FILL" | "SPEAK";
}

/**
 * Uma aula é concluída quando todos os exercícios têm uma submissão "feita":
 * - TRANSLATE / FILL: precisa estar CORRECT (corrigido automaticamente).
 * - SPEAK: basta ter sido enviado (AWAITING_FEEDBACK ou REVIEWED) — o feedback
 *   do professor é um bônus, não bloqueia a conclusão.
 */
export function isExerciseDone(exercise: ExerciseLike, submission: SubmissionLike | undefined): boolean {
  if (!submission) return false;
  if (exercise.type === "SPEAK") {
    return submission.status === "AWAITING_FEEDBACK" || submission.status === "REVIEWED";
  }
  return submission.status === "CORRECT";
}

export function isLessonComplete(exercises: ExerciseLike[], submissions: SubmissionLike[]): boolean {
  if (exercises.length === 0) return false;
  const byExercise = new Map(submissions.map((s) => [s.exerciseId, s]));
  return exercises.every((exercise) => isExerciseDone(exercise, byExercise.get(exercise.id)));
}
