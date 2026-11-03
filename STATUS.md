# STATUS — Descomplica English (MVP)

Registro das decisões tomadas de forma autônoma durante a construção do MVP, conforme
pedido ("decida e registre no STATUS.md", sem pedir confirmação a cada etapa).

## Deploy em produção — 2026-11-03

App publicado no Easypanel (projeto `nyt`, serviços `ingles-db`/`ingles-minio`/`ingles-app`).
Detalhes completos (pipeline de build, variáveis de ambiente, bugs encontrados e
corrigidos, checklist de validação manual, pendências) em [`docs/DEPLOY.md`](docs/DEPLOY.md).

Resumo: build fora da VPS via GitHub Actions + GHCR (evita o pico de memória do `next
build` numa VPS compartilhada), swap de 2 GB configurado no servidor, limites de memória
por serviço (256/320/512 MB). Conteúdo semeado via `prisma/seed-content.ts` (novo —
idempotente, nunca cria usuários). Quatro bugs reais de produção encontrados e corrigidos
durante o primeiro deploy (build sem `DATABASE_URL`, pré-renderização estática da
landing, arquivo wasm do Prisma faltando na imagem, client do Prisma não cacheando em
produção). Fluxo principal validado manualmente em produção: landing, isca com PDF, lead
salvo, cadastro com LGPD, aula grátis com exercícios. Pendente: Stripe/WhatsApp reais,
domínio próprio, teste manual da gravação de áudio e do login do admin real, CORS do
MinIO.

## Revalidação — 2026-11-01

Nova sessão: diagnóstico completo (README, STATUS, schema, `git branch -a`, `git log`,
`git status`) confirmou que não existe branch `v2` (só `master`, árvore limpa) e que o
MVP descrito abaixo já cobre 100% do escopo pedido do "Inglês na Prática" — landing com
WhatsApp, isca em PDF com leads em CSV, os dois cursos publicados com preços
97/97/60/200 em BRL, vocabulário com áudio, flashcards, os três tipos de exercício,
progresso/sequência/certificado, agendamento SP/NY avulso e pacote de 4, depoimentos,
painéis de professor/admin e LGPD (exportação/exclusão de conta) — todos confirmados por
leitura de código, não só pelo registro abaixo. Como não havia nada pendente no working
tree, nenhum commit de "pendências" foi necessário nesta etapa.

Revalidação completa executada de novo (Postgres embarcado, porta 5434, iniciado
destacado e aguardado via polling síncrono de porta/conexão real com
`.devtools/wait-port.mjs` e `.devtools/check-pg.mjs`, **parado ao final**):

| Etapa | Comando | Resultado |
|---|---|---|
| Migração | `npx prisma migrate deploy` | ✅ já aplicada, nada pendente |
| Seed | `npm run db:seed` | ✅ concluído (idempotente) |
| Typecheck | `npm run typecheck` | ✅ sem erros |
| Lint | `npm run lint` | ✅ 0 erros (1 warning benigno de `exhaustive-deps`, mesmo de antes) |
| Testes | `npm run test` | ✅ 17/17 (vitest) |
| Build | `npm run build` | ✅ build de produção (standalone) gerado, 47 rotas |

Nenhuma variável de ambiente nova foi necessária. Nenhuma migration nova foi criada (o
schema não mudou). Próximo passo de deploy: seguir a seção "Deploy (Docker)" do
`README.md` — ainda não executado nesta máquina (requer Postgres/MinIO reais e segredos
de produção, incluindo chaves Stripe reais em vez dos placeholders do `.env`).

## Resultado da validação original (sem Docker)

Executado nesta máquina com Postgres embarcado (`embedded-postgres`) em
`.devtools/pg` (dados em `.devtools/data`), porta **5434**, iniciado destacado e
aguardado de forma síncrona via polling de porta/conexão real (não via notificação de
processo em segundo plano), e **parado ao final**.

| Etapa | Comando | Resultado |
|---|---|---|
| Migração | `npx prisma migrate deploy` | ✅ aplicada (`20261102012900_init`) |
| Seed | `npm run db:seed` | ✅ concluído |
| Typecheck | `npm run typecheck` | ✅ sem erros |
| Lint | `npm run lint` | ✅ 0 erros (1 warning benigno de `exhaustive-deps`) |
| Testes | `npm run test` | ✅ 17/17 (vitest) |
| Build | `npm run build` | ✅ build de produção (standalone) gerado |
| Smoke test manual | `next start` + `curl` contra o Postgres real | ✅ login, dashboard, aula gratuita, conclusão de aula (exercícios → `LessonProgress` + `StudyDay`), agendamento debitando crédito e bloqueio por falta de crédito (402) — todos confirmados ponta a ponta |

Os testes automatizados (`src/lib/business/*.test.ts`) cobrem exatamente os quatro
cenários pedidos: **liberação de aula por compra**, **conclusão de aula**, **conversão de
fuso no agendamento** (São Paulo fixo UTC-3 vs. Nova York UTC-5/UTC-4 com horário de
verão) e **pacote de 4 aulas debitando saldo** (incluindo erro ao tentar agendar sem
saldo).

## Decisões de arquitetura

- **Prisma Client** gerado em `src/generated/prisma` (não no caminho padrão
  `node_modules/.prisma/client`), com `engineType = "client"` + `@prisma/adapter-pg`.
  O Next.js traça esse diretório automaticamente para o build standalone. O Dockerfile
  ainda copia `node_modules/.prisma` e `node_modules/@prisma/client` (que o Prisma
  continua gerando por compatibilidade mesmo com `output` customizado) e instala a CLI
  do Prisma globalmente na imagem final para rodar `prisma migrate deploy`.
