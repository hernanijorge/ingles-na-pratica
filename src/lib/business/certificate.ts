import { randomBytes } from "crypto";

/** Código público do certificado, ex: DES-7F3A9C2B. */
export function generateCertificateCode(): string {
  const token = randomBytes(5).toString("hex").toUpperCase();
  return `DES-${token}`;
}

export function isCourseFullyCompleted(totalLessons: number, completedLessons: number): boolean {
  return totalLessons > 0 && completedLessons >= totalLessons;
}
