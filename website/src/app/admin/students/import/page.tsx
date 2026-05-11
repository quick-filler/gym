"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useApolloClient, useMutation } from "@apollo/client/react";
import { graphql } from "@/gql";
import { Topbar } from "@/components/admin/Topbar";
import { PageHeader } from "@/components/admin/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { Pill } from "@/components/ui/Pill";
import { LoadingState } from "@/components/ui/LoadingState";
import { USE_MOCKS } from "@/lib/config";
import {
  type ImportRow,
  mapSheet,
  pickBestSheet,
  toMutationInput,
} from "@/lib/import-students";
import { cn } from "@/lib/utils";

const BULK_IMPORT = graphql(`
  mutation AdminBulkImportStudents(
    $rows: [StudentImportRow!]!
    $dryRun: Boolean
  ) {
    bulkImportStudents(rows: $rows, dryRun: $dryRun) {
      created
      skipped
      errors
      items {
        rowNumber
        status
        studentDocumentId
        dependentDocumentId
        message
      }
    }
  }
`);

type Step = "upload" | "preview" | "result";

type ImportItem = {
  rowNumber: number;
  status: string;
  studentDocumentId?: string | null;
  dependentDocumentId?: string | null;
  message?: string | null;
};

type ImportResult = {
  created: number;
  skipped: number;
  errors: number;
  items: ImportItem[];
};

export default function ImportStudentsPage() {
  const [step, setStep] = useState<Step>("upload");
  const [fileName, setFileName] = useState<string | null>(null);
  const [rows, setRows] = useState<ImportRow[]>([]);
  const [parseError, setParseError] = useState<string | null>(null);
  const [parsing, setParsing] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const apollo = useApolloClient();
  const [bulkImport, { loading: importing }] = useMutation(BULK_IMPORT);

  const counts = useMemo(() => {
    let valid = 0;
    let withWarnings = 0;
    let withErrors = 0;
    let families = 0;
    for (const r of rows) {
      if (r._errors.length > 0) withErrors++;
      else valid++;
      if (r._warnings.length > 0) withWarnings++;
      if (r.kind === "family") families++;
    }
    return { valid, withWarnings, withErrors, families, total: rows.length };
  }, [rows]);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setParseError(null);
    setParsing(true);
    try {
      const XLSX = await import("xlsx");
      const buffer = await file.arrayBuffer();
      // cellDates: true devolve Date objects para células de data; raw: true
      // mantém o Date intacto (raw: false + dateNF é ignorado pelo sheetjs e
      // formataria como M/D/YY US, invertendo dia/mês). brDateToIso aceita
      // Date direto.
      const wb = XLSX.read(buffer, { type: "array", cellDates: true });
      const sheets = wb.SheetNames.map((n) => {
        const sheet = wb.Sheets[n];
        const matrix = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
          header: 1,
          defval: "",
          raw: true,
        });
        return { name: n, matrix };
      });
      const best = pickBestSheet(sheets);
      if (!best || best.header.matched === 0) {
        throw new Error(
          "Nenhuma aba tem cabeçalhos reconhecidos (prospect_nome, responsavel_nome, etc.).",
        );
      }
      const parsed = mapSheet(best.sheet.matrix as unknown[][]);
      if (parsed.length === 0) {
        throw new Error(
          "Cabeçalho encontrado, mas nenhuma linha de dado abaixo dele.",
        );
      }
      setFileName(file.name);
      setRows(parsed);
      setStep("preview");
    } catch (err) {
      setParseError(
        err instanceof Error ? err.message : "Erro ao ler a planilha.",
      );
    } finally {
      setParsing(false);
      e.target.value = "";
    }
  }

  async function handleConfirm() {
    const payload = toMutationInput(rows);
    if (USE_MOCKS) {
      const mockItems: ImportItem[] = payload.map((p) => ({
        rowNumber: p.rowNumber ?? 0,
        status: "created",
        studentDocumentId: `mock-${p.rowNumber}`,
        dependentDocumentId: p.kind === "family" ? `mock-dep-${p.rowNumber}` : null,
      }));
      setResult({
        created: payload.length,
        skipped: 0,
        errors: 0,
        items: mockItems,
      });
      setStep("result");
      return;
    }
    try {
      const { data } = await bulkImport({
        variables: { rows: payload as never, dryRun: false },
      });
      const r = (data as any)?.bulkImportStudents as ImportResult | undefined;
      if (!r) throw new Error("Resposta vazia da API.");
      setResult(r);
      setStep("result");
      apollo.refetchQueries({ include: ["Students"] });
    } catch (err) {
      setParseError(
        err instanceof Error ? err.message : "Erro ao importar alunos.",
      );
    }
  }

  function reset() {
    setStep("upload");
    setRows([]);
    setFileName(null);
    setResult(null);
    setParseError(null);
  }

  return (
    <>
      <Topbar title="Importar alunos" />
      <main className="flex-1 p-8 max-[720px]:p-4">
        <PageHeader
          title="Importar alunos por planilha"
          subtitle="Aceita .xlsx no formato de cadastro padrão (colunas prospect_*, responsavel_*, endereco_*)."
          actions={
            <Link
              href="/admin/students"
              className="text-[0.85rem] text-ink-500 hover:text-ink-900 transition-colors"
            >
              ← Voltar para alunos
            </Link>
          }
        />

        <Stepper step={step} />

        {step === "upload" && (
          <UploadStep
            parsing={parsing}
            parseError={parseError}
            onPick={handleFile}
          />
        )}

        {step === "preview" && (
          <PreviewStep
            rows={rows}
            fileName={fileName}
            counts={counts}
            error={parseError}
            importing={importing}
            onConfirm={handleConfirm}
            onCancel={reset}
          />
        )}

        {step === "result" && result && (
          <ResultStep result={result} rows={rows} onReset={reset} />
        )}
      </main>
    </>
  );
}

