-- Campo de observações (texto livre) em imóveis, inquilinos e locações.
-- Vaga de garagem (só em imóveis): flag + dados próprios da vaga (sem m²).
alter table public.imoveis
  add column if not exists observacoes text,
  add column if not exists tem_vaga boolean not null default false,
  add column if not exists vaga_quantidade int,
  add column if not exists vaga_matricula text,
  add column if not exists vaga_inscricao_imobiliaria text,
  add column if not exists vaga_dic text;

alter table public.inquilinos add column if not exists observacoes text;
alter table public.locacoes  add column if not exists observacoes text;
