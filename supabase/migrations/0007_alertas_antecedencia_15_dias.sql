-- Antecedência dos alertas contratuais (reajuste/renovação/desconto): 30 → 15 dias.
-- Antes o painel/modal avisava com até 30 dias; agora só a partir de 15 dias antes.
create or replace view public.vw_alertas_contratuais_pendentes as
with hoje as (
  select (now() at time zone 'America/Sao_Paulo')::date as d
), base as (
  select l.id as locacao_id, 'reajuste'::alerta_tipo as tipo, l.data_reajuste as data_alvo
    from public.locacoes l
   where l.status = 'ativa' and l.deleted_at is null and l.data_reajuste is not null
  union all
  select l.id, 'renovacao'::alerta_tipo, l.data_renovacao
    from public.locacoes l
   where l.status = 'ativa' and l.deleted_at is null and l.data_renovacao is not null
  union all
  select l.id, 'desconto'::alerta_tipo, l.data_troca_desconto
    from public.locacoes l
   where l.status = 'ativa' and l.deleted_at is null and l.data_troca_desconto is not null
)
select
  b.locacao_id,
  b.tipo,
  b.data_alvo,
  b.data_alvo - h.d as dias_restantes,
  case
    when (b.data_alvo - h.d) < 0 then 'vencido'
    when (b.data_alvo - h.d) <= 1 then '1'
    when (b.data_alvo - h.d) <= 7 then '7'
    else '15'
  end as marco
from base b, hoje h
where (b.data_alvo - h.d) <= 15
  and not exists (
    select 1 from public.alertas_reconhecimentos r
    where r.locacao_id = b.locacao_id and r.tipo = b.tipo and r.data_alvo = b.data_alvo
  );
