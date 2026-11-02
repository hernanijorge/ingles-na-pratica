function toDayKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/**
 * Calcula a sequência atual de dias estudados (streak), contando para trás a
 * partir de "hoje" (ou do dia mais recente estudado, se hoje ainda não teve
 * estudo) enquanto os dias forem consecutivos.
 */
export function computeStreak(studyDates: Date[], today: Date = new Date()): number {
  if (studyDates.length === 0) return 0;
  const days = new Set(studyDates.map(toDayKey));

  const cursor = new Date(today);
  cursor.setUTCHours(0, 0, 0, 0);

  if (!days.has(toDayKey(cursor))) {
    cursor.setUTCDate(cursor.getUTCDate() - 1);
    if (!days.has(toDayKey(cursor))) return 0;
  }

  let streak = 0;
  while (days.has(toDayKey(cursor))) {
    streak += 1;
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }
  return streak;
}
