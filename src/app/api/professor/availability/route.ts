import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth/session";

const schema = z.object({
  startsAt: z.string().datetime(),
  durationMinutes: z.number().int().positive().default(50),
  meetingLink: z.string().url().optional().or(z.literal("")),
});

export async function GET() {
  let session;
  try {
    session = await requireRole("PROFESSOR", "ADMIN");
  } catch {
    return NextResponse.json({ error: "Acesso restrito." }, { status: 403 });
  }

  const slots = await prisma.availabilitySlot.findMany({
    where: { teacherId: session.sub },
    include: { booking: { include: { student: { select: { name: true, email: true } } } } },
    orderBy: { startsAt: "asc" },
  });
  return NextResponse.json({ slots });
}

export async function POST(request: NextRequest) {
  let session;
  try {
    session = await requireRole("PROFESSOR", "ADMIN");
  } catch {
    return NextResponse.json({ error: "Acesso restrito." }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Dados inválidos." }, { status: 400 });
  }

  const startsAt = new Date(parsed.data.startsAt);
  const endsAt = new Date(startsAt.getTime() + parsed.data.durationMinutes * 60_000);

  const slot = await prisma.availabilitySlot.create({
    data: { teacherId: session.sub, startsAt, endsAt, meetingLink: parsed.data.meetingLink || null },
  });

  return NextResponse.json({ slot }, { status: 201 });
}
