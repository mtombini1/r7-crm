import { redirect } from "next/navigation";

export default function Home() {
  // A área autenticada vive em /dashboard; o middleware redireciona para /login se necessário.
  redirect("/dashboard");
}
