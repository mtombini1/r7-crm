<!-- SPECKIT START -->
## Projeto: CRM R7 Participações

Plano ativo: `specs/001-crm-gestao-imoveis/plan.md` (ler antes de implementar). Spec:
`specs/001-crm-gestao-imoveis/spec.md`. Constituição: `.specify/memory/constitution.md`.

**Stack**: Next.js 16 (App Router, TypeScript) · Supabase (PostgreSQL + RLS + Storage) · Vercel ·
Tailwind CSS + shadcn/ui · TanStack Query · react-hook-form + zod · date-fns(-tz) · Vitest + Playwright.

**Não-negociáveis** (constituição): RLS em TODA tabela; segredos só em env (`.env.local` fora do Git);
soft-delete + financeiro append-only; lógica de datas/alertas isolada em `lib/` e testada; fuso
America/Sao_Paulo, moeda BRL, pt-BR; tema claro (branco/cinza) estilo iPhone.

**Modelo de dados / contrato**: `specs/001-crm-gestao-imoveis/data-model.md` e
`specs/001-crm-gestao-imoveis/contracts/database.sql` (vira `supabase/migrations/0001_init.sql`).

**Estrutura**: `app/` (rotas) · `components/ui` + `components/domain` · `lib/{supabase,validation,alertas,financeiro}` ·
`supabase/migrations` · `tests/{unit,e2e}`.
<!-- SPECKIT END -->
