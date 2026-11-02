import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Logo } from "@/components/Logo";
import { WhatsAppButton } from "@/components/WhatsAppButton";

function formatBRL(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default async function LandingPage() {
  const [courses, products, testimonials] = await Promise.all([
    prisma.course.findMany({
      where: { published: true },
      include: { lessons: { select: { id: true } } },
      orderBy: { order: "asc" },
    }),
    prisma.product.findMany(),
    prisma.testimonial.findMany({
      where: { approved: true },
      include: { user: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
      take: 6,
    }),
  ]);

  const priceByKey = new Map(products.map((p) => [p.key, p.priceCents]));

  return (
    <main className="min-h-screen bg-white">
      <header className="flex items-center justify-between px-6 py-4 sm:px-10">
        <Logo className="text-lg" />
        <nav className="flex items-center gap-3 text-sm font-medium">
          <Link href="/isca" className="hidden text-brand-gray hover:text-brand-blue-dark sm:inline">
            PDF grátis
          </Link>
          <Link href="/entrar" className="text-brand-gray hover:text-brand-blue-dark">
            Entrar
          </Link>
          <Link
            href="/cadastro"
            className="rounded-full bg-brand-blue px-4 py-2 text-white transition hover:bg-brand-blue-dark"
          >
            Criar conta
          </Link>
        </nav>
      </header>

      <section className="px-6 py-14 text-center sm:px-10 sm:py-20">
        <p className="mx-auto mb-3 inline-block rounded-full bg-brand-light px-4 py-1 text-sm font-medium text-brand-blue-dark">
          @inglesnapraticausa
        </p>
        <h1 className="mx-auto max-w-2xl font-heading text-3xl font-bold text-brand-dark sm:text-5xl">
          Inglês simples e prático para o dia a dia
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-brand-gray sm:text-lg">
          Aulas práticas para brasileiros no Brasil e nos EUA. Vocabulário, frases úteis e
          exercícios que você usa de verdade — no trabalho, no mercado, na vida.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/cadastro"
            className="rounded-full bg-brand-blue px-6 py-3 font-semibold text-white shadow-sm transition hover:bg-brand-blue-dark"
          >
            Começar agora — primeira aula grátis
          </Link>
          <Link
            href="/isca"
            className="rounded-full border border-brand-blue px-6 py-3 font-semibold text-brand-blue-dark transition hover:bg-brand-light"
          >
            Baixar PDF grátis
          </Link>
        </div>
      </section>

      <section className="bg-brand-light px-6 py-14 sm:px-10">
        <h2 className="text-center font-heading text-2xl font-semibold text-brand-dark">Nossos cursos</h2>
        <div className="mx-auto mt-8 grid max-w-4xl gap-6 sm:grid-cols-2">
          {courses.map((course) => (
            <div key={course.id} className="rounded-2xl bg-white p-6 shadow-sm">
              <h3 className="font-heading text-lg font-semibold text-brand-dark">{course.title}</h3>
              <p className="mt-2 text-sm text-brand-gray">{course.description}</p>
              <p className="mt-3 text-sm text-brand-gray">{course.lessons.length} aulas · {course.level}</p>
              <div className="mt-4 flex items-center justify-between">
                <span className="font-heading text-xl font-bold text-brand-blue-dark">
                  {formatBRL(priceByKey.get(course.productKey) ?? 9700)}
                </span>
                <Link
                  href={`/cursos/${course.slug}`}
                  className="rounded-full bg-brand-blue px-4 py-2 text-sm font-semibold text-white hover:bg-brand-blue-dark"
                >
                  Ver curso
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="px-6 py-14 sm:px-10">
        <h2 className="text-center font-heading text-2xl font-semibold text-brand-dark">
          Aulas particulares com professor
        </h2>
        <div className="mx-auto mt-8 grid max-w-3xl gap-6 sm:grid-cols-2">
          <div className="rounded-2xl border border-gray-100 p-6 text-center shadow-sm">
            <p className="font-heading text-lg font-semibold text-brand-dark">Aula avulsa</p>
            <p className="mt-2 font-heading text-2xl font-bold text-brand-blue-dark">
              {formatBRL(priceByKey.get("SINGLE_CLASS") ?? 6000)}
            </p>
          </div>
          <div className="rounded-2xl border border-gray-100 p-6 text-center shadow-sm">
            <p className="font-heading text-lg font-semibold text-brand-dark">Pacote de 4 aulas</p>
            <p className="mt-2 font-heading text-2xl font-bold text-brand-blue-dark">
              {formatBRL(priceByKey.get("PACKAGE_4") ?? 20000)}
            </p>
          </div>
        </div>
      </section>

      {testimonials.length > 0 && (
        <section className="bg-brand-light px-6 py-14 sm:px-10">
          <h2 className="text-center font-heading text-2xl font-semibold text-brand-dark">
            Quem estuda com a gente
          </h2>
          <div className="mx-auto mt-8 grid max-w-4xl gap-6 sm:grid-cols-3">
            {testimonials.map((t) => (
              <div key={t.id} className="rounded-2xl bg-white p-5 shadow-sm">
                <p className="text-sm text-brand-gray">&ldquo;{t.content}&rdquo;</p>
                <p className="mt-3 text-sm font-semibold text-brand-dark">{t.user.name}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      <footer className="px-6 py-10 text-center text-sm text-brand-gray sm:px-10">
        <Logo className="mx-auto mb-3 justify-center text-base" />
        <p>Inglês simples e prático para o dia a dia.</p>
      </footer>

      <WhatsAppButton />
    </main>
  );
}
