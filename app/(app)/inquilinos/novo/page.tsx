import { PageHeader } from "@/components/domain/page-header";
import { InquilinoForm } from "../inquilino-form";

export default function NovoInquilinoPage() {
  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <PageHeader title="Novo inquilino" description="Cadastre um novo inquilino" />
      <InquilinoForm />
    </div>
  );
}
