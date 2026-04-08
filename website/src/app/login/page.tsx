import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { LoginClient } from "./LoginClient";

export const metadata: Metadata = pageMetadata({
  title: "Entrar",
  description:
    "Acesse o painel administrativo da sua academia. Login seguro via e-mail e senha ou SSO.",
  path: "/login",
  noIndex: true,
});

export default function LoginPage() {
  return <LoginClient />;
}
