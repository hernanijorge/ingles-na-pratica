import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { leadSchema } from "@/lib/validation/lead";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = leadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Dados inválidos." }, { status: 400 });
  }

  await prisma.lead.create({ data: parsed.data });

  return NextResponse.json({ ok: true, pdfUrl: "/materiais/ingles-simples-dia-a-dia.pdf" }, { status: 201 });
}
