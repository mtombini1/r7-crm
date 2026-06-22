import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/domain/page-header";
import { LocacaoForm } from "../../locacao-form";

export default async function EditarLocacaoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: locacao } = await supabase
    .from("locacoes")
    .select("*")
    .eq("id", id)
    .is("deleted_at", null)
    .maybeSingle();
  if (!locacao) notFound();

  const [{ data: vagos }, { data: atual }, { data: inquilinos }] = await Promise.all([
    supabase
      .from("imoveis")
      .select("id, nome")
      .eq("status", "vago")
      .is("deleted_at", null)
      .order("nome"),
    supabase.from("imoveis").select("id, nome").eq("id", locacao.imovel_id).maybeSingle(),
    supabase.from("inquilinos").select("id, nome").is("deleted_at", null).order("nome"),
  ]);

  const imoveis = [...(vagos ?? [])];
  if (atual && !imoveis.some((im) => im.id === atual.id)) imoveis.unshift(atual);

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <PageHeader title="Editar locação" description="Atualize os dados da locação" />
      <LocacaoForm locacao={locacao} imoveis={imoveis} inquilinos={inquilinos ?? []} />
    </div>
  );
}
