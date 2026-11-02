import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth/session";

const schema = z.object({ priceCents: z.number().int().positive() });

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireRole("ADMIN");
  } catch {
    return NextResponse.json({ error: "Acesso restrito." }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Preço inválido." }, { status: 400 });
  }

  const product = await prisma.product.update({ where: { id }, data: { priceCents: parsed.data.priceCents } });
  return NextResponse.json({ product });
}
