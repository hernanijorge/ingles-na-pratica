import "server-only";
import { prisma } from "@/lib/prisma";
import { isLessonComplete } from "@/lib/business/lesson-completion";
import { generateCertificateCode, isCourseFullyCompleted } from "@/lib/business/certificate";

function todayUtc(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

/** Recalcula se a aula está concluída para o usuário; se sim, registra progresso, dia estudado e certificado. */
export async function recomputeLessonCompletion(userId: string, lessonId: string) {
  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: {
      exercises: true,
      course: { include: { lessons: { select: { id: true } } } },
    },
  });
  if (!lesson) return;

  const submissions = await prisma.exerciseSubmission.findMany({
    where: { userId, exercise: { lessonId } },
  });

  const complete = isLessonComplete(
    lesson.exercises.map((e) => ({ id: e.id, type: e.type })),
    submissions.map((s) => ({ exerciseId: s.exerciseId, status: s.status })),
  );

  if (!complete) return;

  await prisma.lessonProgress.upsert({
    where: { userId_lessonId: { userId, lessonId } },
    create: { userId, lessonId },
    update: {},
  });

  await prisma.studyDay.upsert({
    where: { userId_date: { userId, date: todayUtc() } },
    create: { userId, date: todayUtc() },
    update: {},
  });

  await maybeIssueCertificate(userId, lesson.courseId, lesson.course.lessons.length);
}

async function maybeIssueCertificate(userId: string, courseId: string, totalLessons: number) {
  const completedCount = await prisma.lessonProgress.count({
    where: { userId, lesson: { courseId } },
  });

  if (!isCourseFullyCompleted(totalLessons, completedCount)) return;

  const existing = await prisma.certificate.findUnique({ where: { userId_courseId: { userId, courseId } } });
  if (existing) return;

  for (let attempt = 0; attempt < 5; attempt += 1) {
    try {
      await prisma.certificate.create({
        data: { userId, courseId, code: generateCertificateCode() },
      });
      return;
    } catch {
      // colisão rara de código único; tenta novamente
    }
  }
}
