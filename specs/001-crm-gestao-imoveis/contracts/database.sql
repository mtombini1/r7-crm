-- Contrato de dados — CRM R7 Participações (rev. 2, pós-analyze)
-- Base para supabase/migrations/0001_init.sql. PostgreSQL / Supabase.
-- Princípios: RLS em toda tabela (II), soft-delete + AUDITORIA RIGOROSA + ledger imutável (I).

-- ========== Enums ==========
create type imovel_status         as enum ('ocupado', 'vago');
create type inquilino_tipo        as enum ('pf', 'pj');
create type locacao_status        as enum ('ativa', 'encerrada');
create type lancamento_tipo       as enum ('aluguel', 'iptu', 'condominio', 'ambiental');
create type lancamento_status     as enum ('pendente', 'pago', 'cancelado');
create type responsavel_pagamento as enum ('inquilino', 'r7');
create type entidade_arquivo      as enum ('imovel', 'inquilino', 'locacao');
create type alerta_tipo           as enum ('reajuste', 'renovacao', 'desconto'); -- alertas CONTRATUAIS
create type lancamento_evento_tipo as enum ('criado', 'pago', 'corrigido', 'cancelado');
create type audit_acao            as enum ('insert', 'update', 'delete');

-- ========== Funções utilitárias ==========
create or replace function set_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

-- preenche created_by / updated_by com o usuário autenticado
create or replace function set_actor() returns trigger language plpgsql as $$
begin
  if tg_op = 'INSERT' then new.created_by = auth.uid(); new.updated_by = auth.uid();
  elsif tg_op = 'UPDATE' then new.updated_by = auth.uid();
  end if;
  return new;
end; $$;

-- audit-log genérico (quem / quando / o quê — antes/depois)
create or replace function write_audit() returns trigger language plpgsql security definer as $$
begin
  insert into audit_log(tabela, registro_id, acao, ator, dados_antes, dados_depois)
  values (
    tg_table_name,
    coalesce(new.id, old.id),
    lower(tg_op)::audit_acao,
    auth.uid(),
    case when tg_op in ('UPDATE','DELETE') then to_jsonb(old) end,
    case when tg_op in ('INSERT','UPDATE') then to_jsonb(new) end
  );
  return coalesce(new, old);
end; $$;

-- ========== audit_log (append-only) ==========
create table audit_log (
  id uuid primary key default gen_random_uuid(),
  tabela text not null,
  registro_id uuid,
  acao audit_acao not null,
  ator uuid references auth.users(id) default auth.uid(),
  dados_antes jsonb,
  dados_depois jsonb,
  em timestamptz not null default now()
);
create index on audit_log (tabela, registro_id);

-- ========== profiles ==========
-- Especial: 1:1 com auth.users; CRUD pelo próprio usuário autenticado; sem soft-delete;
-- não auditada (não contém histórico de negócio). Fora dos 3 buckets de política (I1).
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nome text,
  email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ========== imoveis ==========
create table imoveis (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  endereco text,
  matricula text,
  inscricao_imobiliaria text,
  dic text,
  metragem_m2 numeric,
  status imovel_status not null default 'vago',
  doc_ambiental boolean not null default false,
  doc_iptu boolean not null default false,
  doc_condominio boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  deleted_at timestamptz
);

-- ========== inquilinos ==========
-- cpf_cnpj: validação de dígito verificador na aplicação; SEM unicidade (duplicados permitidos).
create table inquilinos (
  id uuid primary key default gen_random_uuid(),
  tipo inquilino_tipo not null,
  nome text not null,
  cpf_cnpj text not null,
  rg text,
  data_nascimento date,
  endereco text,
  email text,
  telefone text,
  responsavel text,
  fiador_nome text,
  fiador_email text,
  fiador_telefone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  deleted_at timestamptz
);

-- ========== locacoes ==========
create table locacoes (
  id uuid primary key default gen_random_uuid(),
  imovel_id uuid not null references imoveis(id),
  inquilino_id uuid not null references inquilinos(id),
  valor_aluguel numeric not null,
  data_inicio date not null,
  data_fim date,                              -- fim da vigência (preenchido ao encerrar)
  data_renovacao date,
  data_reajuste date,
  data_troca_desconto date,
  indice_correcao text,
  dia_vencimento int,                         -- dia padrão de vencimento (1-28); deriva data_vencimento do aluguel (U1)
  status locacao_status not null default 'ativa',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  deleted_at timestamptz
);
create index on locacoes (imovel_id);
create index on locacoes (inquilino_id);
create index on locacoes (status);

