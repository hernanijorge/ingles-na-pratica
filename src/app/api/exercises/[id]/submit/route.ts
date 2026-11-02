import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth/session";
import { gradeTextAnswer } from "@/lib/business/grading";
import { recomputeLessonCompletion } from "@/lib/services/progress";

const textSchema = z.object({ kind: z.literal("text"), textAnswer: z.string().min(1) });
const audioSchema = z.object({ kind: z.literal("audio"), audioUrl: z.string().url() });
const schema = z.discriminatedUnion("kind", [textSchema, audioSchema]);

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  let session;
  try {
    session = await requireSession();
  } catch {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const { id: exerciseId } = await params;
  const exercise = await prisma.exercise.findUnique({
    where: { id: exerciseId },
    include: { lesson: { include: { course: true } } },
  });
  if (!exercise) {
    return NextResponse.json({ error: "Exercício não encontrado." }, { status: 404 });
  }

  if (!exercise.lesson.isFreePreview) {
    const enrollment = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId: session.sub, courseId: exercise.lesson.courseId } },
    });
    if (!enrollment && session.role === "ALUNO") {
      return NextResponse.json({ error: "Você precisa comprar este curso para enviar exercícios." }, { status: 403 });
    }
  }

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Dados inválidos." }, { status: 400 });
  }

  let data: { textAnswer?: string; audioUrl?: string; status: "CORRECT" | "INCORRECT" | "AWAITING_FEEDBACK" };

  if (parsed.data.kind === "text") {
    if (exercise.type === "SPEAK") {
      return NextResponse.json({ error: "Este exercício exige áudio." }, { status: 400 });
    }
    const correct = exercise.answer ? gradeTextAnswer(parsed.data.textAnswer, exercise.answer) : false;
    data = { textAnswer: parsed.data.textAnswer, status: correct ? "CORRECT" : "INCORRECT" };
  } else {
    if (exercise.type !== "SPEAK") {
      return NextResponse.json({ error: "Este exercício exige resposta em texto." }, { status: 400 });
    }
    data = { audioUrl: parsed.data.audioUrl, status: "AWAITING_FEEDBACK" };
  }

  const submission = await prisma.exerciseSubmission.upsert({
    where: { exerciseId_userId: { exerciseId, userId: session.sub } },
    create: { exerciseId, userId: session.sub, ...data },
    update: { ...data, teacherFeedback: null, gradedById: null },
  });

  await recomputeLessonCompletion(session.sub, exercise.lessonId);

  return NextResponse.json({ submission });
}
