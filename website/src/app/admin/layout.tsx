import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Toaster } from "sonner";
import { Sidebar } from "@/components/admin/Sidebar";
import { MobileNav } from "@/components/admin/MobileNav";
import { AcademyThemeProvider } from "@/components/admin/AcademyThemeProvider";

export const metadata: Metadata = {
  title: "Painel administrativo",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <AcademyThemeProvider>
      <div className="min-h-screen">
        <Sidebar />
        <MobileNav />
        <div className="pl-[248px] max-[980px]:pl-0 flex flex-col min-h-screen">
          {children}
        </div>
        <Toaster position="bottom-right" richColors closeButton />
      </div>
    </AcademyThemeProvider>
  );
}
