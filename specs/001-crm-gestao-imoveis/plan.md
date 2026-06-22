# Implementation Plan: CRM de Gestão de Imóveis e Locações — R7 Participações

**Branch**: `001-crm-gestao-imoveis` | **Date**: 2026-06-21 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/001-crm-gestao-imoveis/spec.md`

## Summary

CRM web para centralizar imóveis, inquilinos, locações, documentos (separados por entidade),
controle financeiro mês a mês e alertas de datas críticas. Abordagem técnica: aplicação full-stack
**Next.js (App Router) + TypeScript**, dados em **Supabase (PostgreSQL com RLS) + Supabase Storage**,
hospedagem na **Vercel**. UI clara/iPhone-like com **Tailwind CSS + shadcn/ui**. Lógica de datas e
alertas isolada e testada (Vitest), respeitando o fuso America/Sao_Paulo e BRL.

## Technical Context

**Language/Version**: TypeScript 5.x, Node.js 20 LTS

**Primary Dependencies**: Next.js 16 (App Router, React 19, Server Actions), `@supabase/supabase-js` +
`@supabase/ssr`, Tailwind CSS, shadcn/ui (Radix UI), TanStack Query, react-hook-form + zod, date-fns +
date-fns-tz, lucide-react (ícones)

**Storage**: Supabase PostgreSQL (RLS em todas as tabelas) + Supabase Storage (arquivos por entidade)

**Testing**: Vitest + Testing Library (unitários — foco em datas/alertas/financeiro); Playwright (e2e
dos fluxos P1)

**Target Platform**: Web (desktop-first, responsivo), navegadores modernos

**Project Type**: Web application (Next.js full-stack na Vercel)

**Performance Goals**: dashboard < 2s; operações CRUD p95 < 500ms; cálculo de alertas (consulta das
views) < 200ms para a escala atual

**Constraints**: pt-BR; fuso America/Sao_Paulo; moeda BRL; LGPD; **RLS obrigatória**; tema claro
(branco/cinza) estilo iPhone; segredos fora do repositório

**Scale/Scope**: ~80 imóveis, dezenas de inquilinos/locações, equipe pequena de usuários; ~12–15 telas

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Princípio | Como o plano atende | Status |
|-----------|---------------------|--------|
| I. Integridade e Rastreabilidade | Soft-delete nas tabelas mutáveis; **ledger financeiro imutável** (`lancamento_eventos`); **audit-log** (quem/quando/antes-depois) via trigger; `created_by`/`updated_by`; arquivos separados por `entity_type`+`entity_id` | ✅ |
| II. Segurança (RLS/LGPD/segredos) | RLS habilitada em 100% das tabelas + políticas de Storage; chaves só em env (Vercel/Supabase); `.gitignore` seguro; dados pessoais só p/ autenticados | ✅ |
| III. Confiabilidade de datas/alertas | Utilitários de data isolados em `lib/alertas` testados com Vitest; fuso America/Sao_Paulo; view de alertas pendentes | ✅ |
| IV. UX limpa/profissional | Tailwind + shadcn/ui, tema claro, design system único, estados de vazio/erro/carregamento | ✅ |
| V. Simplicidade / MVP | App único Next.js (sem microserviços); IPTU automático fora do MVP; sem over-engineering | ✅ |

**Resultado**: sem violações — `Complexity Tracking` vazio.

## Project Structure

### Documentation (this feature)

```text
specs/001-crm-gestao-imoveis/
├── plan.md              # Este arquivo
├── research.md          # Decisões técnicas (Fase 0)
├── data-model.md        # Modelo de dados (Fase 1)
├── quickstart.md        # Setup + validação (Fase 1)
├── contracts/           # Contrato de dados (schema + RLS)
│   └── database.sql
└── tasks.md             # Gerado por /speckit-tasks (Fase 2)
```

### Source Code (repository root)

```text
app/                         # Next.js App Router
├── (auth)/login/            # autenticação
├── (app)/                   # área autenticada
│   ├── dashboard/           # visão geral: próximas datas + pendências
│   ├── imoveis/             # lista + [id] painel (abas: dados, inquilino, arquivos)
│   ├── inquilinos/          # lista + [id]
│   └── locacoes/            # lista + [id] (financeiro + arquivos da locação)
├── layout.tsx
└── globals.css
components/
├── ui/                      # shadcn/ui (base)
└── domain/                  # componentes de domínio (cards, tabelas, modal de alerta)
lib/
├── supabase/                # clients (server/client/middleware) via @supabase/ssr
├── validation/              # schemas zod (imóvel, inquilino, locação) + CPF/CNPJ
├── alertas/                 # cálculo de marcos 30/15/7/1 (TESTADO)
└── financeiro/              # geração/consulta de competências (TESTADO)
supabase/
└── migrations/              # SQL versionado (a partir de contracts/database.sql)
tests/
├── unit/                    # Vitest (datas, alertas, financeiro, validações)
└── e2e/                     # Playwright (fluxos P1)
```

**Structure Decision**: aplicação web única em Next.js (App Router) — frontend e acesso a dados no
mesmo projeto, com Supabase como backend gerenciado. Escolhido por aderência total à Vercel + Supabase
e simplicidade (Princípio V), evitando separar frontend/backend desnecessariamente.

## Complexity Tracking

> Sem violações de constituição — nada a justificar.

## Phases

- **Phase 0 — Research**: [research.md](research.md) ✅ (decisões e alternativas resolvidas)
- **Phase 1 — Design & Contracts**: [data-model.md](data-model.md), [contracts/database.sql](contracts/database.sql),
  [quickstart.md](quickstart.md), contexto do agente atualizado ([CLAUDE.md](../../CLAUDE.md)) ✅
- **Phase 2 — Tasks**: gerado pelo `/speckit-tasks` (próxima etapa)
