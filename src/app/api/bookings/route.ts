import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth/session";
import { debitClassCredit, InsufficientCreditsError } from "@/lib/business/credits";

const schema = z.object({ slotId: z.string().min(1) });

/** Agenda uma aula particular debitando 1 crédito disponível (compra avulsa ou pacote de 4). */
export async function POST(request: NextRequest) {
  let session;
  try {
    session = await requireSession();
  } catch {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
  }

  try {
    const booking = await prisma.$transaction(async (tx) => {
      const slot = await tx.availabilitySlot.findUnique({ where: { id: parsed.data.slotId } });
      if (!slot || slot.isBooked) {
        throw new Error("SLOT_INDISPONIVEL");
      }

      const credit = await tx.classCredit.findFirst({
        where: { userId: session!.sub, remainingCredits: { gt: 0 } },
        orderBy: { createdAt: "asc" },
      });
      if (!credit) {
        throw new Error("SEM_CREDITO");
      }

      const newBalance = debitClassCredit(credit);

      await tx.classCredit.update({ where: { id: credit.id }, data: { remainingCredits: newBalance } });
      await tx.availabilitySlot.update({ where: { id: slot.id }, data: { isBooked: true } });

      return tx.booking.create({
        data: {
          slotId: slot.id,
          studentId: session!.sub,
          teacherId: slot.teacherId,
          meetingLink: slot.meetingLink,
          classCreditId: credit.id,
        },
      });
    });

    return NextResponse.json({ booking }, { status: 201 });
  } catch (err) {
    if (err instanceof InsufficientCreditsError || (err as Error).message === "SEM_CREDITO") {
      return NextResponse.json(
        { error: "Você não tem créditos de aula disponíveis. Compre uma aula avulsa ou um pacote." },
        { status: 402 },
      );
    }
    if ((err as Error).message === "SLOT_INDISPONIVEL") {
      return NextResponse.json({ error: "Este horário já foi reservado por outra pessoa." }, { status: 409 });
    }
    throw err;
  }
}

export async function GET() {
  let session;
  try {
    session = await requireSession();
  } catch {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const bookings = await prisma.booking.findMany({
    where: { studentId: session.sub },
    include: { slot: true, teacher: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ bookings });
}
