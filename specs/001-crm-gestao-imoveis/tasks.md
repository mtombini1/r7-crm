# Tasks: CRM de Gestão de Imóveis e Locações — R7 Participações (rev. 2, pós-analyze)

**Input**: Design documents from `specs/001-crm-gestao-imoveis/`

**Prerequisites**: [plan.md](plan.md), [spec.md](spec.md), [research.md](research.md),
[data-model.md](data-model.md), [contracts/database.sql](contracts/database.sql)

**Tests**: incluídos onde a constituição exige confiabilidade testada — **datas/alertas**, **financeiro**
e **validações** (Princípio III).

**Organization**: tarefas por user story, para implementação e teste independentes.

## Format: `[ID] [P?] [Story] Description`
- **[P]**: paralelizável (arquivos diferentes, sem dependência) · **[Story]**: US1…US7

---

## Phase 1: Setup (Shared Infrastructure)

- [x] T001 Inicializar projeto Next.js 16 (App Router) + TypeScript na raiz (`package.json`, `tsconfig.json`, `app/`)
- [x] T002 [P] Tema claro (branco/cinza, iPhone-like) em `app/globals.css` (Tailwind v4 via `@theme`, sem `tailwind.config`)
- [x] T003 [P] Componentes base estilo shadcn em `components/ui/` (Button, Input, Label, Card; cn em `lib/utils.ts`)
- [x] T004 [P] ESLint (`eslint.config.mjs`) + Prettier (`.prettierrc`)
- [x] T005 [P] `.gitignore` seguro (`node_modules`, `.next`, `.env*`, build) e `.env.example`
- [x] T006 [P] Vitest + Testing Library e Playwright (scripts + `vitest.config.ts` + `playwright.config.ts`)

---

## Phase 2: Foundational (Blocking Prerequisites)

**⚠️ CRITICAL**: nenhuma user story começa antes desta fase

- [x] T007 Schema aplicado via MCP (enums, tabelas, `audit_log`, `lancamento_eventos` ledger, triggers, views `security_invoker`, RLS endurecida + hardening `search_path`/revoke) — `0001_init.sql` + `0002_harden.sql`  *(C1 ok)*
- [x] T008 Storage: bucket `arquivos` + políticas para `authenticated` (aplicado via MCP)
- [x] T009 [P] Clients Supabase (server/client/middleware) em `lib/supabase/` via `@supabase/ssr`
- [x] T010 [P] Tipos TypeScript do banco em `lib/supabase/types.ts`
- [x] T011 [P] `middleware.ts` (proteção de rotas autenticadas)
- [x] T012 [P] Tela de login (Supabase Auth e-mail/senha) em `app/(auth)/login/page.tsx`
- [x] T013 [P] Layout autenticado `app/(app)/layout.tsx` com navegação + dashboard inicial
- [x] T014 [P] Utilitários de data/fuso (America/Sao_Paulo) e BRL/pt-BR em `lib/utils/format.ts`
- [x] T015 [P] Componentes base de UI em `components/ui/` (DataTable/EmptyState entram com US1-US3)

**Checkpoint**: fundação pronta (schema + auditoria + segurança)

---

## Phase 3: User Story 1 - Cadastro e painel de imóveis (P1) 🎯 MVP

**Goal**: cadastrar imóveis e ver painel com dados + checklist · **Independent Test**: criar imóvel e abrir painel com status `Vago`

- [ ] T016 [P] [US1] Teste unitário da validação de imóvel em `tests/unit/imovel.validation.test.ts`
- [x] T017 [P] [US1] Schema zod de imóvel em `lib/validation/imovel.ts`
- [x] T018 [P] [US1] Server Actions de imóvel (criar/editar/arquivar) em `app/(app)/imoveis/actions.ts`
- [x] T019 [US1] Lista de imóveis (busca/filtro) em `app/(app)/imoveis/page.tsx` + `novo/page.tsx`
- [x] T020 [US1] Formulário com checklist (Ambiental/IPTU/Condomínio) em `app/(app)/imoveis/imovel-form.tsx`
- [x] T021 [US1] Painel do imóvel (abas Dados/Inquilino/Arquivos; status derivado) em `app/(app)/imoveis/[id]/page.tsx` + edição

---

## Phase 4: User Story 2 - Cadastro de inquilinos (P1)

**Goal**: cadastrar inquilinos (PF/PJ) · **Independent Test**: cadastrar; CPF/CNPJ inválido bloqueado

