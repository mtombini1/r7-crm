import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LogoutButton } from "@/components/domain/logout-button";
import { AlertaModal } from "@/components/domain/alerta-modal";
import { getAlertasPendentes } from "@/lib/alertas/queries";

const nav = [
  { href: "/dashboard", label: "Painel" },
  { href: "/imoveis", label: "Imóveis" },
  { href: "/inquilinos", label: "Inquilinos" },
  { href: "/locacoes", label: "Locações" },
  { href: "/auditoria", label: "Auditoria" },
];

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { contratuais, financeiros } = await getAlertasPendentes();

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4">
          <div className="flex items-center gap-6">
            <span className="font-semibold">R7 CRM</span>
            <nav className="flex items-center gap-1">
              {nav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-muted-foreground sm:inline">{user.email}</span>
            <LogoutButton />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
      <AlertaModal contratuais={contratuais} financeiros={financeiros} />
    </div>
  );
}
