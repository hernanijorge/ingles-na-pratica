import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth/session";
import { refundClassCredit } from "@/lib/business/credits";

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  let session;
  try {
    session = await requireSession();
  } catch {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const { id } = await params;
  const booking = await prisma.booking.findUnique({ where: { id } });
  if (!booking || booking.studentId !== session.sub) {
    return NextResponse.json({ error: "Agendamento não encontrado." }, { status: 404 });
  }
  if (booking.status !== "SCHEDULED") {
    return NextResponse.json({ error: "Este agendamento não pode mais ser cancelado." }, { status: 400 });
  }

  await prisma.$transaction(async (tx) => {
    await tx.booking.update({ where: { id }, data: { status: "CANCELLED" } });
    await tx.availabilitySlot.update({ where: { id: booking.slotId }, data: { isBooked: false } });

    if (booking.classCreditId) {
      const credit = await tx.classCredit.findUnique({ where: { id: booking.classCreditId } });
      if (credit) {
        const refunded = refundClassCredit(credit, credit.totalCredits);
        await tx.classCredit.update({ where: { id: credit.id }, data: { remainingCredits: refunded } });
      }
    }
  });

  return NextResponse.json({ ok: true });
}
