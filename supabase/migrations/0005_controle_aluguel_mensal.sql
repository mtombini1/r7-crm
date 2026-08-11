-- Controle mensal de "aluguel pago" (check rápido, só aluguel), separado do Financeiro detalhado.
-- controle_aluguel_desde: mês a partir do qual contar (default = mês atual → sem atraso retroativo).
alter table public.locacoes
  add column if not exists controle_aluguel_desde date
    default date_trunc('month', (now() at time zone 'America/Sao_Paulo'))::date;

update public.locacoes
  set controle_aluguel_desde = date_trunc('month', (now() at time zone 'America/Sao_Paulo'))::date
  where controle_aluguel_desde is null;

-- Presença de uma linha (locacao_id, competencia) = aquele mês está PAGO.
create table if not exists public.aluguel_pagamentos (
  id uuid primary key default gen_random_uuid(),
  locacao_id uuid not null references public.locacoes(id),
  competencia date not null,
  valor numeric,
  pago_em timestamptz not null default now(),
  pago_por uuid references auth.users(id) default auth.uid(),
  unique (locacao_id, competencia)
);
create index if not exists idx_aluguel_pag_locacao on public.aluguel_pagamentos (locacao_id);

alter table public.aluguel_pagamentos enable row level security;
create policy "auth_all_aluguel_pagamentos" on public.aluguel_pagamentos
  for all to authenticated using (true) with check (true);
