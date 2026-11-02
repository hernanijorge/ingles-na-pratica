import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth/session";

/** Horários futuros livres de qualquer professor, para o aluno escolher ao agendar. */
export async function GET() {
  try {
    await requireSession();
  } catch {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const slots = await prisma.availabilitySlot.findMany({
    where: { isBooked: false, startsAt: { gt: new Date() } },
    include: { teacher: { select: { id: true, name: true } } },
    orderBy: { startsAt: "asc" },
  });

  return NextResponse.json({ slots });
}
