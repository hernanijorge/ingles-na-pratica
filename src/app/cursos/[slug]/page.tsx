import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { hasLessonAccess } from "@/lib/business/access";
import { getViewerCourseAccess } from "@/lib/services/access";
import { Logo } from "@/components/Logo";
import { BuyCourseButton } from "@/components/BuyCourseButton";

export default async function CourseLandingPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const course = await prisma.course.findFirst({
    where: { slug, published: true },
    include: { lessons: { orderBy: { order: "asc" } } },
  });
  if (!course) notFound();

  const { session, isEnrolled } = await getViewerCourseAccess(course.id);
  const product = await prisma.product.findUnique({ where: { key: course.productKey } });

  return (
    <main className="min-h-screen bg-white">
      <header className="flex items-center justify-between px-6 py-4 sm:px-10">
        <Link href="/">
          <Logo className="text-lg" />
        </Link>
        {!session && (
          <Link href="/entrar" className="text-sm font-medium text-brand-gray hover:text-brand-blue-dark">
            Entrar
          </Link>
        )}
      </header>

      <section className="px-6 py-10 sm:px-10">
        <h1 className="font-heading text-3xl font-bold text-brand-dark">{course.title}</h1>
        <p className="mt-2 max-w-2xl text-brand-gray">{course.description}</p>
        <p className="mt-1 text-sm text-brand-gray">
          {course.level} · {course.lessons.length} aulas
        </p>

        {!isEnrolled && product && (
          <div className="mt-6">
            <BuyCourseButton productKey={course.productKey} priceCents={product.priceCents} loggedIn={Boolean(session)} />
          </div>
        )}

        <ol className="mt-8 max-w-2xl space-y-3">
          {course.lessons.map((lesson, index) => {
            const unlocked = hasLessonAccess({
              isFreePreview: lesson.isFreePreview,
              userRole: session?.role ?? null,
              isEnrolled,
            });
            return (
              <li
                key={lesson.id}
                className="flex items-center justify-between rounded-xl border border-gray-100 px-4 py-3"
              >
                <div>
                  <p className="text-sm text-brand-gray">Aula {index + 1}</p>
                  <p className="font-medium text-brand-dark">{lesson.title}</p>
                </div>
                {unlocked ? (
                  <Link
                    href={`/cursos/${course.slug}/aulas/${lesson.slug}`}
                    className="rounded-full bg-brand-blue px-4 py-2 text-sm font-semibold text-white hover:bg-brand-blue-dark"
                  >
                    {lesson.isFreePreview ? "Aula grátis" : "Assistir"}
                  </Link>
                ) : (
                  <span className="rounded-full bg-gray-100 px-4 py-2 text-sm text-brand-gray">🔒 Bloqueada</span>
                )}
              </li>
            );
          })}
        </ol>
      </section>
    </main>
  );
}