- [x] T022 [P] [US2] Validação de CPF/CNPJ (**dígito verificador**) em `lib/validation/cpf-cnpj.ts`
- [x] T023 [P] [US2] Teste unitário de CPF/CNPJ em `tests/unit/cpf-cnpj.test.ts` (12 testes ✓)
- [x] T024 [P] [US2] Schema zod de inquilino (fiador opcional) em `lib/validation/inquilino.ts`
- [x] T025 [P] [US2] Server Actions de inquilino em `app/(app)/inquilinos/actions.ts`
- [x] T026 [US2] Lista de inquilinos **(busca/filtro)** em `app/(app)/inquilinos/page.tsx`  *(corrige M1)*
- [x] T027 [US2] Formulário de inquilino (PF/PJ, fiador) em `app/(app)/inquilinos/inquilino-form.tsx`
- [x] T028 [US2] Painel do inquilino em `app/(app)/inquilinos/[id]/page.tsx`

---

## Phase 5: User Story 3 - Vínculo Imóvel↔Inquilino (Locação) (P1)

**Goal**: criar locação ligando inquilino a imóvel disponível · **Independent Test**: locação aparece no imóvel e no inquilino; imóvel vira `Ocupado`

- [x] T029 [P] [US3] Schema zod de locação (inclui `data_inicio`/`data_fim`) em `lib/validation/locacao.ts`
- [x] T030 [P] [US3] Server Actions de locação (criar; encerrar → preenche `data_fim`) em `app/(app)/locacoes/actions.ts`
- [x] T031 [US3] Seleção de imóveis disponíveis (vagos) integrada ao form via `novo/page.tsx`
- [x] T032 [US3] Formulário de locação (valor, datas, índice, troca de desconto, **dia de vencimento**) em `app/(app)/locacoes/locacao-form.tsx`
- [x] T033 [US3] Página da locação em `app/(app)/locacoes/[id]/page.tsx` + edição
- [ ] T034 [US3] e2e em `tests/e2e/locacao.spec.ts`: transição de status do imóvel **via trigger do DB** (fonte única) **e não-mistura de dados/lançamentos** entre duas locações do mesmo inquilino (FR-011)  *(corrige M7, G2)*

**Checkpoint**: 🎯 **MVP completo** (todas as P1)

---

## Phase 6: User Story 4 - Alertas de datas críticas + financeiros (P2)

**Goal**: popups contratuais (30/15/7/1, com catch-up) + popup de vencimento financeiro; reajuste exige novo valor · **Independent Test**: reajuste vencido reaparece até informar valor; lançamento vencido aparece e some ao pagar

- [x] T035 [P] [US4] Utilitário de rótulos/formatação de marcos (30/15/7/1/vencido) em `lib/alertas/marcos.ts`  *(corrige H4/H5, C2)*
- [x] T036 [P] [US4] Testes unitários do util de marcos (8 testes ✓) em `tests/unit/alertas.test.ts`
- [x] T037 [US4] Consulta de alertas pendentes (`vw_alertas_contratuais_pendentes` + `vw_alertas_financeiros_pendentes`) em `lib/alertas/queries.ts`  *(corrige H1/M4; teste de integração semeado das views fica para a leva de testes e2e)*
- [x] T038 [US4] Popup bloqueante (contratual + financeiro) em `components/domain/alerta-modal.tsx`
- [x] T039 [US4] Reconhecimento de alertas em `app/(app)/locacoes/actions.ts` (reajuste exige `novo_valor` + atualiza `valor_aluguel`; renovação/desconto via "Ciente")  *(corrige U2)*
- [x] T040 [US4] Disparar alertas ao carregar a área autenticada em `app/(app)/layout.tsx`

---

## Phase 7: User Story 5 - Controle financeiro mês a mês (ledger) (P2)

**Goal**: lançar/acompanhar competências com histórico imutável · **Independent Test**: pagar gera evento no ledger; competência nunca é apagada; vencidos destacados

- [x] T041 [P] [US5] Lógica de competências (geração/agregação) em `lib/financeiro/competencias.ts`
- [x] T042 [P] [US5] Testes unitários financeiro (12 testes ✓) em `tests/unit/financeiro.test.ts`
- [x] T043 [P] [US5] Server Actions financeiro em `app/(app)/locacoes/[id]/financeiro/actions.ts` (lançar; pagar/cancelar **via `lancamento_eventos` append-only**)  *(corrige M2, U1)*
- [x] T044 [US5] UI de controle mês a mês (competências, marcar pago) em `app/(app)/locacoes/[id]/financeiro/page.tsx` + `lancamento-form.tsx`
- [x] T045 [US5] Destacar pendências/inadimplência em `app/(app)/dashboard/pendencias.tsx` (plugado no dashboard)  *(corrige M7)*

