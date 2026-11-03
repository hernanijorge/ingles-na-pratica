# Deploy em produção — Easypanel

## Onde está

- **Painel**: Easypanel, projeto `nyt` (servidor compartilhado com outros projetos — `google-alerts`, `opendoor`). Decisão consciente: usar um projeto existente em vez de criar um novo (plano grátis do Easypanel permite 3 projetos; já estavam todos em uso).
- **Serviços** (prefixo `ingles-` para não confundir com os outros serviços do projeto `nyt`):
  - `ingles-db` — Postgres, limite de memória 256 MB.
  - `ingles-minio` — MinIO (`bitnamilegacy/minio:latest`), bucket `ingles-videos`, limite de memória 320 MB (256 MB era insuficiente — o processo já usa ~260 MB parado).
  - `ingles-app` — Next.js standalone, limite de memória 512 MB.
- **Domínios**: gerados automaticamente pelo Easypanel (subdomínio `*.fox7oc.easypanel.host`). Domínio próprio ainda não configurado.
- **Swap**: 2 GB configurado no servidor (persistido em `/etc/fstab`) para dar folga de memória, já que o build do Next.js sozinho passa de 1 GB.

## Pipeline de build

**O build NÃO roda no Easypanel.** Um GitHub Action (`.github/workflows/docker.yml`) builda a imagem Docker a cada push em `main` e publica em `ghcr.io/hernanijorge/ingles-na-pratica:latest` (pacote público, herdado da visibilidade do repositório). O `ingles-app` usa essa imagem pronta como source ("Docker Image"), evitando o pico de memória do build numa VPS com RAM compartilhada.

**Deploy não é automático.** Depois de um push, é preciso clicar manualmente em "Deploy" no painel do Easypanel (mesma limitação conhecida de outros serviços neste servidor) — ou usar a deploy trigger URL da aba Deployments do serviço.

## Variáveis de ambiente do `ingles-app`

(Nomes apenas — valores reais só no painel do Easypanel.)

| Variável | Observação |
|---|---|
| `DATABASE_URL` | Connection string interna pro `ingles-db` |
| `JWT_SECRET` | Gerado só para este deploy, nunca reaproveitado de outro app |
| `NEXT_PUBLIC_SITE_URL` | URL pública do `ingles-app` |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | **Placeholder** — trocar pelo número real |
| `S3_ENDPOINT` | Domínio público do `ingles-minio` (precisa ser público porque o upload é direto do navegador via URL assinada) |
| `S3_REGION`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, `S3_BUCKET`, `S3_PUBLIC_URL` | Credenciais do `ingles-minio` |
| `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` | **Placeholders** — trocar pelas chaves reais antes de abrir pagamento de verdade |

## Conteúdo (seed)

`prisma/seed-content.ts` (novo, separado do `prisma/seed.ts` de desenvolvimento) — idempotente, cria só produtos e cursos/aulas, **nunca cria usuários**. Rodado uma vez contra a `DATABASE_URL` externa (banco temporariamente exposto via "Expose" do Easypanel, desativado logo depois).

## Admin

Criado via `scripts/create-admin.ts` (lê `ADMIN_EMAIL`/`ADMIN_PASSWORD` do ambiente, nunca pede nem registra a senha em lugar nenhum). Rodado localmente pelo próprio usuário, não pelo assistente.

Confirmado em 2026-11-03: existe **exatamente 1** usuário com `role = ADMIN` em produção (o admin real criado pelo usuário). Uma tentativa de criar um segundo admin de teste (só para validar o fluxo de login sem usar a senha real) foi **bloqueada pelo classificador de permissões do assistente** antes de rodar — ou seja, nunca chegou a existir no banco.

## CORS do bucket `ingles-videos`

A imagem `bitnamilegacy/minio:latest` rodando aqui **não implementa `mc cors set` por bucket** (comando existe no client `mc`, mas o servidor recusa qualquer configuração com `"functionality that is not implemented"`, independente do conteúdo do XML). Configurado em vez disso via variável de ambiente do servidor (suporte mais maduro/estável do MinIO, igual de efetivo para este caso de uso de bucket único):

