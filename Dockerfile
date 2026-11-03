# syntax=docker/dockerfile:1

FROM node:20-slim AS deps
WORKDIR /app
COPY package.json package-lock.json ./
COPY prisma ./prisma
RUN npm ci

FROM node:20-slim AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npx prisma generate
RUN npm run build

FROM node:20-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000

# OpenSSL/CA certs são exigidos pelo motor do Prisma CLI ("prisma migrate deploy"),
# mesmo usando engineType "client" (que remove o binário do Prisma Client em si).
RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/* \
  && npm install -g prisma@6.19.3

# Build standalone do Next.js: server.js + node_modules já rastreados + assets estáticos.
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Client gerado pelo Prisma (engineType "client" + @prisma/adapter-pg) e migrations,
# copiados explicitamente para a imagem final junto com o schema. O generator usa
# output = "../src/generated/prisma" (não o node_modules/.prisma padrão), e é lá que
# fica o query_compiler_bg.wasm do engineType "client" -- sem isso o runtime quebra
# com ENOENT ao tentar abrir o wasm.
COPY --from=builder /app/src/generated ./src/generated
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma/client ./node_modules/@prisma/client
COPY --from=builder /app/prisma ./prisma

EXPOSE 3000

CMD ["sh", "-c", "prisma migrate deploy && node server.js"]
