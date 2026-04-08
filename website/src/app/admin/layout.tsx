import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Sidebar } from "@/components/admin/Sidebar";

export const metadata: Metadata = {
  title: "Painel administrativo",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen">
      <Sidebar />
      <div className="pl-[248px] max-[980px]:pl-0 flex flex-col min-h-screen">
        {children}
      </div>
    </div>
  );
}