-- ========== lancamentos_financeiros ==========
-- A obrigação mensal. Verdade imutável das mudanças vive em lancamento_eventos;
-- status/data_pagamento são CACHE mantido por trigger a partir dos eventos.
create table lancamentos_financeiros (
  id uuid primary key default gen_random_uuid(),
  locacao_id uuid references locacoes(id),
  imovel_id uuid references imoveis(id),
  tipo lancamento_tipo not null,
  competencia date not null,                  -- 1º dia do mês
  valor numeric not null,
  data_vencimento date not null,              -- NOT NULL: necessário p/ alerta financeiro (FR-024)
  status lancamento_status not null default 'pendente',  -- cache (derivado de eventos)
  data_pagamento date,                        -- cache (derivado de eventos)
  responsavel responsavel_pagamento not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users(id),
  constraint escopo_unico check ((locacao_id is not null) <> (imovel_id is not null))
);
create unique index uniq_lanc_locacao on lancamentos_financeiros (locacao_id, tipo, competencia) where locacao_id is not null;
create unique index uniq_lanc_imovel  on lancamentos_financeiros (imovel_id, tipo, competencia)  where imovel_id  is not null;
create index on lancamentos_financeiros (status);
create index on lancamentos_financeiros (data_vencimento);

-- ========== lancamento_eventos (LEDGER IMUTÁVEL, append-only) ==========
create table lancamento_eventos (
  id uuid primary key default gen_random_uuid(),
  lancamento_id uuid not null references lancamentos_financeiros(id),
  tipo lancamento_evento_tipo not null,
  valor numeric,                              -- valor pago/corrigido, quando aplicável
  data_evento date not null default ((now() at time zone 'America/Sao_Paulo')::date),
  observacao text,
  ator uuid references auth.users(id) default auth.uid(),
  created_at timestamptz not null default now()
);
create index on lancamento_eventos (lancamento_id);

-- mantém o cache (status/data_pagamento) do lançamento a partir dos eventos
create or replace function aplicar_evento_lancamento() returns trigger language plpgsql as $$
begin
  update lancamentos_financeiros l set
    status = case new.tipo when 'pago' then 'pago'::lancamento_status
                           when 'cancelado' then 'cancelado'::lancamento_status
                           else l.status end,
    data_pagamento = case when new.tipo = 'pago' then new.data_evento else l.data_pagamento end,
    valor = case when new.tipo = 'corrigido' and new.valor is not null then new.valor else l.valor end,
    updated_at = now()
  where l.id = new.lancamento_id;
  return new;
end; $$;
create trigger t_evt_lanc after insert on lancamento_eventos for each row execute function aplicar_evento_lancamento();

-- ========== arquivos ==========
create table arquivos (
  id uuid primary key default gen_random_uuid(),
  entity_type entidade_arquivo not null,
  entity_id uuid not null,
  nome text not null,
  storage_path text not null,                 -- {entity_type}/{entity_id}/{arquivo}
  mime_type text,
  tamanho bigint,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  deleted_at timestamptz
);
create index on arquivos (entity_type, entity_id);

-- ========== alertas_reconhecimentos (CONTRATUAIS, append-only) ==========
-- Um reconhecimento encerra o alerta de (locacao, tipo, data_alvo). Reajuste exige novo_valor.
create table alertas_reconhecimentos (
  id uuid primary key default gen_random_uuid(),
  locacao_id uuid not null references locacoes(id),
  tipo alerta_tipo not null,
  data_alvo date not null,
  reconhecido_em timestamptz not null default now(),
  reconhecido_por uuid references auth.users(id) default auth.uid(),
  novo_valor numeric,
  constraint reajuste_exige_valor check (tipo <> 'reajuste' or novo_valor is not null),
  unique (locacao_id, tipo, data_alvo)
);
create index on alertas_reconhecimentos (locacao_id);

-- ========== updated_at + actor triggers ==========
create trigger t_imoveis_upd before update on imoveis    for each row execute function set_updated_at();
create trigger t_inq_upd     before update on inquilinos  for each row execute function set_updated_at();
create trigger t_loc_upd     before update on locacoes    for each row execute function set_updated_at();
create trigger t_arq_upd     before update on arquivos    for each row execute function set_updated_at();
create trigger t_prof_upd    before update on profiles    for each row execute function set_updated_at();

create trigger a_imoveis before insert or update on imoveis   for each row execute function set_actor();
create trigger a_inq     before insert or update on inquilinos for each row execute function set_actor();
create trigger a_loc     before insert or update on locacoes   for each row execute function set_actor();
create trigger a_arq     before insert or update on arquivos   for each row execute function set_actor();

-- ========== audit-log triggers (quem/quando/o quê) ==========
create trigger au_imoveis after insert or update or delete on imoveis                 for each row execute function write_audit();
create trigger au_inq     after insert or update or delete on inquilinos              for each row execute function write_audit();
create trigger au_loc     after insert or update or delete on locacoes                for each row execute function write_audit();
create trigger au_arq     after insert or update or delete on arquivos                for each row execute function write_audit();
create trigger au_lanc    after insert or update or delete on lancamentos_financeiros for each row execute function write_audit();