- **Acesso a conteúdo** por `Enrollment` (criado na liberação da compra via webhook do
  Stripe). A aula 1 de cada curso (`isFreePreview = true`) é sempre liberada, mesmo sem
  login.
- **Créditos de aula particular** (`ClassCredit`) são um saldo numérico por usuário,
  criado tanto pela compra avulsa (1 crédito) quanto pelo pacote de 4 (4 créditos) —
  mesma lógica de débito (`debitClassCredit`), simplificando agendamento.
- **Conclusão de aula**: todos os exercícios precisam ter uma submissão "feita"
  (TRANSLATE/FILL corrigidos automaticamente como `CORRECT`; SPEAK basta ter áudio
  enviado — o feedback do professor é um bônus que não bloqueia a conclusão).
- **Certificado**: emitido automaticamente (código único `DES-XXXXXXXXXX`) quando todas
  as aulas de um curso têm `LessonProgress` para o usuário.
- **`Course.productKey` é opcional**: os dois cursos-rascunho (House Cleaning,
  Babysitter) não têm produto/preço associado ainda, por não estarem publicados.
- **Exclusão de conta (LGPD)**: anonimiza (`name`, `email`, `whatsapp`, `passwordHash`) e
  marca `deletedAt`, em vez de apagar o registro — preserva histórico de compras para
  fins fiscais/contábeis, como é prática comum e aceitável sob a LGPD para dados
  necessários a obrigações legais.
- **Edição de vocabulário/frases/exercícios no painel do professor** usa um formato de
  texto por linha (`inglês | português` / `TIPO | enunciado | resposta`) em vez de um
  formulário com campos repetidos dinamicamente — reduz bastante a complexidade da UI
  mantendo a funcionalidade completa de CRUD em lote.
- **Upload de vídeo** decide automaticamente entre URL assinada simples (≤100MB) e
  multipart (>100MB, partes de 10MB) no cliente (`src/lib/client/upload.ts`). O upload
  multipart via navegador depende do bucket expor o header `ETag` via CORS
  (`Access-Control-Expose-Headers: ETag`) — documentado aqui pois é uma configuração do
  MinIO/S3, não do código da aplicação.
- **Checkout Stripe**: usa `price_data` dinâmico (preço vem do nosso `Product.priceCents`
  editável no admin) em vez de produtos/preços cadastrados no Stripe — evita ter que
  sincronizar catálogo, ao custo de não reaproveitar "Products" do dashboard Stripe.
- **PWA**: ícone em SVG único (`purpose: any`) em vez de PNGs 192/512 — suficiente para
  instalabilidade na maioria dos navegadores modernos; não há ferramenta de geração de
  PNG disponível no ambiente sem adicionar uma dependência nativa (`sharp`/`canvas`).
  Documentado como simplificação aceitável para o MVP.
- **1 usuário ADMIN foi adicionado ao seed** (`admin@inglesnapratica.dev`), além dos "1
  professor, 3 alunos e 2 depoimentos" pedidos — necessário para o painel admin ter
  alguém que consiga logar nele.

## O que foi entregue

- Landing page (proposta de valor, cursos, preços, depoimentos aprovados, WhatsApp
  flutuante), isca de PDF com captura de lead.
- Cadastro/login com JWT em cookie `httpOnly`, consentimento LGPD no cadastro,
  exportação e exclusão de conta.
- Cursos com aulas: vídeo opcional, vocabulário EN/PT com áudio (Web Speech API),
  frases úteis, flashcards, exercícios (traduzir, completar, falar com gravação de
  áudio no navegador), conclusão automática de aula, progresso por curso, sequência de
  dias estudando, certificado com página pública `/certificado/[codigo]`.
- Aulas particulares: disponibilidade do professor, agendamento do aluno debitando
  crédito (avulso ou pacote de 4), horários exibidos em São Paulo e Nova York, link de
  Meet/Zoom informado pelo professor.
- Pagamentos Stripe Checkout (cartão e Pix) em BRL + webhook liberando matrícula/crédito;
  preços editáveis no admin.
- Depoimentos (aluno envia, admin aprova).
- Painel do professor (CRUD de cursos/aulas, upload de vídeo, fila de correção de
  áudio, agenda) e painel do admin (usuários, produtos, leads com export CSV,
  depoimentos).
- Seed com o conteúdo real pedido (cursos, aulas, vocabulário, frases, usuários).
- PDF da isca gerado em `public/materiais/`.
- Testes Vitest para os 4 cenários pedidos.
- `Dockerfile` standalone, `docker-compose.yml` de referência, `.env.example`.

## Limitações conhecidas (fora do escopo do MVP)

- Sem envio real de e-mail (ex.: confirmação de cadastro, lembrete de aula) — fora do
  pedido original.
- Sem testes end-to-end de UI (Playwright/Cypress); a validação de UI foi feita via
  build + smoke test manual com `curl` contra o servidor real.
- Painel do professor/admin usa componentes client simples com `fetch` direto às rotas
  de API (sem biblioteca de data-fetching); suficiente para o volume de dados de um
  MVP.
- Disponibilidade do professor é uma lista de horários pontuais (sem regra de
  recorrência semanal configurável na UI); cobre o caso de uso pedido.
