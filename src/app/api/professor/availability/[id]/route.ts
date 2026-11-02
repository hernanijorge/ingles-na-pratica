import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth/session";

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  let session;
  try {
    session = await requireRole("PROFESSOR", "ADMIN");
  } catch {
    return NextResponse.json({ error: "Acesso restrito." }, { status: 403 });
  }

  const { id } = await params;
  const slot = await prisma.availabilitySlot.findUnique({ where: { id } });
  if (!slot || slot.teacherId !== session.sub) {
    return NextResponse.json({ error: "Horário não encontrado." }, { status: 404 });
  }
  if (slot.isBooked) {
    return NextResponse.json({ error: "Não é possível remover um horário já agendado." }, { status: 400 });
  }

  await prisma.availabilitySlot.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
