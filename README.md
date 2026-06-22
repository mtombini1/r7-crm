# R7 CRM — Gestão de Imóveis e Locações

CRM da **R7 Participações** para centralizar ~80 imóveis (PR/SC), seus inquilinos, contratos de
locação, controle financeiro mês a mês, documentos e alertas de datas críticas — substituindo o
controle em planilhas Excel.

Construído com **spec-driven development** (spec-kit). Os artefatos de planejamento estão em
[`specs/001-crm-gestao-imoveis/`](specs/001-crm-gestao-imoveis/) (spec, plano, modelo de dados,
contrato SQL, tarefas).

## Stack
- **Next.js 16** (App Router, React 19, Server Actions) + **TypeScript**
- **Supabase** (PostgreSQL + RLS + Storage) — projeto `dlbkeajhcipprodxrsrx`
- **Tailwind CSS v4** + componentes próprios estilo shadcn (tema claro, iPhone-like)
- **Vitest** (unitários) + **Playwright** (e2e)
- Deploy: **Vercel**

## Funcionalidades
- **Imóveis**: cadastro, checklist de documentos (Ambiental/IPTU/Condomínio), painel, busca
- **Inquilinos**: PF/PJ, validação de **CPF/CNPJ (dígito verificador)**, fiador opcional
- **Locação**: vínculo imóvel↔inquilino, valores e datas; status do imóvel derivado por trigger
- **Alertas**: popups a 30/15/7/1 dias (reajuste exige novo valor) + vencimentos financeiros
- **Financeiro**: controle mês a mês com **ledger imutável** (append-only) e auditoria
- **Documentos**: upload por entidade (imóvel/inquilino/locação), separados, em Storage privado
- **Imóvel vago**: R7 assume os pagamentos
- **Auditoria**: histórico de quem/quando/o quê

## Desenvolvimento local
```bash
npm install
# crie o .env (a partir do .env.example) com as chaves do Supabase
npm run dev          # http://localhost:3000
npm run test         # unitários (Vitest)
npm run build        # build de produção
```

> Crie um usuário em **Supabase → Authentication → Users → Add user** (com Auto Confirm) para logar.

## Banco de dados
Schema versionado em [`supabase/migrations/`](supabase/migrations/) — já aplicado no projeto Supabase
(via MCP). RLS habilitada em todas as tabelas; bucket de Storage `arquivos` privado.

## Deploy na Vercel
1. `git init` e suba o repositório para o **GitHub**.
2. Na **Vercel**, importe o repositório.
3. Em **Settings → Environment Variables**, cadastre:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
4. Deploy. A Vercel faz build/deploy automático a cada push.

> ⚠️ Nunca faça commit de chaves reais — `.env*` está no `.gitignore` (só `.env.example` é versionado).
> O MCP do Supabase e o app são para **desenvolvimento/gestão interna**, não para produção com dados sensíveis sem revisão.
