import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { hasLessonAccess } from "@/lib/business/access";
import { getViewerCourseAccess } from "@/lib/services/access";
import { Logo } from "@/components/Logo";
import { SpeakButton } from "@/components/SpeakButton";
import { Flashcards } from "@/components/Flashcards";
import { ExercisesPanel, type SubmissionView } from "@/components/ExercisesPanel";

export default async function LessonPage({
  params,
}: {
  params: Promise<{ slug: string; lessonSlug: string }>;
}) {
  const { slug, lessonSlug } = await params;

  const course = await prisma.course.findFirst({ where: { slug, published: true } });
  if (!course) notFound();

  const lesson = await prisma.lesson.findUnique({
    where: { courseId_slug: { courseId: course.id, slug: lessonSlug } },
    include: {
      vocabulary: { orderBy: { order: "asc" } },
      phrases: { orderBy: { order: "asc" } },
      exercises: { orderBy: { order: "asc" } },
    },
  });
  if (!lesson) notFound();

  const { session, isEnrolled } = await getViewerCourseAccess(course.id);
  const unlocked = hasLessonAccess({
    isFreePreview: lesson.isFreePreview,
    userRole: session?.role ?? null,
    isEnrolled,
  });

  const allLessons = await prisma.lesson.findMany({
    where: { courseId: course.id },
    orderBy: { order: "asc" },
    select: { id: true, slug: true, title: true },
  });

  if (!unlocked) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-brand-light px-4 text-center">
        <Logo />
        <p className="max-w-md text-brand-gray">
          Esta aula faz parte do curso <strong>{course.title}</strong>. Faça login e compre o curso para
          liberar o conteúdo completo.
        </p>
        <Link href={`/cursos/${slug}`} className="rounded-full bg-brand-blue px-6 py-3 font-semibold text-white">
          Ver curso
        </Link>
      </main>
    );
  }

  let submissionsByExercise: Record<string, SubmissionView> = {};
  let completed = false;
  if (session) {
    const submissions = await prisma.exerciseSubmission.findMany({
      where: { userId: session.sub, exercise: { lessonId: lesson.id } },
    });
    submissionsByExercise = Object.fromEntries(submissions.map((s) => [s.exerciseId, s]));

    const progress = await prisma.lessonProgress.findUnique({
      where: { userId_lessonId: { userId: session.sub, lessonId: lesson.id } },
    });
    completed = Boolean(progress);
  }

  const currentIndex = allLessons.findIndex((l) => l.id === lesson.id);
  const nextLesson = allLessons[currentIndex + 1];

  return (
    <main className="min-h-screen bg-white pb-16">
      <header className="flex items-center justify-between px-6 py-4 sm:px-10">
        <Link href={`/cursos/${slug}`}>
          <Logo className="text-lg" />
        </Link>
        {completed && (
          <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-700">
            Aula concluída ✅
          </span>
        )}
      </header>

      <section className="mx-auto max-w-2xl px-6 sm:px-10">
        <h1 className="font-heading text-2xl font-bold text-brand-dark">{lesson.title}</h1>

        {lesson.videoUrl && (
          <video controls className="mt-4 w-full rounded-xl" src={lesson.videoUrl}>
            <track kind="captions" />
          </video>
        )}

        {lesson.vocabulary.length > 0 && (
          <div className="mt-8">
            <h2 className="mb-3 font-heading text-lg font-semibold text-brand-dark">Vocabulário</h2>
            <ul className="space-y-2">
              {lesson.vocabulary.map((v) => (
                <li key={v.id} className="flex items-center justify-between rounded-lg bg-brand-light px-4 py-2">
                  <span>
                    <strong className="text-brand-dark">{v.en}</strong>{" "}
                    <span className="text-brand-gray">— {v.pt}</span>
                  </span>
                  <SpeakButton text={v.en} />
                </li>
              ))}
            </ul>
            <div className="mt-6">
              <h3 className="mb-3 text-center text-sm font-semibold text-brand-gray">Flashcards</h3>
              <Flashcards items={lesson.vocabulary.map((v) => ({ en: v.en, pt: v.pt }))} />
            </div>
          </div>
        )}

        {lesson.phrases.length > 0 && (
          <div className="mt-8">
            <h2 className="mb-3 font-heading text-lg font-semibold text-brand-dark">Frases úteis</h2>
            <ul className="space-y-2">
              {lesson.phrases.map((p) => (
                <li key={p.id} className="flex items-center justify-between rounded-lg bg-brand-light px-4 py-2">
                  <span>
                    <strong className="text-brand-dark">{p.en}</strong>{" "}
                    <span className="text-brand-gray">— {p.pt}</span>
                  </span>
                  <SpeakButton text={p.en} />
                </li>
              ))}
            </ul>
          </div>
        )}

        {lesson.exercises.length > 0 && (
          <div className="mt-8">
            <h2 className="mb-3 font-heading text-lg font-semibold text-brand-dark">Exercícios</h2>
            {session ? (
              <ExercisesPanel exercises={lesson.exercises} submissions={submissionsByExercise} />
            ) : (
              <p className="text-brand-gray">
                <Link href="/entrar" className="text-brand-blue-dark underline">
                  Entre na sua conta
                </Link>{" "}
                para fazer os exercícios desta aula.
              </p>
            )}
          </div>
        )}

        {nextLesson && (
          <div className="mt-10 text-right">
            <Link
              href={`/cursos/${slug}/aulas/${nextLesson.slug}`}
              className="inline-block rounded-full bg-brand-blue px-6 py-3 font-semibold text-white hover:bg-brand-blue-dark"
            >
              Próxima aula →
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}
