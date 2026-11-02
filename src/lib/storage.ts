import "server-only";
import {
  CompleteMultipartUploadCommand,
  CreateMultipartUploadCommand,
  PutObjectCommand,
  S3Client,
  UploadPartCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "crypto";

export const MULTIPART_THRESHOLD_BYTES = 100 * 1024 * 1024; // 100MB
const PRESIGN_EXPIRY_SECONDS = 60 * 15;

function getClient() {
  const endpoint = process.env.S3_ENDPOINT;
  const region = process.env.S3_REGION ?? "us-east-1";
  const accessKeyId = process.env.S3_ACCESS_KEY_ID;
  const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY;
  if (!endpoint || !accessKeyId || !secretAccessKey) {
    throw new Error("Configuração do S3/MinIO ausente (S3_ENDPOINT/S3_ACCESS_KEY_ID/S3_SECRET_ACCESS_KEY).");
  }
  return new S3Client({
    endpoint,
    region,
    credentials: { accessKeyId, secretAccessKey },
    forcePathStyle: true,
  });
}

function getBucket() {
  const bucket = process.env.S3_BUCKET;
  if (!bucket) throw new Error("S3_BUCKET não está definido.");
  return bucket;
}

export function buildObjectKey(folder: string, originalName: string) {
  const ext = originalName.includes(".") ? originalName.split(".").pop() : undefined;
  const id = randomUUID();
  return ext ? `${folder}/${id}.${ext}` : `${folder}/${id}`;
}

/** URL assinada para upload direto (PUT) de arquivos até 100MB (ex: áudio de exercícios). */
export async function createPresignedUploadUrl(key: string, contentType: string) {
  const client = getClient();
  const command = new PutObjectCommand({ Bucket: getBucket(), Key: key, ContentType: contentType });
  const url = await getSignedUrl(client, command, { expiresIn: PRESIGN_EXPIRY_SECONDS });
  return { url, key, publicUrl: buildPublicUrl(key) };
}

export function buildPublicUrl(key: string) {
  const publicBase = process.env.S3_PUBLIC_URL;
  if (!publicBase) throw new Error("S3_PUBLIC_URL não está definido.");
  return `${publicBase.replace(/\/$/, "")}/${key}`;
}

/** Inicia um upload multipart (usado para vídeos de aula acima de 100MB). */
export async function initiateMultipartUpload(key: string, contentType: string) {
  const client = getClient();
  const result = await client.send(
    new CreateMultipartUploadCommand({ Bucket: getBucket(), Key: key, ContentType: contentType }),
  );
  if (!result.UploadId) throw new Error("Falha ao iniciar upload multipart.");
  return { uploadId: result.UploadId, key };
}

/** Gera URLs assinadas para cada parte do upload multipart (partes de 10MB, PUT direto do navegador). */
export async function presignMultipartParts(key: string, uploadId: string, partCount: number) {
  const client = getClient();
  const urls: { partNumber: number; url: string }[] = [];
  for (let partNumber = 1; partNumber <= partCount; partNumber += 1) {
    const command = new UploadPartCommand({
      Bucket: getBucket(),
      Key: key,
      UploadId: uploadId,
      PartNumber: partNumber,
    });
    const url = await getSignedUrl(client, command, { expiresIn: PRESIGN_EXPIRY_SECONDS });
    urls.push({ partNumber, url });
  }
  return urls;
}

export async function completeMultipartUpload(
  key: string,
  uploadId: string,
  parts: { partNumber: number; eTag: string }[],
) {
  const client = getClient();
  await client.send(
    new CompleteMultipartUploadCommand({
      Bucket: getBucket(),
      Key: key,
      UploadId: uploadId,
      MultipartUpload: {
        Parts: parts
          .sort((a, b) => a.partNumber - b.partNumber)
          .map((p) => ({ PartNumber: p.partNumber, ETag: p.eTag })),
      },
    }),
  );
  return { key, publicUrl: buildPublicUrl(key) };
}
