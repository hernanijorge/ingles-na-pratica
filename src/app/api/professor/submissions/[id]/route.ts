import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth/session";

const schema = z.object({ teacherFeedback: z.string().trim().min(1) });

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  let session;
  try {
    session = await requireRole("PROFESSOR", "ADMIN");
  } catch {
    return NextResponse.json({ error: "Acesso restrito." }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Informe um feedback." }, { status: 400 });
  }

  const submission = await prisma.exerciseSubmission.update({
    where: { id },
    data: { teacherFeedback: parsed.data.teacherFeedback, status: "REVIEWED", gradedById: session.sub },
  });

  return NextResponse.json({ submission });
}
