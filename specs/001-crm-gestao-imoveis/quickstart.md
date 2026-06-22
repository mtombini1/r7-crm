# Quickstart — CRM R7

Guia de setup e validação. (Implementação concreta vem com o `/speckit-implement`.)

## Pré-requisitos
- Node.js 20 LTS (`node --version`)
- Conta/projeto Supabase (project ref `dlbkeajhcipprodxrsrx`) e Supabase CLI
- Conta Vercel (deploy)
- Variáveis de ambiente (em `.env.local`, NUNCA versionado):
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY` (apenas server-side)

## Setup local
```bash
npm install
# aplicar schema (a partir de specs/.../contracts/database.sql → supabase/migrations)
supabase db push          # ou: supabase migration up
npm run dev               # http://localhost:3000
```

## Banco e segurança
- Schema canônico: [contracts/database.sql](contracts/database.sql) (vira `supabase/migrations/0001_init.sql`).
- RLS habilitada em todas as tabelas; criar o bucket de Storage `arquivos` com políticas restritas a
  usuários autenticados.

## Cenários de validação (ligados às User Stories)
1. **US1 — Imóvel**: criar imóvel completo → abrir painel → ver dados + checklist (Ambiental/IPTU/Condomínio) + status `Vago`.
2. **US2 — Inquilino**: criar inquilino (PF e PJ) → CPF/CNPJ inválido é bloqueado.
3. **US3 — Locação**: criar locação escolhendo imóvel disponível → aparece no painel do imóvel e do inquilino; imóvel vira `Ocupado`.
4. **US4 — Alertas**: locação com `data_reajuste` em 1 dia → popup aparece e só fecha após informar o novo valor.
5. **US5 — Financeiro**: lançar competência → marcar como paga → histórico preservado; pendência vencida destacada.
6. **US6 — Documentos**: anexar arquivos em imóvel, inquilino e locação → cada aba mostra só os seus; 2º contrato do mesmo inquilino não mistura arquivos.
7. **US7 — Vago**: imóvel sem locação ativa → status `Vago` e responsável `R7` nos lançamentos.

## Testes
```bash
npm run test        # Vitest (unit: datas, alertas, financeiro, validações)
npm run test:e2e    # Playwright (fluxos P1)
```
