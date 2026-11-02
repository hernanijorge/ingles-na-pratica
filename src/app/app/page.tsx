import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth/session";
import { computeStreak } from "@/lib/business/streak";

export default async function DashboardPage() {
  const session = await requireSession();

  const [enrollments, studyDays, certificates] = await Promise.all([
    prisma.enrollment.findMany({
      where: { userId: session.sub },
      include: { course: { include: { lessons: { orderBy: { order: "asc" } } } } },
    }),
    prisma.studyDay.findMany({ where: { userId: session.sub }, select: { date: true } }),
    prisma.certificate.count({ where: { userId: session.sub } }),
  ]);

  const progressPerCourse = await Promise.all(
    enrollments.map(async (enrollment) => {
      const completed = await prisma.lessonProgress.count({
        where: { userId: session.sub, lesson: { courseId: enrollment.courseId } },
      });
      const total = enrollment.course.lessons.length;
      const nextLesson = await findNextLesson(session.sub, enrollment.course.lessons);
      return { enrollment, completed, total, nextLesson };
    }),
  );

  const streak = computeStreak(studyDays.map((d) => d.date));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-2xl font-bold text-brand-dark">Olá, {session.name.split(" ")[0]}!</h1>
        <p className="text-brand-gray">Continue de onde parou.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <p className="text-sm text-brand-gray">Sequência de dias estudando</p>
          <p className="mt-1 font-heading text-3xl font-bold text-brand-blue-dark">{streak} 🔥</p>
        </div>
        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <p className="text-sm text-brand-gray">Cursos em andamento</p>
          <p className="mt-1 font-heading text-3xl font-bold text-brand-blue-dark">{enrollments.length}</p>
        </div>
        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <p className="text-sm text-brand-gray">Certificados conquistados</p>
          <p className="mt-1 font-heading text-3xl font-bold text-brand-blue-dark">{certificates}</p>
        </div>
      </div>

      <div>
        <h2 className="mb-3 font-heading text-lg font-semibold text-brand-dark">Meus cursos</h2>
        {progressPerCourse.length === 0 ? (
          <p className="text-brand-gray">
            Você ainda não comprou nenhum curso.{" "}
            <Link href="/" className="text-brand-blue-dark underline">
              Conheça os cursos
            </Link>
            .
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {progressPerCourse.map(({ enrollment, completed, total, nextLesson }) => (
              <div key={enrollment.id} className="rounded-2xl bg-white p-5 shadow-sm">
                <p className="font-heading font-semibold text-brand-dark">{enrollment.course.title}</p>
                <div className="mt-2 h-2 w-full rounded-full bg-gray-100">
                  <div
                    className="h-2 rounded-full bg-brand-blue"
                    style={{ width: `${total ? Math.round((completed / total) * 100) : 0}%` }}
                  />
                </div>
                <p className="mt-1 text-sm text-brand-gray">
                  {completed}/{total} aulas concluídas
                </p>
                {nextLesson && (
                  <Link
                    href={`/cursos/${enrollment.course.slug}/aulas/${nextLesson.slug}`}
                    className="mt-3 inline-block rounded-full bg-brand-blue px-4 py-2 text-sm font-semibold text-white hover:bg-brand-blue-dark"
                  >
                    Continuar estudando
                  </Link>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

async function findNextLesson(
  userId: string,
  lessons: { id: string; slug: string; order: number }[],
) {
  const completedIds = new Set(
    (
      await prisma.lessonProgress.findMany({
        where: { userId, lessonId: { in: lessons.map((l) => l.id) } },
        select: { lessonId: true },
      })
    ).map((p) => p.lessonId),
  );
  return lessons.find((l) => !completedIds.has(l.id)) ?? lessons[lessons.length - 1];
}
