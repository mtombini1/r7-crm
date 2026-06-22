# Research & Decisões Técnicas — CRM R7

Fase 0 do plano. Cada decisão registra: o que foi escolhido, por quê, e alternativas consideradas.
A stack de infraestrutura (GitHub, Supabase, Vercel) já é uma restrição da constituição.

## 1. Framework de frontend/full-stack
- **Decisão**: Next.js 15 (App Router, React 19, Server Actions) em TypeScript.
- **Rationale**: integração nativa com a Vercel (mesmo fornecedor), suporte de primeira classe a
  Supabase (`@supabase/ssr`), Server Components/Actions para acesso seguro ao banco, ótimo DX.
- **Alternativas**: Vite + React SPA (mais simples, mas sem SSR/Server Actions — empurra mais lógica
  para o cliente); Remix/SvelteKit (ótimos, porém menor sinergia Vercel+Supabase que o Next).

## 2. UI / design system (visual iPhone-like)
- **Decisão**: Tailwind CSS + shadcn/ui (componentes Radix), tema claro (branco com detalhes em cinza).
- **Rationale**: componentes acessíveis e altamente customizáveis para um visual limpo, leve e
  profissional; controle total de estética (atende Princípio IV).
- **Alternativas**: MUI (pesado, estética “Material”, menos “Apple”); Chakra (bom, menos flexível p/ um
  look próprio).

## 3. Autenticação e autorização
- **Decisão**: Supabase Auth (e-mail/senha). Todos os usuários autenticados têm acesso total.
- **Rationale**: requisito confirmado (sem níveis de permissão nesta versão); simplicidade.
- **RLS**: políticas liberam CRUD para `authenticated`; nenhum acesso para anônimos. Estrutura pronta
  para futuros papéis (admin/operador) sem reescrever o schema.

## 4. Acesso a dados
- **Decisão**: Server Components + Server Actions com `@supabase/ssr`; TanStack Query no cliente onde
  houver interatividade (ex.: marcação de pagamentos, modal de alerta).
- **Rationale**: leitura segura no servidor, escrita transacional via actions, cache no cliente.

## 5. Armazenamento de arquivos
- **Decisão**: Supabase Storage com bucket `arquivos`; caminho por entidade
  (`{entity_type}/{entity_id}/{arquivo}`); metadados na tabela `arquivos`.
- **Rationale**: separação física e lógica por imóvel/inquilino/locação (Princípio I e US6); políticas
  de Storage restritas a autenticados.
- **Alternativas**: tabelas/buckets separados por entidade (mais objetos a manter; rejeitado por
  simplicidade — um bucket + prefixo resolve).

## 6. Motor de alertas (datas críticas + financeiros)
- **Decisão**: duas views com `security_invoker = on` (respeitam a RLS):
  `vw_alertas_contratuais_pendentes` (reajuste/renovação/desconto) e `vw_alertas_financeiros_pendentes`
  (lançamentos vencidos e pendentes — FR-024). Para as contratuais, a lógica é de **catch-up**: o alerta
  aparece quando a janela abre (faltam ≤ 30 dias) e **persiste mesmo após a data-alvo** até ser
  reconhecido — não some se ninguém logar no dia exato. O **alerta de reajuste é bloqueante**: só
  encerra após informar o `novo_valor` (gravado em `alertas_reconhecimentos`, atualizando `valor_aluguel`).
  O alerta financeiro encerra automaticamente quando o lançamento é pago/cancelado.
- **Rationale**: atende FR-020..FR-024, SC-002 (verificável) e o Princípio III; marcos isolados em
  `lib/alertas` para teste unitário.
- **Futuro**: pré-cálculo via `pg_cron`/Vercel Cron e canais e-mail/WhatsApp.

## 7. Validação de dados
- **Decisão**: schemas **zod** compartilhados cliente/servidor; validação de CPF/CNPJ dedicada.
- **Rationale**: regra única de validação (FR-006), reaproveitada em formulários e Server Actions.

## 8. Datas, fuso e moeda
- **Decisão**: `date-fns` + `date-fns-tz`; datas de negócio como `date`, timestamps como `timestamptz`;
  formatação BRL e pt-BR via `Intl`.
- **Rationale**: cálculos de marcos corretos no fuso America/Sao_Paulo (Princípio III).

## 9. Migrações e schema
- **Decisão**: Supabase CLI com migrações SQL versionadas em `supabase/migrations/`, a partir de
  `contracts/database.sql`.
- **Rationale**: schema rastreável no Git (Princípio I e fluxo spec-driven).

## 10. Testes
- **Decisão**: Vitest + Testing Library para unitários (datas, alertas, financeiro, validações);
  Playwright para e2e dos fluxos P1.
- **Rationale**: a constituição exige confiabilidade testada da lógica crítica (datas/financeiro).