function Stepper({ step }: { step: Step }) {
  const steps: { key: Step; label: string }[] = [
    { key: "upload", label: "1. Enviar planilha" },
    { key: "preview", label: "2. Conferir e mapear" },
    { key: "result", label: "3. Resultado" },
  ];
  const activeIdx = steps.findIndex((s) => s.key === step);
  return (
    <ol className="flex items-center gap-2 mb-6 flex-wrap">
      {steps.map((s, i) => (
        <li key={s.key} className="flex items-center gap-2">
          <span
            className={cn(
              "px-3 py-1.5 rounded-full text-[0.78rem] font-mono uppercase tracking-[0.06em] border",
              i === activeIdx
                ? "bg-ink-900 text-white border-ink-900"
                : i < activeIdx
                  ? "bg-emerald/10 text-emerald border-emerald/30"
                  : "bg-white text-ink-400 border-line",
            )}
          >
            {s.label}
          </span>
          {i < steps.length - 1 && (
            <span className="text-ink-300">→</span>
          )}
        </li>
      ))}
    </ol>
  );
}

function UploadStep({
  parsing,
  parseError,
  onPick,
}: {
  parsing: boolean;
  parseError: string | null;
  onPick: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <Card className="p-10 text-center">
      <div className="mx-auto w-14 h-14 rounded-2xl bg-flame-50 text-flame flex items-center justify-center mb-4">
        <Icon name="upload" size="lg" />
      </div>
      <h2 className="text-[1.2rem] font-display font-semibold text-ink-900 mb-2">
        Envie sua planilha de cadastro
      </h2>
      <p className="text-[0.92rem] text-ink-500 max-w-md mx-auto mb-6">
        Use o formato padrão com as colunas <code>prospect_nome</code>,{" "}
        <code>prospect_data_nascimento</code>, <code>responsavel_nome</code>,{" "}
        <code>endereco_*</code>. Linhas com responsável diferente do prospect
        viram família (responsável + dependente).
      </p>

      <label className="inline-flex items-center gap-2 cursor-pointer">
        <input
          type="file"
          accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          onChange={onPick}
          className="hidden"
        />
        <span className="px-5 py-2.5 rounded-xl bg-ink-900 text-white font-mono uppercase text-[0.82rem] tracking-[0.06em] hover:bg-ink-700 transition-colors">
          {parsing ? "Processando…" : "Escolher arquivo .xlsx"}
        </span>
      </label>

      {parsing && (
        <div className="mt-6">
          <LoadingState />
        </div>
      )}
      {parseError && (
        <div className="mt-6 text-rose text-[0.88rem]">{parseError}</div>
      )}
    </Card>
  );
}

