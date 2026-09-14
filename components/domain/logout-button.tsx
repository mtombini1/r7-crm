"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

export function LogoutButton() {
  const router = useRouter();

  async function logout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    // Reseta o marcador para que os alertas reapareçam no próximo acesso.
    document.cookie = "alertas_checados=; Max-Age=0; path=/";
    router.push("/login");
    router.refresh();
  }

  return (
    <Button variant="ghost" size="sm" onClick={logout}>
      Sair
    </Button>
  );
}
