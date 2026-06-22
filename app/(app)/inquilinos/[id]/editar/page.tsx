import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/domain/page-header";
import { InquilinoForm } from "../../inquilino-form";

export default async function EditarInquilinoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: inquilino } = await supabase
    .from("inquilinos")
    .select("*")
    .eq("id", id)
    .is("deleted_at", null)
    .maybeSingle();
  if (!inquilino) notFound();

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <PageHeader title="Editar inquilino" description={inquilino.nome} />
      <InquilinoForm inquilino={inquilino} />
    </div>
  );
}
