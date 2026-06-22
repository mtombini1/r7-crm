import { PageHeader } from "@/components/domain/page-header";
import { ImovelForm } from "../imovel-form";

export default function NovoImovelPage() {
  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <PageHeader title="Novo imóvel" description="Cadastre um novo imóvel" />
      <ImovelForm />
    </div>
  );
}
