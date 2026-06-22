import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/domain/page-header";
import { EmptyState } from "@/components/domain/empty-state";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default async function ImoveisPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const supabase = await createClient();

  let query = supabase.from("imoveis").select("*").is("deleted_at", null).order("nome");
  if (q) query = query.ilike("nome", `%${q}%`);
  const { data: imoveis } = await query;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Imóveis"
        description="Cadastro e gestão dos imóveis"
        action={
          <Link href="/imoveis/novo" className={buttonVariants()}>
            Novo imóvel
          </Link>
        }
      />

      <form>
        <Input name="q" defaultValue={q ?? ""} placeholder="Buscar por nome..." className="max-w-xs" />
      </form>

      {!imoveis?.length ? (
        <EmptyState
          title="Nenhum imóvel encontrado"
          description="Comece cadastrando o primeiro imóvel."
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Endereço</TableHead>
              <TableHead>Matrícula</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Docs</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {imoveis.map((im) => {
              const docs = [im.doc_ambiental, im.doc_iptu, im.doc_condominio].filter(Boolean).length;
              return (
                <TableRow key={im.id}>
                  <TableCell>
                    <Link
                      href={`/imoveis/${im.id}`}
                      className="font-medium text-primary hover:underline"
                    >
                      {im.nome}
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{im.endereco || "—"}</TableCell>
                  <TableCell className="text-muted-foreground">{im.matricula || "—"}</TableCell>
                  <TableCell>
                    <Badge variant={im.status === "ocupado" ? "success" : "muted"}>
                      {im.status === "ocupado" ? "Ocupado" : "Vago"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">{docs}/3</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
