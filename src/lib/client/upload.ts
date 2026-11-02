const MULTIPART_THRESHOLD_BYTES = 100 * 1024 * 1024;

/** Faz upload de um arquivo para o S3/MinIO, usando multipart automaticamente se > 100MB. */
export async function uploadVideoFile(file: File, onProgress?: (pct: number) => void): Promise<string> {
  if (file.size <= MULTIPART_THRESHOLD_BYTES) {
    const presignRes = await fetch("/api/uploads/presign", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        folder: "videos-aulas",
        fileName: file.name,
        contentType: file.type || "video/mp4",
        sizeBytes: file.size,
      }),
    });
    const presignData = await presignRes.json();
    if (!presignRes.ok) throw new Error(presignData.error ?? "Falha ao preparar upload.");

    await fetch(presignData.url, { method: "PUT", headers: { "Content-Type": file.type || "video/mp4" }, body: file });
    onProgress?.(100);
    return presignData.publicUrl as string;
  }

  const initRes = await fetch("/api/uploads/multipart/iniciar", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fileName: file.name, contentType: file.type || "video/mp4", sizeBytes: file.size }),
  });
  const initData = await initRes.json();
  if (!initRes.ok) throw new Error(initData.error ?? "Falha ao iniciar upload multipart.");

  const { key, uploadId, partSizeBytes, parts } = initData as {
    key: string;
    uploadId: string;
    partSizeBytes: number;
    parts: { partNumber: number; url: string }[];
  };

  const completedParts: { partNumber: number; eTag: string }[] = [];
  for (const part of parts) {
    const start = (part.partNumber - 1) * partSizeBytes;
    const end = Math.min(start + partSizeBytes, file.size);
    const blobPart = file.slice(start, end);
    const putRes = await fetch(part.url, { method: "PUT", body: blobPart });
    const eTag = putRes.headers.get("ETag") ?? putRes.headers.get("etag");
    if (!eTag) throw new Error("Falha ao enviar parte do vídeo.");
    completedParts.push({ partNumber: part.partNumber, eTag });
    onProgress?.(Math.round((completedParts.length / parts.length) * 100));
  }

  const completeRes = await fetch("/api/uploads/multipart/concluir", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ key, uploadId, parts: completedParts }),
  });
  const completeData = await completeRes.json();
  if (!completeRes.ok) throw new Error(completeData.error ?? "Falha ao concluir upload.");
  return completeData.publicUrl as string;
}
