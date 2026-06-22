import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/domain/page-header";
import { ImovelForm } from "../../imovel-form";

export default async function EditarImovelPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: imovel } = await supabase
    .from("imoveis")
    .select("*")
    .eq("id", id)
    .is("deleted_at", null)
    .maybeSingle();
  if (!imovel) notFound();

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <PageHeader title="Editar imóvel" description={imovel.nome} />
      <ImovelForm imovel={imovel} />
    </div>
  );
}
