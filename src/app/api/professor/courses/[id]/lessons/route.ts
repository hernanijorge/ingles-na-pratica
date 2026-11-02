import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth/session";
import { lessonInput } from "@/lib/validation/lesson";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireRole("PROFESSOR", "ADMIN");
  } catch {
    return NextResponse.json({ error: "Acesso restrito." }, { status: 403 });
  }

  const { id: courseId } = await params;
  const body = await request.json().catch(() => null);
  const parsed = lessonInput.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Dados inválidos." }, { status: 400 });
  }

  const { vocabulary, phrases, exercises, videoUrl, ...rest } = parsed.data;

  const lesson = await prisma.lesson.create({
    data: {
      ...rest,
      videoUrl: videoUrl || null,
      courseId,
      vocabulary: { create: vocabulary.map((v, i) => ({ ...v, order: i })) },
      phrases: { create: phrases.map((p, i) => ({ ...p, order: i })) },
      exercises: { create: exercises.map((ex, i) => ({ ...ex, order: i })) },
    },
  });

  return NextResponse.json({ lesson }, { status: 201 });
}
