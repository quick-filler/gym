"use client";

import { useEffect, useState } from "react";
import { Topbar } from "@/components/admin/Topbar";
import { PageHeader } from "@/components/admin/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Field, Input } from "@/components/ui/Field";
import { Icon } from "@/components/ui/Icon";
import { useAcademy } from "@/lib/hooks";
import { cn } from "@/lib/utils";
import { APP_DOMAIN } from "@/lib/config";

type Tab = "identity" | "appearance" | "integration";

export default function SettingsPage() {
  const { data, loading, error } = useAcademy();
  const [tab, setTab] = useState<Tab>("identity");
  const [form, setForm] = useState<typeof data>(null);

  useEffect(() => {
    if (data) setForm(data);
  }, [data]);

  function update<K extends keyof NonNullable<typeof form>>(
    key: K,
    value: NonNullable<typeof form>[K],
  ) {
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev));
  }

  return (
    <>
      <Topbar title="Configurações" />
      <main className="flex-1 p-8 max-[720px]:p-4">
        <PageHeader
          title="Configurações"
          subtitle="Identidade · Aparência · Integração"
        />

        {loading && <div className="text-ink-400">Carregando…</div>}
        {error && <div className="text-rose">{error.message}</div>}

        {form && (
          <>
            {/* Tabs */}
            <div className="flex items-center gap-1 border-b border-line mb-8">
              {(
                [
                  { key: "identity", label: "Identidade" },
                  { key: "appearance", label: "Aparência" },
                  { key: "integration", label: "Integração" },
                ] as const
              ).map((t) => (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={cn(
                    "px-5 py-3 text-[0.9rem] font-medium transition-colors border-b-2 -mb-px",
                    tab === t.key
                      ? "text-flame border-flame"
                      : "text-ink-500 border-transparent hover:text-ink-900",
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-[1.5fr_1fr] gap-8 max-[980px]:grid-cols-1">
              <div>
                {tab === "identity" && (
                  <Card>
                    <h3 className="font-display text-[1.1rem] font-semibold text-ink-900 mb-1">
                      Identidade da academia
                    </h3>
                    <p className="text-[0.88rem] text-ink-500 mb-6">
                      Estes dados aparecem no painel admin e no app do aluno.
                    </p>
                    <Field label="Logo">
                      <div className="border-2 border-dashed border-line-strong rounded-2xl p-8 flex flex-col items-center justify-center text-center hover:border-ink-900 transition-colors cursor-pointer">
                        <div className="w-12 h-12 rounded-xl bg-paper-2 flex items-center justify-center text-ink-600 mb-3">
                          <Icon name="upload" size="lg" />
                        </div>
                        <div className="text-[0.88rem] font-semibold text-ink-900">
                          Arraste ou clique para enviar
                        </div>
                        <div className="text-[0.76rem] text-ink-400 mt-1">
                          PNG ou SVG, mínimo 256×256px
                        </div>
                      </div>
                    </Field>
                    <Field label="Nome da academia">
                      <Input
                        value={form.name}
                        onChange={(e) => update("name", e.target.value)}
                      />
                    </Field>
                    <div className="grid grid-cols-2 gap-4 max-[720px]:grid-cols-1">
                      <Field label="E-mail">
                        <Input
                          type="email"
                          value={form.email}
                          onChange={(e) => update("email", e.target.value)}
                        />
                      </Field>
                      <Field label="Telefone">
                        <Input
                          type="tel"
                          value={form.phone}
                          onChange={(e) => update("phone", e.target.value)}
                        />
                      </Field>
                    </div>
                    <Field label="Endereço">
                      <Input
                        value={form.address}
                        onChange={(e) => update("address", e.target.value)}
                      />
                    </Field>
                  </Card>
                )}

                {tab === "appearance" && (
                  <Card>
                    <h3 className="font-display text-[1.1rem] font-semibold text-ink-900 mb-1">
                      Aparência e white-label
                    </h3>
                    <p className="text-[0.88rem] text-ink-500 mb-6">
                      Defina as cores e o subdomínio usados no app do aluno.
                    </p>
                    <div className="grid grid-cols-2 gap-4 max-[720px]:grid-cols-1">
                      <Field label="Cor primária">
                        <div className="flex items-center gap-3 p-3 rounded-xl border border-line-strong bg-white">
                          <input
                            type="color"
                            value={form.primaryColor}
                            onChange={(e) =>
                              update("primaryColor", e.target.value)
                            }
                            className="w-10 h-10 rounded-lg border-0 cursor-pointer"
                          />
                          <input
                            type="text"
                            value={form.primaryColor}
                            onChange={(e) =>
                              update("primaryColor", e.target.value)
                            }
                            className="flex-1 bg-transparent border-0 font-mono text-[0.88rem] text-ink-900 outline-none uppercase"
                          />
                        </div>
                      </Field>
                      <Field label="Cor secundária">
                        <div className="flex items-center gap-3 p-3 rounded-xl border border-line-strong bg-white">
                          <input
                            type="color"
                            value={form.secondaryColor}
                            onChange={(e) =>
                              update("secondaryColor", e.target.value)
                            }
                            className="w-10 h-10 rounded-lg border-0 cursor-pointer"
                          />
                          <input
                            type="text"
                            value={form.secondaryColor}
                            onChange={(e) =>
                              update("secondaryColor", e.target.value)
                            }
                            className="flex-1 bg-transparent border-0 font-mono text-[0.88rem] text-ink-900 outline-none uppercase"
                          />
                        </div>
                      </Field>
                    </div>
                    <Field label="Subdomínio do app">
                      <div className="flex items-center rounded-xl border border-line-strong bg-white overflow-hidden">
                        <input
                          type="text"
                          value={form.slug}
                          onChange={(e) => update("slug", e.target.value)}
                          className="flex-1 px-4 py-[0.85rem] text-[0.95rem] text-ink-900 outline-none"
                        />
                        <div className="font-mono text-[0.88rem] text-ink-400 px-4 py-[0.85rem] bg-paper-50 border-l border-line">
                          .{APP_DOMAIN}
                        </div>
                      </div>
                    </Field>
                  </Card>
                )}

                {tab === "integration" && (
                  <Card>
                    <h3 className="font-display text-[1.1rem] font-semibold text-ink-900 mb-1">
                      Integrações
                    </h3>
                    <p className="text-[0.88rem] text-ink-500 mb-6">
                      Conexões com serviços externos.
                    </p>
                    <div className="flex flex-col gap-4">
                      {[
                        {
                          name: "Asaas",
                          desc: "Gateway de pagamento (PIX, boleto, cartão)",
                          connected: true,
                          tone: "emerald",
                        },
                        {
                          name: "WhatsApp Business",
                          desc: "Notificações de cobrança e check-in",
                          connected: true,
                          tone: "emerald",
                        },
                        {
                          name: "Google Analytics",
                          desc: "Métricas do site público",
                          connected: false,
                          tone: "ink",
                        },
                      ].map((int) => (
                        <div
                          key={int.name}
                          className="flex items-center justify-between p-4 rounded-xl border border-line bg-paper-50"
                        >
                          <div>
                            <div className="font-semibold text-ink-900">
                              {int.name}
                            </div>
                            <div className="text-[0.82rem] text-ink-500 mt-1">
                              {int.desc}
                            </div>
                          </div>
                          <Button variant={int.connected ? "line" : "ink"}>
                            {int.connected ? "Gerenciar" : "Conectar"}
                          </Button>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}

                <div className="flex items-center justify-end gap-3 mt-6">
                  <Button variant="line">Cancelar</Button>
                  <Button variant="ink">Salvar alterações</Button>
                </div>
              </div>

              {/* Preview side */}
              <aside className="sticky top-24 self-start max-[980px]:static">
                <div className="font-mono text-[0.7rem] uppercase tracking-[0.1em] text-ink-400 mb-3">
                  Preview do app
                </div>
                <div
                  className="rounded-[2.5rem] bg-ink-900 p-2 shadow-[var(--shadow-gym-3)] mx-auto"
                  style={{ maxWidth: 280 }}
                >
                  <div
                    className="rounded-[2rem] overflow-hidden"
                    style={{ aspectRatio: "9/19.5" }}
                  >
                    <div
                      className="h-[32%] p-5 text-white flex flex-col justify-end"
                      style={{
                        background: `linear-gradient(135deg, ${form.primaryColor}, ${form.secondaryColor})`,
                      }}
                    >
                      <div className="font-mono text-[0.6rem] uppercase tracking-[0.12em] opacity-85">
                        {form.name}
                      </div>
                      <div className="font-display text-[1.3rem] font-semibold mt-1">
                        Bem-vindo, João
                      </div>
                    </div>
                    <div className="bg-white h-[68%] p-5 flex flex-col gap-3">
                      {[
                        ["Próxima aula", "Hoje, 18:00"],
                        ["Plano", "Mensal"],
                        ["Vencimento", "15/05"],
                      ].map(([label, value]) => (
                        <div
                          key={label}
                          className="flex items-center justify-between pb-3 border-b border-line/60 text-[0.78rem]"
                        >
                          <span className="text-ink-400">{label}</span>
                          <span className="text-ink-900 font-semibold">
                            {value}
                          </span>
                        </div>
                      ))}
                      <button
                        className="mt-auto w-full py-3 rounded-full text-white font-medium text-[0.82rem]"
                        style={{ background: form.primaryColor }}
                      >
                        Reservar próxima aula
                      </button>
                    </div>
                  </div>
                </div>
                <div className="text-center mt-3 font-mono text-[0.72rem] text-ink-400">
                  {form.slug}.{APP_DOMAIN}
                </div>
              </aside>
            </div>
          </>
        )}
      </main>
    </>
  );
}
