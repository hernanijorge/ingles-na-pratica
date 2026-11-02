import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Logo } from "@/components/Logo";

export default async function PublicCertificatePage({ params }: { params: Promise<{ codigo: string }> }) {
  const { codigo } = await params;
  const certificate = await prisma.certificate.findUnique({
    where: { code: codigo },
    include: { user: { select: { name: true } }, course: { select: { title: true } } },
  });
  if (!certificate) notFound();

  const issuedDate = certificate.issuedAt.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-brand-light px-4 py-10">
      <Link href="/" className="mb-8">
        <Logo className="text-xl" />
      </Link>
      <div className="w-full max-w-xl rounded-2xl border-4 border-brand-blue bg-white p-10 text-center shadow-sm">
        <p className="text-sm uppercase tracking-wide text-brand-gray">Certificado de conclusão</p>
        <h1 className="mt-4 font-heading text-2xl font-bold text-brand-dark">{certificate.user.name}</h1>
        <p className="mt-2 text-brand-gray">concluiu com sucesso o curso</p>
        <p className="mt-1 font-heading text-xl font-semibold text-brand-blue-dark">{certificate.course.title}</p>
        <p className="mt-4 text-sm text-brand-gray">Emitido em {issuedDate}</p>
        <p className="mt-6 text-xs text-brand-gray">Código de validação: {certificate.code}</p>
      </div>
    </main>
  );
}
