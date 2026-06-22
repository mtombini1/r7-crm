import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/domain/page-header";
import { LocacaoForm } from "../locacao-form";

export default async function NovaLocacaoPage() {
  const supabase = await createClient();

  const [{ data: imoveis }, { data: inquilinos }] = await Promise.all([
    supabase
      .from("imoveis")
      .select("id, nome")
      .eq("status", "vago")
      .is("deleted_at", null)
      .order("nome"),
    supabase.from("inquilinos").select("id, nome").is("deleted_at", null).order("nome"),
  ]);

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <PageHeader title="Nova locação" description="Registre um novo vínculo imóvel ↔ inquilino" />
      <LocacaoForm imoveis={imoveis ?? []} inquilinos={inquilinos ?? []} />
    </div>
  );
}
