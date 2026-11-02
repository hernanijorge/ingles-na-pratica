import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth/session";

/** Fila de áudios enviados pelos alunos (exercícios "fale") aguardando correção do professor. */
export async function GET() {
  try {
    await requireRole("PROFESSOR", "ADMIN");
  } catch {
    return NextResponse.json({ error: "Acesso restrito." }, { status: 403 });
  }

  const submissions = await prisma.exerciseSubmission.findMany({
    where: { exercise: { type: "SPEAK" } },
    include: {
      user: { select: { name: true, email: true } },
      exercise: { include: { lesson: { include: { course: { select: { title: true } } } } } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ submissions });
}
