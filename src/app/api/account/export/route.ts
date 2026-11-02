import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth/session";

export async function GET() {
  let session;
  try {
    session = await requireSession();
  } catch {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.sub },
    include: {
      enrollments: { include: { course: { select: { title: true } } } },
      purchases: { include: { product: true } },
      lessonProgress: { include: { lesson: { select: { title: true } } } },
      certificates: { include: { course: { select: { title: true } } } },
      testimonials: true,
      creditBalances: true,
      bookingsAsStudent: true,
    },
  });

  if (!user) {
    return NextResponse.json({ error: "Usuário não encontrado." }, { status: 404 });
  }

  const { passwordHash, ...safeUser } = user;
  void passwordHash;

  return new NextResponse(JSON.stringify({ exportadoEm: new Date().toISOString(), usuario: safeUser }, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": "attachment; filename=meus-dados.json",
    },
  });
}