```
MINIO_API_CORS_ALLOW_ORIGIN=https://nyt-ingles-app.fox7oc.easypanel.host
```

Testado de ponta a ponta com uma URL assinada real (mesmo código da aplicação): preflight `OPTIONS` retorna `204` com `Access-Control-Allow-Origin`/`Allow-Methods`/`Allow-Headers` corretos, e o `PUT` real retorna `200` com `Access-Control-Allow-Origin` e **`ETag` já incluído automaticamente em `Access-Control-Expose-Headers`** (o MinIO expõe isso por padrão quando CORS está habilitado — não precisou de configuração extra para o multipart funcionar).

## Segurança da imagem GHCR

Sem Docker instalado nesta máquina para rodar `docker history`, a inspeção foi feita de duas formas equivalentes:

1. `.dockerignore` já exclui `.env`/`.env.*.local`/`.git` do contexto de build; e o repositório Git em si nunca teve `.env` commitado (só `.env.example`, com placeholders).
2. Inspeção direta do filesystem do container **rodando em produção** (exatamente o que foi puxado do GHCR): `find` por `.env*`/`*secret*` em todo o container não encontrou nada fora de `node_modules`, `/app/.git` não existe, e uma busca por padrões de chave Stripe real (`sk_live`, `sk_test_...`, `whsec_...`) nos bundles compilados não encontrou nada.

Imagem confirmada limpa — **mantida pública**, sem necessidade de token/credencial no Easypanel.

## Bugs reais encontrados e corrigidos durante este primeiro deploy

1. **`next build` quebrava sem `DATABASE_URL`** — `src/lib/prisma.ts` instanciava o client no carregamento do módulo. Corrigido para instanciação lazy (Proxy).
2. **Landing pré-renderizada estaticamente** — `/` fazia query direta ao banco em build-time. Corrigido com `export const dynamic = "force-dynamic"`.
3. **Faltava `query_compiler_bg.wasm` na imagem final** — o `generator` do Prisma usa `output = "../src/generated/prisma"` (engineType `"client"`), mas o Dockerfile só copiava `node_modules/.prisma`/`@prisma/client`. Corrigido copiando `src/generated` também.
4. **Prisma client não cacheava em produção** — a instanciação lazy do item 1 só cacheava via `globalThis` em desenvolvimento; em produção, cada acesso a uma propriedade do proxy (`prisma.course`, `prisma.product`, ...) criava um pool de conexão novo. Isso causava resultado vazio e inconsistente em queries concorrentes (ex. landing mostrando preços certos mas cursos vazios). Corrigido cacheando sempre.

## Validado manualmente em produção (2026-11-03)

- Landing: cursos, preços e WhatsApp flutuante renderizando com dado real.
- Isca: formulário → lead salvo no banco → PDF (`/materiais/ingles-simples-dia-a-dia.pdf`) baixável.
- Cadastro de aluno com consentimento LGPD → login automático → painel do aluno.
- Aula 1 grátis: vocabulário com áudio, flashcards, frases úteis, exercícios de traduzir e completar (validação automática "Correto").
- Agendamento: tela mostra corretamente "fuso de São Paulo e Nova York" (sem horários disponíveis porque nenhum professor foi cadastrado em produção ainda — nenhum usuário demo é criado por design).
- Memória do servidor seguiu bem abaixo do limite de 85% durante todo o deploy (pico de ~57%).
- Serviços pré-existentes do projeto `nyt` (`nyt-email-collector`, `nyt-oracle-collector`) e dos outros projetos continuaram rodando normalmente.

## Pendente

- **Stripe real**: ainda em modo placeholder; ativar só depois de revisar tudo.
- **WhatsApp real**: trocar o placeholder pelo número de verdade.
- **Domínio próprio**: ainda usando o subdomínio gerado pelo Easypanel.
- **Exercício "fale" (gravação de áudio → upload MinIO)**: não dá pra testar de forma confiável via automação de navegador (exige permissão real de microfone). Precisa de teste manual.
- **Login do admin real**: ainda não confirmado pelo usuário (o assistente nunca usa a senha real); CORS do MinIO já validado com teste de PUT real (ver seção acima), então o próximo teste manual pendente é o próprio login + upload de vídeo pelo painel do professor.
