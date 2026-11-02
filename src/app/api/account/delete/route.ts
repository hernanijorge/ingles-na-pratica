import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";
import { clearSessionCookie, requireSession } from "@/lib/auth/session";

/** Exclusão de conta (LGPD): anonimiza dados pessoais, mantém histórico de compras para fins fiscais. */
export async function POST() {
  let session;
  try {
    session = await requireSession();
  } catch {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const anonId = randomUUID();
  await prisma.user.update({
    where: { id: session.sub },
    data: {
      name: "Conta excluída",
      email: `excluido-${anonId}@descomplica.invalid`,
      whatsapp: null,
      passwordHash: randomUUID(),
      deletedAt: new Date(),
    },
  });

  await clearSessionCookie();
  return NextResponse.json({ ok: true });
}
