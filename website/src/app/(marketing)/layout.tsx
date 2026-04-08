import type { ReactNode } from "react";
import { Nav } from "@/components/marketing/Nav";
import { MarketingFooter } from "@/components/marketing/Footer";

export default function MarketingLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <>
      <Nav />
      <main className="flex-1">{children}</main>
      <MarketingFooter />
    </>
  );
}
