"use client";

import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import { JWT_STORAGE_KEY } from "@/lib/config";

export function Topbar({ title }: { title: string }) {
  const router = useRouter();

  function handleLogout() {
    localStorage.removeItem(JWT_STORAGE_KEY);
    router.push("/login");
  }

  return (
    <header className="sticky top-0 z-40 h-16 bg-paper/85 backdrop-blur-xl border-b border-line flex items-center gap-4 px-8 max-[720px]:px-4">
      <h1 className="font-display text-[1.2rem] font-semibold text-ink-900 shrink-0">
        {title}
      </h1>
      <div className="flex-1 max-w-[360px]">
        <div className="relative">
          <Icon
            name="search"
            className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400"
            size="lg"
          />
          <input
            type="text"
            placeholder="Buscar alunos, pagamentos…"
            className="w-full pl-10 pr-4 py-2 rounded-full bg-paper-2 border border-transparent text-[0.88rem] text-ink-900 placeholder:text-ink-400 focus:outline-none focus:border-ink-900 focus:bg-white transition-all"
          />
        </div>
      </div>
      <div className="flex-1" />
      <button
        className="relative w-10 h-10 rounded-full bg-paper-2 hover:bg-paper-3 text-ink-700 flex items-center justify-center transition-colors"
        aria-label="Notificações"
      >
        <Icon name="bell" size="lg" />
        <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-flame" />
      </button>
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-flame to-flame-dark text-white flex items-center justify-center font-mono text-[0.78rem] font-semibold">
        GD
      </div>
      <button
        onClick={handleLogout}
        aria-label="Sair"
        title="Sair"
        className="min-[981px]:hidden w-10 h-10 rounded-full bg-paper-2 hover:bg-paper-3 text-ink-500 hover:text-rose flex items-center justify-center transition-colors"
      >
        <Icon name="log-out" size="lg" />
      </button>
    </header>
  );
}
