import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth/session";

export default async function CertificatesPage() {
  const session = await requireSession();
  const certificates = await prisma.certificate.findMany({
    where: { userId: session.sub },
    include: { course: { select: { title: true } } },
    orderBy: { issuedAt: "desc" },
  });

  return (
    <div>
      <h1 className="mb-4 font-heading text-2xl font-bold text-brand-dark">Meus certificados</h1>
      {certificates.length === 0 ? (
        <p className="text-brand-gray">
          Conclua todas as aulas de um curso para ganhar seu certificado.
        </p>
      ) : (
        <ul className="space-y-3">
          {certificates.map((cert) => (
            <li key={cert.id} className="flex items-center justify-between rounded-xl bg-white p-4 shadow-sm">
              <div>
                <p className="font-medium text-brand-dark">{cert.course.title}</p>
                <p className="text-sm text-brand-gray">Código: {cert.code}</p>
              </div>
              <Link
                href={`/certificado/${cert.code}`}
                target="_blank"
                className="rounded-full bg-brand-blue px-4 py-2 text-sm font-semibold text-white hover:bg-brand-blue-dark"
              >
                Ver certificado
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
