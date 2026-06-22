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

export default async function InquilinosPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const supabase = await createClient();

  let query = supabase.from("inquilinos").select("*").is("deleted_at", null).order("nome");
  if (q) query = query.ilike("nome", `%${q}%`);
  const { data: inquilinos } = await query;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Inquilinos"
        description="Cadastro e gestão dos inquilinos"
        action={
          <Link href="/inquilinos/novo" className={buttonVariants()}>
            Novo inquilino
          </Link>
        }
      />

      <form>
        <Input name="q" defaultValue={q ?? ""} placeholder="Buscar por nome..." className="max-w-xs" />
      </form>

      {!inquilinos?.length ? (
        <EmptyState
          title="Nenhum inquilino encontrado"
          description="Comece cadastrando o primeiro inquilino."
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>CPF/CNPJ</TableHead>
              <TableHead>Telefone</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {inquilinos.map((inq) => (
              <TableRow key={inq.id}>
                <TableCell>
                  <Link
                    href={`/inquilinos/${inq.id}`}
                    className="font-medium text-primary hover:underline"
                  >
                    {inq.nome}
                  </Link>
                </TableCell>
                <TableCell>
                  <Badge variant={inq.tipo === "pj" ? "default" : "muted"}>
                    {inq.tipo === "pj" ? "PJ" : "PF"}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">{inq.cpf_cnpj}</TableCell>
                <TableCell className="text-muted-foreground">{inq.telefone || "—"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
