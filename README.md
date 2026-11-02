# Descomplica English

MVP da plataforma de inglês prático **Descomplica English** (Instagram
[@inglesnapraticausa](https://instagram.com/inglesnapraticausa)) — inglês simples e prático
para o dia a dia, para brasileiros no Brasil e nos EUA.

Projeto novo e independente, em TypeScript, com Next.js 15 (App Router), Prisma 6
(`engineType = "client"` + `@prisma/adapter-pg`), PostgreSQL, upload direto para S3/MinIO
por URL assinada, autenticação própria com JWT em cookie `httpOnly`, Stripe Checkout
(cartão e Pix) e PWA mobile-first.

## Stack

- **Next.js 15** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS 3** — branco, azul claro, cinza escuro; fontes Montserrat/Poppins
- **Prisma 6** com `engineType = "client"` e `@prisma/adapter-pg` (sem binário de query engine)
- **PostgreSQL**
- **S3/MinIO** — upload direto por URL assinada; multipart automático acima de 100MB
- **Autenticação própria** — JWT (`jose`) em cookie `httpOnly` + `bcryptjs`
- **Stripe Checkout** — cartão e Pix, em BRL, com webhook
- **Zod** para validação, **Vitest** para testes
- **PWA** — manifest + service worker simples (cache-first para páginas, network para `/api`)

## Papéis

`ALUNO`, `PROFESSOR`, `ADMIN` — ver `prisma/schema.prisma`.

## Rodando localmente

### 1. Variáveis de ambiente

Copie `.env.example` para `.env` e ajuste os valores (Stripe e S3 podem ficar com os
placeholders para rodar o fluxo de estudo; só são necessários de verdade para testar
pagamento e upload de vídeo/áudio reais):

```bash
cp .env.example .env
```

### 2. Banco de dados

Qualquer PostgreSQL 13+ funciona. Para desenvolvimento rápido sem Docker, este repo já
inclui um Postgres embarcado (usado também na validação automatizada):

```bash
node .devtools/start-pg.mjs        # inicia em 127.0.0.1:5434 (dados em .devtools/data, git-ignorado)
# ajuste DATABASE_URL no .env para postgresql://postgres:postgres@127.0.0.1:5434/descomplica
node .devtools/start-pg.mjs stop   # para o servidor quando terminar
```

### 3. Instalar, migrar e popular

```bash
npm install
npx prisma migrate deploy   # ou "npx prisma migrate dev" em desenvolvimento
npm run db:seed
```

### 4. Rodar

```bash
npm run dev       # http://localhost:3000
npm run build && npm run start   # build de produção
```

### Qualidade

```bash
npm run typecheck
npm run lint
npm run test
```

## Usuários de demonstração (seed)

Senha para todos: **`senha123`**

| Papel | E-mail |
|---|---|
| Admin | `admin@inglesnapratica.dev` |
| Professor | `professor@inglesnapratica.dev` |
| Aluno | `marina@inglesnapratica.dev` |
| Aluno | `carlos@inglesnapratica.dev` |
| Aluno | `juliana@inglesnapratica.dev` |

O seed cria os cursos **English Made Simple** (8 aulas) e **English for Construction
Workers** (6 aulas, publicados), além de dois rascunhos não publicados (**English for
House Cleaning** e **English for Babysitter**), produtos com preço editável no admin,
depoimentos aprovados e horários de disponibilidade do professor para os próximos dias.

## Isca de PDF

O PDF gratuito "Inglês simples para o dia a dia" já está gerado em
`public/materiais/ingles-simples-dia-a-dia.pdf`. Para regerá-lo:

```bash
npm run gen:lead-pdf
```

## Deploy (Docker)

O `Dockerfile` faz build standalone do Next.js e, no `CMD`, executa
`prisma migrate deploy && node server.js`. O `docker-compose.yml` é apenas uma
**referência** de infraestrutura (Postgres + MinIO + app) — não foi executado nesta
máquina de desenvolvimento (ver `STATUS.md`).

```bash
docker build -t descomplica-english .
docker compose up -d   # referência; ajuste segredos antes de usar
```

## Estrutura

```
prisma/schema.prisma        modelo de dados completo
prisma/seed.ts               seed com o conteúdo real pedido
src/lib/business/            regras de negócio puras (testadas em *.test.ts)
src/lib/auth/                JWT, bcrypt, sessão (cookie httpOnly)
src/lib/storage.ts            upload direto/multipart no S3/MinIO
src/lib/stripe.ts             cliente Stripe
src/app/(...)                 páginas públicas, /app (aluno), /professor, /admin
src/app/api/(...)             route handlers (auth, checkout, webhook, uploads, CRUD)
scripts/generate-lead-pdf.ts  gera o PDF da isca
```

## Limitações conhecidas do MVP

Ver `STATUS.md` para a lista completa de decisões e simplificações assumidas.
