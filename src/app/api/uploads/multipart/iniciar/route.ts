import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireRole } from "@/lib/auth/session";
import { buildObjectKey, initiateMultipartUpload, presignMultipartParts } from "@/lib/storage";

const PART_SIZE_BYTES = 10 * 1024 * 1024; // 10MB por parte

const schema = z.object({
  fileName: z.string().min(1),
  contentType: z.string().min(1),
  sizeBytes: z.number().int().positive(),
});

/** Inicia upload multipart (vídeos de aula acima de 100MB). Somente professor/admin. */
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

  const { fileName, contentType, sizeBytes } = parsed.data;
  const key = buildObjectKey("videos-aulas", fileName);
  const { uploadId } = await initiateMultipartUpload(key, contentType);
  const partCount = Math.ceil(sizeBytes / PART_SIZE_BYTES);
  const parts = await presignMultipartParts(key, uploadId, partCount);

  return NextResponse.json({ key, uploadId, partSizeBytes: PART_SIZE_BYTES, parts });
}
