import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth/session";
import { courseInput } from "@/lib/validation/lesson";

export async function GET() {
  try {
    await requireRole("PROFESSOR", "ADMIN");
  } catch {
    return NextResponse.json({ error: "Acesso restrito." }, { status: 403 });
  }
  const courses = await prisma.course.findMany({
    include: { lessons: { select: { id: true } } },
    orderBy: { order: "asc" },
  });
  return NextResponse.json({ courses });
}

export async function POST(request: NextRequest) {
  let session;
  try {
    session = await requireRole("PROFESSOR", "ADMIN");
  } catch {
    return NextResponse.json({ error: "Acesso restrito." }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const parsed = courseInput.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Dados inválidos." }, { status: 400 });
  }

  const course = await prisma.course.create({
    data: { ...parsed.data, teacherId: session.sub },
  });

  return NextResponse.json({ course }, { status: 201 });
}
