-- Hardening pós-advisors de segurança:
-- (1) search_path fixo nas funções (evita injeção via search_path);
-- (2) revoga EXECUTE do trigger write_audit (não deve ser chamável via RPC).
alter function public.set_updated_at() set search_path = public, pg_temp;
alter function public.set_actor() set search_path = public, pg_temp;
alter function public.write_audit() set search_path = public, pg_temp;
alter function public.aplicar_evento_lancamento() set search_path = public, pg_temp;
alter function public.sincronizar_status_imovel() set search_path = public, pg_temp;
revoke execute on function public.write_audit() from public, anon, authenticated;