-- ========== status do imóvel (fonte única = trigger) ==========
-- Resolve M7: status ocupado/vago derivado das locações, não por código de app.
create or replace function sincronizar_status_imovel() returns trigger language plpgsql as $$
declare alvo uuid := coalesce(new.imovel_id, old.imovel_id);
begin
  update imoveis i set status = case
    when exists (select 1 from locacoes l where l.imovel_id = alvo and l.status='ativa' and l.deleted_at is null)
    then 'ocupado'::imovel_status else 'vago'::imovel_status end
  where i.id = alvo;
  return null;
end; $$;
create trigger t_status_imovel after insert or update or delete on locacoes
  for each row execute function sincronizar_status_imovel();

-- ========== Views (security_invoker = on → respeitam a RLS do chamador) ==========
-- H3 corrigido. H4/H5: lógica de "vencido/não reconhecido" (catch-up), não igualdade exata.

-- Alertas CONTRATUAIS pendentes: janela aberta (faltam <= 30 dias OU já venceu) e não reconhecidos.
create view vw_alertas_contratuais_pendentes with (security_invoker = on) as
with hoje as (select (now() at time zone 'America/Sao_Paulo')::date as d),
base as (
  select l.id as locacao_id, 'reajuste'::alerta_tipo tipo, l.data_reajuste data_alvo
    from locacoes l where l.status='ativa' and l.deleted_at is null and l.data_reajuste is not null
  union all
  select l.id, 'renovacao', l.data_renovacao
    from locacoes l where l.status='ativa' and l.deleted_at is null and l.data_renovacao is not null
  union all
  select l.id, 'desconto', l.data_troca_desconto
    from locacoes l where l.status='ativa' and l.deleted_at is null and l.data_troca_desconto is not null
)
select b.locacao_id, b.tipo, b.data_alvo,
       (b.data_alvo - h.d) as dias_restantes,
       case when b.data_alvo - h.d <  0 then 'vencido'
            when b.data_alvo - h.d <= 1 then '1'
            when b.data_alvo - h.d <= 7 then '7'
            when b.data_alvo - h.d <= 15 then '15'
            else '30' end as marco
from base b, hoje h
where b.data_alvo - h.d <= 30                 -- janela aberta (inclui já vencidos → catch-up)
  and not exists (
    select 1 from alertas_reconhecimentos r
    where r.locacao_id=b.locacao_id and r.tipo=b.tipo and r.data_alvo=b.data_alvo
  );

-- Alertas FINANCEIROS pendentes (FR-024): lançamentos vencidos ainda não pagos.
-- Auto-encerram quando o lançamento deixa de ser 'pendente'. Não exigem reconhecimento.
create view vw_alertas_financeiros_pendentes with (security_invoker = on) as
select l.id as lancamento_id, l.locacao_id, l.imovel_id, l.tipo, l.competencia,
       l.valor, l.data_vencimento, l.responsavel,
       ((now() at time zone 'America/Sao_Paulo')::date - l.data_vencimento) as dias_em_atraso
from lancamentos_financeiros l
where l.status = 'pendente'
  and l.data_vencimento <= (now() at time zone 'America/Sao_Paulo')::date;

-- ========== RLS ==========
-- Tabelas mutáveis: CRUD para authenticated. Logs imutáveis: apenas INSERT + SELECT.
-- Mutáveis: CRUD completo para authenticated.
do $$
declare t text;
begin
  foreach t in array array['profiles','imoveis','inquilinos','locacoes','lancamentos_financeiros','arquivos']
  loop
    execute format('alter table %I enable row level security;', t);
    execute format($p$create policy "auth_all_%1$s" on %1$I for all to authenticated using (true) with check (true);$p$, t);
  end loop;
end $$;

-- audit_log: SOMENTE leitura para clientes; a escrita vem do trigger write_audit (security definer).
alter table audit_log enable row level security;
create policy "audit_select" on audit_log for select to authenticated using (true);

-- Logs append-only com ATOR NÃO-FORJÁVEL (C1): insert exige ator = auth.uid(); sem update/delete.
alter table lancamento_eventos enable row level security;
create policy "evt_select" on lancamento_eventos for select to authenticated using (true);
create policy "evt_insert" on lancamento_eventos for insert to authenticated with check (ator = auth.uid());

alter table alertas_reconhecimentos enable row level security;
create policy "ack_select" on alertas_reconhecimentos for select to authenticated using (true);
create policy "ack_insert" on alertas_reconhecimentos for insert to authenticated with check (reconhecido_por = auth.uid());

-- ========== Storage (L2 corrigido: explícito no contrato) ==========
insert into storage.buckets (id, name, public) values ('arquivos', 'arquivos', false)
  on conflict (id) do nothing;
create policy "arquivos_auth_select" on storage.objects for select to authenticated using (bucket_id = 'arquivos');
create policy "arquivos_auth_insert" on storage.objects for insert to authenticated with check (bucket_id = 'arquivos');
create policy "arquivos_auth_update" on storage.objects for update to authenticated using (bucket_id = 'arquivos');
create policy "arquivos_auth_delete" on storage.objects for delete to authenticated using (bucket_id = 'arquivos');
