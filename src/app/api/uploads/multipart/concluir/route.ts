import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireRole } from "@/lib/auth/session";
import { completeMultipartUpload } from "@/lib/storage";

const schema = z.object({
  key: z.string().min(1),
  uploadId: z.string().min(1),
  parts: z.array(z.object({ partNumber: z.number().int().positive(), eTag: z.string().min(1) })).min(1),
});

export async function POST(request: NextRequest) {
  try {
    await requireRole("PROFESSOR", "ADMIN");
  } catch {
    return NextResponse.json({ error: "Acesso restrito." }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Dados inválidos." }, { status: 400 });
  }

  const { key, uploadId, parts } = parsed.data;
  const result = await completeMultipartUpload(key, uploadId, parts);
  return NextResponse.json(result);
}
