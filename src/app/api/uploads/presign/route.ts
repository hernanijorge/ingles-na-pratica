import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireSession } from "@/lib/auth/session";
import { buildObjectKey, createPresignedUploadUrl, MULTIPART_THRESHOLD_BYTES } from "@/lib/storage";

const schema = z.object({
  folder: z.enum(["audio-exercicios", "videos-aulas", "avatares"]),
  fileName: z.string().min(1),
  contentType: z.string().min(1),
  sizeBytes: z.number().int().positive(),
});

/** Gera URL assinada para upload direto (arquivos até 100MB). Acima disso, usar /api/uploads/multipart. */
export async function POST(request: NextRequest) {
  try {
    await requireSession();
  } catch {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Dados inválidos." }, { status: 400 });
  }

  const { folder, fileName, contentType, sizeBytes } = parsed.data;
  if (sizeBytes > MULTIPART_THRESHOLD_BYTES) {
    return NextResponse.json(
      { error: "Arquivo acima de 100MB: use o upload multipart em /api/uploads/multipart/iniciar." },
      { status: 400 },
    );
  }

  const key = buildObjectKey(folder, fileName);
  const result = await createPresignedUploadUrl(key, contentType);
  return NextResponse.json(result);
}
