import { createClient } from "@/lib/supabase/server";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Pendencias } from "./pendencias";

export default async function DashboardPage() {
  const supabase = await createClient();

  const [imoveis, inquilinos, locacoes] = await Promise.all([
    supabase.from("imoveis").select("*", { count: "exact", head: true }).is("deleted_at", null),
    supabase.from("inquilinos").select("*", { count: "exact", head: true }).is("deleted_at", null),
    supabase
      .from("locacoes")
      .select("*", { count: "exact", head: true })
      .eq("status", "ativa")
      .is("deleted_at", null),
  ]);

  const cards = [
    { label: "Imóveis", value: imoveis.count ?? 0 },
    { label: "Inquilinos", value: inquilinos.count ?? 0 },
    { label: "Locações ativas", value: locacoes.count ?? 0 },
  ];

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Painel</h1>
      <div className="grid gap-4 sm:grid-cols-3">
        {cards.map((c) => (
          <Card key={c.label}>
            <CardHeader>
              <CardTitle className="text-3xl">{c.value}</CardTitle>
              <p className="text-sm text-muted-foreground">{c.label}</p>
            </CardHeader>
          </Card>
        ))}
      </div>
      <Pendencias />
    </div>
  );
}
