import type { Metadata } from "next";
import { ActivateClient } from "./ActivateClient";

// Utility page (not marketing) — keep it out of the index.
export const metadata: Metadata = {
  title: "Ativar conta — Gym",
  description: "Complete seu cadastro e crie sua senha de acesso.",
  robots: { index: false, follow: false },
};

export default function AtivarPage() {
  return <ActivateClient />;
}
