"use client";

import { Topbar } from "@/components/admin/Topbar";
import { PageHeader } from "@/components/admin/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { Pill } from "@/components/ui/Pill";
import type { Dependent, DependentStatus, GuardianFamily } from "@/lib/types";
import { useDependents } from "@/lib/hooks";

function DependentStatusPill({ status }: { status: DependentStatus }) {
  if (status === "active") return <Pill tone="emerald">ATIVO</Pill>;
  if (status === "pending") return <Pill tone="amber">PENDENTE</Pill>;
  return <Pill tone="ink">INATIVO</Pill>;
}

function DependentRow({ dep }: { dep: Dependent }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-paper-50">
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center text-lg shrink-0 bg-paper-2"
        aria-hidden
      >
        {dep.gender === "girl" ? "👧" : "👦"}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-ink-900 text-[0.9rem] truncate">
          {dep.name}
        </div>
        <div className="font-mono text-[0.68rem] text-ink-400 truncate mt-0.5">
          {dep.age} anos · {dep.className} · {dep.classTime}
        </div>
      </div>
      <div className="flex flex-col items-end gap-1.5 shrink-0">
        <DependentStatusPill status={dep.status} />
        {dep.medicalAlert && (
          <span className="inline-flex items-center gap-1 text-[0.66rem] font-semibold bg-sky-50 text-sky px-2 py-0.5 rounded-md">
            <Icon name="shield" /> {dep.medicalAlert}
          </span>
        )}
      </div>
    </div>
  );
}

function FamilyCard({ family }: { family: GuardianFamily }) {
  const count = family.dependents.length;
  return (
    <Card className="p-0 overflow-hidden flex flex-col">
      <div className="flex items-center gap-3.5 p-5 border-b border-line">
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-mono text-[0.82rem] font-semibold shrink-0"
          style={{ background: family.guardian.avatarGradient }}
        >
          {family.guardian.initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-ink-900 text-[0.95rem] truncate">
            {family.guardian.name}
          </div>
          <div className="font-mono text-[0.68rem] text-ink-400 truncate mt-0.5">
            {family.guardian.email} · {family.guardian.phone}
          </div>
        </div>
        <Pill tone="flame">
          {count} {count === 1 ? "dep." : "deps."}
        </Pill>
      </div>

      <div className="p-5 flex flex-col gap-3 flex-1">
        {family.dependents.map((dep) => (
          <DependentRow key={dep.id} dep={dep} />
        ))}
        <button
          type="button"
          className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-paper-50 border-[1.5px] border-dashed border-line-strong text-ink-400 font-mono text-[0.72rem] uppercase tracking-[0.08em] font-semibold hover:border-flame hover:text-flame hover:bg-flame-50 transition-colors"
        >
          <Icon name="plus" /> Adicionar dependente
        </button>
      </div>

      <div className="flex items-center gap-2 p-4 border-t border-line bg-paper-50">
        <button className="font-mono text-[0.72rem] uppercase tracking-[0.08em] font-semibold text-white bg-ink-900 hover:bg-ink-700 transition-colors px-3 py-2 rounded-lg">
          Pagamentos
        </button>
        <button className="font-mono text-[0.72rem] uppercase tracking-[0.08em] font-semibold text-ink-900 border border-ink-900 hover:bg-ink-900 hover:text-paper transition-colors px-3 py-2 rounded-lg">
          Editar
        </button>
        <button className="font-mono text-[0.72rem] uppercase tracking-[0.08em] font-semibold text-ink-500 hover:text-ink-900 transition-colors px-3 py-2 rounded-lg">
          Histórico
        </button>
      </div>
    </Card>
  );
}

export default function DependentsPage() {
  const { data, loading, error } = useDependents();

  const totalDeps = data?.reduce((acc, f) => acc + f.dependents.length, 0) ?? 0;

  return (
    <>
      <Topbar title="Dependentes" />
      <main className="flex-1 p-8 max-[720px]:p-4">
        <PageHeader
          title="Famílias cadastradas"
          subtitle={
            data
              ? `${data.length} famílias · ${totalDeps} dependentes`
              : undefined
          }
          actions={
            <Button variant="ink">
              <Icon name="plus" /> Novo responsável
            </Button>
          }
        />

        {loading && <div className="text-ink-400">Carregando…</div>}
        {error && <div className="text-rose">{error.message}</div>}

        {data && (
          <>
            <div className="flex items-center gap-4 px-5 py-4 rounded-2xl bg-flame-50 border border-flame-100 mb-6">
              <div className="w-10 h-10 rounded-xl bg-flame/15 text-flame flex items-center justify-center shrink-0">
                <Icon name="users" size="lg" />
              </div>
              <p className="text-[0.88rem] text-ink-700 leading-relaxed">
                <strong className="font-semibold text-ink-900">
                  Módulo de dependentes ativo.
                </strong>{" "}
                O responsável faz login e gerencia todos os dependentes num só
                lugar. Cobranças podem ser{" "}
                <strong className="font-semibold">por dependente</strong> ou{" "}
                <strong className="font-semibold">por família</strong> — ajuste
                em Configurações.
              </p>
            </div>

            <div className="grid grid-cols-[repeat(auto-fill,minmax(340px,1fr))] gap-5 max-[720px]:grid-cols-1">
              {data.map((family) => (
                <FamilyCard key={family.id} family={family} />
              ))}
            </div>
          </>
        )}
      </main>
    </>
  );
}
