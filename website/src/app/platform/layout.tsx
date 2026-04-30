import type { Metadata } from "next";
import type { ReactNode } from "react";
import { PlatformSidebar } from "@/components/platform/PlatformSidebar";

export const metadata: Metadata = {
  title: "Gym — Plataforma",
  robots: { index: false, follow: false },
};

export default function PlatformLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen">
      <PlatformSidebar />
      <div className="pl-[248px] max-[980px]:pl-0 flex flex-col min-h-screen">
        {children}
      </div>
    </div>
  );
}
