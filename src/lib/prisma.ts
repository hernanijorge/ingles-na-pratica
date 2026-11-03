import { PrismaClient } from "@/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL não está definida.");
  }
  const adapter = new PrismaPg({ connectionString });
  return new PrismaClient({ adapter });
}

// Instanciação lazy: criar o client só no primeiro uso real, não na
// importação do módulo -- o `next build` importa toda rota (inclusive as
// que nunca rodam, como /api/account/delete) pra coletar dados de página,
// e isso não deve exigir DATABASE_URL em build-time.
function getPrisma(): PrismaClient {
  if (globalThis.__prisma) return globalThis.__prisma;
  const client = createPrismaClient();
  if (process.env.NODE_ENV !== "production") {
    globalThis.__prisma = client;
  }
  return client;
}

export const prisma: PrismaClient = new Proxy({} as PrismaClient, {
  get(_target, prop, receiver) {
    return Reflect.get(getPrisma() as object, prop, receiver);
  },
});
