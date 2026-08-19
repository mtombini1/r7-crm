-- Débitos de aluguel em aberto no momento do encerramento de uma locação.
-- Snapshot: uma linha por mês vencido e não pago no encerramento. Fica registrado
-- no cartão do inquilino e continua no painel "Vencimentos em atraso" até ser quitado.
create table if not exists public.debitos_encerramento (
  id uuid primary key default gen_random_uuid(),
  inquilino_id uuid not null references public.inquilinos(id),
  locacao_id uuid not null references public.locacoes(id),
  imovel_id uuid references public.imoveis(id),
  competencia date not null,
  valor numeric,
  vencimento date,
  registrado_em timestamptz not null default now(),
  registrado_por uuid references auth.users(id) default auth.uid(),
  quitado_em timestamptz,
  quitado_por uuid references auth.users(id),
  unique (locacao_id, competencia)
);
create index if not exists idx_debitos_enc_inquilino on public.debitos_encerramento (inquilino_id);
create index if not exists idx_debitos_enc_locacao on public.debitos_encerramento (locacao_id);
create index if not exists idx_debitos_enc_aberto on public.debitos_encerramento (quitado_em) where quitado_em is null;

alter table public.debitos_encerramento enable row level security;
create policy "auth_all_debitos_encerramento" on public.debitos_encerramento
  for all to authenticated using (true) with check (true);
