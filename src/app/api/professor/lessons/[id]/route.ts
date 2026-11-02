import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth/session";
import { lessonInput } from "@/lib/validation/lesson";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireRole("PROFESSOR", "ADMIN");
  } catch {
    return NextResponse.json({ error: "Acesso restrito." }, { status: 403 });
  }
  const { id } = await params;
  const lesson = await prisma.lesson.findUnique({
    where: { id },
    include: {
      vocabulary: { orderBy: { order: "asc" } },
      phrases: { orderBy: { order: "asc" } },
      exercises: { orderBy: { order: "asc" } },
    },
  });
  if (!lesson) return NextResponse.json({ error: "Aula não encontrada." }, { status: 404 });
  return NextResponse.json({ lesson });
}

/** Atualiza a aula e substitui por completo vocabulário/frases/exercícios (edição via formulário único). */
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireRole("PROFESSOR", "ADMIN");
  } catch {
    return NextResponse.json({ error: "Acesso restrito." }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = lessonInput.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Dados inválidos." }, { status: 400 });
  }

  const { vocabulary, phrases, exercises, videoUrl, ...rest } = parsed.data;

  const lesson = await prisma.$transaction(async (tx) => {
    await tx.vocabularyItem.deleteMany({ where: { lessonId: id } });
    await tx.phrase.deleteMany({ where: { lessonId: id } });
    await tx.exercise.deleteMany({ where: { lessonId: id } });

    return tx.lesson.update({
      where: { id },
      data: {
        ...rest,
        videoUrl: videoUrl || null,
        vocabulary: { create: vocabulary.map((v, i) => ({ ...v, order: i })) },
        phrases: { create: phrases.map((p, i) => ({ ...p, order: i })) },
        exercises: { create: exercises.map((ex, i) => ({ ...ex, order: i })) },
      },
    });
  });

  return NextResponse.json({ lesson });
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireRole("PROFESSOR", "ADMIN");
  } catch {
    return NextResponse.json({ error: "Acesso restrito." }, { status: 403 });
  }
  const { id } = await params;
  await prisma.lesson.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