---

## Phase 8: User Story 6 - Gestão de documentos por entidade (P2)

**Goal**: abas de arquivos separadas por entidade · **Independent Test**: 2 contratos do mesmo inquilino não misturam arquivos

- [x] T046 [P] [US6] Helpers de Storage (allowlist MIME + ≤ 25 MB + storagePath) em `lib/supabase/storage.ts`  *(corrige L4, U3)*
- [x] T047 [P] [US6] Server Actions de arquivos (anexar/arquivar) em `app/(app)/arquivos/actions.ts`
- [x] T048 [US6] Componente reutilizável de aba de arquivos (upload + signed URLs) em `components/domain/arquivos-tab.tsx`
- [x] T049 [US6] Aba integrada em imóvel/inquilino/locação (separação por `entity_type`/`entity_id`)  *(corrige M7)*
- [ ] T050 [P] [US6] Teste e2e: contratos do mesmo inquilino não misturam arquivos em `tests/e2e/arquivos.spec.ts` *(diferido p/ leva e2e)*

---

## Phase 9: User Story 7 - Imóvel vago com responsabilidade da R7 (P3)

**Goal**: imóvel sem locação ativa fica `Vago` e R7 assume pagamentos · **Independent Test**: imóvel sem locação → `Vago` e lançamentos com responsável `r7`

- [ ] T051 [US7] Cobrir status `Vago` (derivado por trigger) com teste em `tests/e2e/imovel-vago.spec.ts` *(diferido p/ leva e2e)*
- [x] T052 [US7] Lançamentos de imóvel vago com responsável `r7` em `app/(app)/imoveis/[id]/financeiro/actions.ts` + página/form
- [x] T053 [US7] Exibir responsável (R7) no painel do imóvel vago em `app/(app)/imoveis/[id]/page.tsx`

---

## Phase 10: Polish & Cross-Cutting Concerns

- [ ] T054 [P] Dashboard (próximas datas + pendências financeiras) em `app/(app)/dashboard/page.tsx`
- [ ] T055 [P] Estados de vazio/carregamento/erro em listas e painéis
- [ ] T056 [P] Testes e2e dos fluxos P1 em `tests/e2e/p1-flows.spec.ts`
- [ ] T057 [P] Revisão de segurança: RLS, `security_invoker` das views e políticas de Storage
- [ ] T058 [P] Acessibilidade e responsividade (design system)
- [ ] T059 [P] Tela de auditoria (consulta de `audit_log`) em `app/(app)/auditoria/page.tsx`  *(visibilidade do H2)*
- [ ] T060 Rodar a validação do [quickstart.md](quickstart.md), incluindo as metas de UX **SC-005** (tempos de cadastro) e **SC-006** (status de pagamento em ≤ 3 cliques) como aceite manual  *(corrige G3)*
- [ ] T061 [P] README + documentação de deploy na Vercel

---

## Dependencies & Execution Order

- **Setup (Fase 1)** → **Foundational (Fase 2, bloqueante)** → **User Stories (Fases 3–9)** → **Polish (Fase 10)**.
- MVP = Fases 1–2 + US1 + US2 + US3 (P1). Depois US4/US5/US6 (P2) e US7 (P3).
- Dentro de cada story: validações/lógica (com testes) → Server Actions → UI. O schema (models, triggers, ledger, auditoria) já vem da Fase 2.

### Paralelismo
Tarefas `[P]` da mesma fase rodam juntas (arquivos diferentes). Após a Fase 2, as stories podem andar em paralelo.

---

## Implementation Strategy

1. **MVP primeiro**: Setup → Foundational → US1 → US2 → US3 → validar/demonstrar.
2. **Incremental**: US4 (alertas) → US5 (financeiro/ledger) → US6 (documentos) → US7 (vago) → Polish.

---

## Notes
- Status do imóvel e histórico financeiro são mantidos por **triggers/ledger no banco** (fonte única; sem lógica duplicada no app).
- Financeiro é **append-only** (eventos no ledger); exclusões nas tabelas mutáveis são **soft-delete**.
- Auditoria (quem/quando/antes-depois) é automática via trigger (`audit_log`).
- **Total: 61 tarefas** — Setup 6 · Foundational 9 · US1 6 · US2 7 · US3 6 · US4 6 · US5 5 · US6 5 · US7 3 · Polish 8.
