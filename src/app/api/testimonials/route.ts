import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth/session";

const schema = z.object({
  content: z.string().trim().min(10, "Conte um pouco mais sobre sua experiência."),
  rating: z.number().int().min(1).max(5).default(5),
});

export async function GET() {
  const testimonials = await prisma.testimonial.findMany({
    where: { approved: true },
    include: { user: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
    take: 12,
  });
  return NextResponse.json({ testimonials });
}

export async function POST(request: NextRequest) {
  let session;
  try {
    session = await requireSession();
  } catch {
    return NextResponse.json({ error: "É necessário entrar para enviar um depoimento." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Dados inválidos." }, { status: 400 });
  }

  const testimonial = await prisma.testimonial.create({
    data: { userId: session.sub, content: parsed.data.content, rating: parsed.data.rating },
  });

  return NextResponse.json({ testimonial }, { status: 201 });
}
