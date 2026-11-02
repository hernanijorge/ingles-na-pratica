import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth/password";
import { createSessionCookie } from "@/lib/auth/session";
import { registerSchema } from "@/lib/validation/auth";

const CONSENT_VERSION = "1.0";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Dados inválidos." }, { status: 400 });
  }

  const { name, email, password, whatsapp, consent } = parsed.data;
  if (!consent) {
    return NextResponse.json({ error: "É necessário aceitar os termos." }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "Este e-mail já está cadastrado." }, { status: 409 });
  }

  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      whatsapp: whatsapp || null,
      consentAt: new Date(),
      consentVersion: CONSENT_VERSION,
      role: "ALUNO",
    },
  });

  await createSessionCookie({ sub: user.id, role: user.role, name: user.name, email: user.email });

  return NextResponse.json({ id: user.id, name: user.name, email: user.email, role: user.role }, { status: 201 });
}