function PreviewStep({
  rows,
  fileName,
  counts,
  error,
  importing,
  onConfirm,
  onCancel,
}: {
  rows: ImportRow[];
  fileName: string | null;
  counts: {
    valid: number;
    withWarnings: number;
    withErrors: number;
    families: number;
    total: number;
  };
  error: string | null;
  importing: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <>
      <Card className="p-5 mb-5">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="text-[0.78rem] font-mono uppercase tracking-[0.08em] text-ink-400 mb-1">
              {fileName ?? "Planilha carregada"}
            </div>
            <h2 className="text-[1.05rem] font-display font-semibold text-ink-900">
              {counts.total} linhas detectadas
            </h2>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Pill tone="emerald">{counts.valid} válidas</Pill>
            {counts.withWarnings > 0 && (
              <Pill tone="amber">{counts.withWarnings} com avisos</Pill>
            )}
            {counts.withErrors > 0 && (
              <Pill tone="rose">{counts.withErrors} com erros</Pill>
            )}
            <Pill tone="sky">{counts.families} famílias</Pill>
          </div>
        </div>
      </Card>

      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-[0.86rem]">
            <thead>
              <tr className="border-b border-line bg-paper-50">
                {[
                  "Linha",
                  "Tipo",
                  "Aluno / Responsável",
                  "Dependente",
                  "Contato",
                  "Endereço",
                  "Avisos",
                ].map((h) => (
                  <th
                    key={h}
                    className="text-left px-4 py-3 font-mono text-[0.68rem] uppercase tracking-[0.1em] text-ink-400 font-medium"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const hasError = r._errors.length > 0;
                return (
                  <tr
                    key={r.rowNumber}
                    className={cn(
                      "border-b border-line/60 last:border-b-0 align-top",
                      hasError && "bg-rose/5",
                    )}
                  >
                    <td className="px-4 py-3 font-mono text-[0.78rem] text-ink-400">
                      {r.rowNumber}
                    </td>
                    <td className="px-4 py-3">
                      {r.kind === "family" ? (
                        <Pill tone="sky">Família</Pill>
                      ) : (
                        <Pill tone="ink">Aluno</Pill>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-ink-900">
                        {r.name || "—"}
                      </div>
                      <div className="text-[0.78rem] text-ink-400">
                        {r.email}
                      </div>
                      {r.cpf && (
                        <div className="font-mono text-[0.74rem] text-ink-400">
                          CPF {r.cpf}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {r.kind === "family" ? (
                        <>
                          <div className="text-ink-900">{r.dependentName}</div>
                          <div className="text-[0.78rem] text-ink-400">
                            {r.dependentBirthdate ?? "—"}
                          </div>
                        </>
                      ) : (
                        <span className="text-ink-300">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-mono text-[0.82rem] text-ink-600">
                      {r.phone ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-[0.82rem] text-ink-600">
                      {r.address ? (
                        <>
                          <div>
                            {r.address.street ?? ""}
                            {r.address.number ? `, ${r.address.number}` : ""}
                          </div>
                          <div className="text-ink-400 text-[0.76rem]">
                            {[r.address.neighborhood, r.address.city, r.address.state]
                              .filter(Boolean)
                              .join(" · ")}
                          </div>
                        </>
                      ) : (
                        <span className="text-ink-300">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-[0.78rem]">
                      {r._errors.map((m, i) => (
                        <div key={`e${i}`} className="text-rose">
                          • {m}
                        </div>
                      ))}
                      {r._warnings.map((m, i) => (
                        <div key={`w${i}`} className="text-amber">
                          • {m}
                        </div>
                      ))}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {error && (
        <div className="mt-4 text-rose text-[0.88rem]">{error}</div>
      )}

      <div className="flex items-center justify-end gap-3 mt-6">
        <Button variant="ghost" type="button" onClick={onCancel}>
          Trocar planilha
        </Button>
        <Button
          variant="primary"
          type="button"
          onClick={onConfirm}
          disabled={importing || counts.valid === 0}
        >
          {importing
            ? "Importando…"
            : `Importar ${counts.valid} ${counts.valid === 1 ? "linha" : "linhas"}`}
          <Icon name="arrow-right" />
        </Button>
      </div>
    </>
  );
}

function ResultStep({
  result,
  rows,
  onReset,
}: {
  result: ImportResult;
  rows: ImportRow[];
  onReset: () => void;
}) {
  const byRow = new Map(rows.map((r) => [r.rowNumber, r]));
  return (
    <>
      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <ResultCard tone="emerald" label="Criados" value={result.created} />
        <ResultCard
          tone="amber"
          label="Pulados (já existiam)"
          value={result.skipped}
        />
        <ResultCard tone="rose" label="Erros" value={result.errors} />
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-[0.86rem]">
            <thead>
              <tr className="border-b border-line bg-paper-50">
                {["Linha", "Status", "Quem", "Detalhe"].map((h) => (
                  <th
                    key={h}
                    className="text-left px-4 py-3 font-mono text-[0.68rem] uppercase tracking-[0.1em] text-ink-400 font-medium"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {result.items.map((item) => {
                const r = byRow.get(item.rowNumber);
                return (
                  <tr
                    key={item.rowNumber}
                    className="border-b border-line/60 last:border-b-0"
                  >
                    <td className="px-4 py-3 font-mono text-[0.78rem] text-ink-400">
                      {item.rowNumber}
                    </td>
                    <td className="px-4 py-3">
                      <StatusPill status={item.status} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-ink-900">{r?.name ?? "—"}</div>
                      {r?.dependentName && (
                        <div className="text-[0.78rem] text-ink-400">
                          ↳ {r.dependentName}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-[0.82rem] text-ink-500">
                      {item.message ?? "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="flex items-center justify-end gap-3 mt-6">
        <Button variant="ghost" type="button" onClick={onReset}>
          Importar outra planilha
        </Button>
        <Link
          href="/admin/students"
          className="px-5 py-2.5 rounded-xl bg-ink-900 text-white font-mono uppercase text-[0.82rem] tracking-[0.06em] hover:bg-ink-700 transition-colors"
        >
          Ver alunos
        </Link>
      </div>
    </>
  );
}

function ResultCard({
  tone,
  label,
  value,
}: {
  tone: "emerald" | "amber" | "rose";
  label: string;
  value: number;
}) {
  const toneClasses: Record<typeof tone, string> = {
    emerald: "bg-emerald/10 text-emerald border-emerald/20",
    amber: "bg-amber/10 text-amber border-amber/20",
    rose: "bg-rose/10 text-rose border-rose/20",
  };
  return (
    <Card className={cn("p-5 border", toneClasses[tone])}>
      <div className="text-[0.78rem] font-mono uppercase tracking-[0.08em] mb-2">
        {label}
      </div>
      <div className="text-[2rem] font-display font-semibold text-ink-900">
        {value}
      </div>
    </Card>
  );
}

function StatusPill({ status }: { status: string }) {
  if (status === "created") return <Pill tone="emerald">Criado</Pill>;
  if (status === "skipped") return <Pill tone="amber">Já existia</Pill>;
  if (status === "error") return <Pill tone="rose">Erro</Pill>;
  return <Pill tone="ink">{status}</Pill>;
}
