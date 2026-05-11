/**
 * Mapeia linhas de uma planilha de cadastro (formato `plan_cadstro aluno.xlsx`)
 * para o input da mutation `bulkImportStudents`. Toda a normalização
 * (CPF só dígitos, telefone só dígitos, data BR → ISO, sexo → enum) acontece
 * aqui — o backend confia no payload já saneado.
 *
 * Detecção adulto vs família: se `responsavel_nome` está vazio ou é igual
 * (case-insensitive, trim) ao `prospect_nome`, é um aluno adulto. Caso
 * contrário, o `prospect_*` vira o dependente e o `responsavel_*` vira
 * o Student responsável.
 */

export type RawRow = Record<string, unknown>;

export type ImportRow = {
  rowNumber: number;
  kind: 'student' | 'family';
  name: string;
  email: string;
  phone?: string;
  cpf?: string;
  gender?: 'female' | 'male' | 'other';
  birthdate?: string;
  address?: AddressInput;
  dependentName?: string;
  dependentBirthdate?: string;
  dependentCpf?: string;
  dependentGender?: 'girl' | 'boy' | 'other';
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  // Campos derivados úteis para a UI de preview, jamais enviados pra mutation.
  _warnings: string[];
  _errors: string[];
};

export type AddressInput = {
  type?: string;
  cep?: string;
  street?: string;
  number?: string;
  complement?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
};

export const COLUMN_KEYS = [
  'prospect_nome',
  'prospect_data_nascimento',
  'prospect_idade',
  'prospect_sexo',
  'prospect_cpf',
  'prospect_dataatestado',
  'responsavel_nome',
  'responsavel_cpf',
  'responsavel_celular',
  'responsavel_email',
  'emergencia_contato',
  'emergencia_celular',
  'endereco_tipo',
  'endereco_cep',
  'endereco_rua',
  'endereco_numero',
  'endereco_complemento',
  'endereco_bairro',
  'endereco_cidade',
  'endereco_uf',
] as const;

export type ColumnKey = (typeof COLUMN_KEYS)[number];

const HEADER_ALIASES: Record<string, ColumnKey> = {
  prospect_nome: 'prospect_nome',
  prospectnome: 'prospect_nome',
  prospect_data_nascimento: 'prospect_data_nascimento',
  prospectdatanascimento: 'prospect_data_nascimento',
  prospect_idade: 'prospect_idade',
  prospect_sexo: 'prospect_sexo',
  prospect_cpf: 'prospect_cpf',
  prospect_dataatestado: 'prospect_dataatestado',
  responsavel_nome: 'responsavel_nome',
  responsavel_cpf: 'responsavel_cpf',
  responsavel_celular: 'responsavel_celular',
  responsavel_email: 'responsavel_email',
  emergencia_contato: 'emergencia_contato',
  emergencia_celular: 'emergencia_celular',
  endereco_tipo: 'endereco_tipo',
  endereco_cep: 'endereco_cep',
  endereco_rua: 'endereco_rua',
  endereco_numero: 'endereco_numero',
  endereco_complemento: 'endereco_complemento',
  endereco_bairro: 'endereco_bairro',
  endereco_cidade: 'endereco_cidade',
  endereco_uf: 'endereco_uf',
};

export function normalizeHeader(h: string): ColumnKey | null {
  const k = h.trim().toLowerCase().replace(/[\s-]+/g, '_');
  return HEADER_ALIASES[k] ?? null;
}

export function digitsOnly(s: unknown): string {
  if (s == null) return '';
  return String(s).replace(/\D+/g, '');
}

export function normalizeCpf(s: unknown): string | undefined {
  const d = digitsOnly(s);
  return d.length === 11 ? d : undefined;
}

export function normalizeCep(s: unknown): string | undefined {
  const d = digitsOnly(s);
  return d.length === 8 ? d : undefined;
}

export function normalizePhone(s: unknown): string | undefined {
  const d = digitsOnly(s);
  return d.length >= 10 && d.length <= 13 ? d : undefined;
}

/**
 * Converte data BR para ISO (YYYY-MM-DD). Aceita dia/mês com 1 ou 2 dígitos
 * e separadores `/`, `-` ou `.` — `25/07/1975`, `5/7/1975`, `5/07/1975`,
 * `25-7-1975`, `25.07.1975` etc. Aceita ano com 2 dígitos (assume 19xx
 * para ≥ 30, 20xx caso contrário) ou 4 dígitos. Aceita também ISO direto.
 * Valida intervalo dia/mês e descarta datas absurdas (ano < 1900 ou > +1).
 */
export function brDateToIso(s: unknown, today = new Date()): string | undefined {
  if (s == null) return undefined;
  // Excel date: sheetjs devolve `Date` quando lido com cellDates: true sem dateNF.
  if (s instanceof Date) {
    if (Number.isNaN(s.getTime())) return undefined;
    const y = s.getUTCFullYear();
    const m = s.getUTCMonth() + 1;
    const d = s.getUTCDate();
    return isValidYmd(y, m, d, today)
      ? `${pad4(y)}-${pad2(m)}-${pad2(d)}`
      : undefined;
  }
  const v = String(s).trim();
  if (!v) return undefined;
  // ISO direto
  const iso = /^(\d{4})-(\d{2})-(\d{2})/.exec(v);
  if (iso) {
    const y = +iso[1];
    const m = +iso[2];
    const d = +iso[3];
    if (isValidYmd(y, m, d, today)) return `${iso[1]}-${iso[2]}-${iso[3]}`;
    return undefined;
  }
  // BR flexível: dia [/-.] mês [/-.] ano
  const br = /^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{2}|\d{4})$/.exec(v);
  if (br) {
    const day = +br[1];
    const month = +br[2];
    let year = +br[3];
    if (br[3].length === 2) year = year >= 30 ? 1900 + year : 2000 + year;
    if (!isValidYmd(year, month, day, today)) return undefined;
    return `${pad4(year)}-${pad2(month)}-${pad2(day)}`;
  }
  return undefined;
}

function pad2(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}
function pad4(n: number): string {
  return String(n).padStart(4, '0');
}
function isValidYmd(y: number, m: number, d: number, today: Date): boolean {
  if (y < 1900 || y > today.getUTCFullYear() + 1) return false;
  if (m < 1 || m > 12) return false;
  if (d < 1 || d > 31) return false;
  // Valida realmente o dia (29/02 em ano não-bissexto, 31/04, etc.)
  const dt = new Date(Date.UTC(y, m - 1, d));
  return (
    dt.getUTCFullYear() === y &&
    dt.getUTCMonth() === m - 1 &&
    dt.getUTCDate() === d
  );
}

export function ageFromBirthdate(iso: string, today = new Date()): number {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return NaN;
  let age = today.getUTCFullYear() - d.getUTCFullYear();
  const m = today.getUTCMonth() - d.getUTCMonth();
  if (m < 0 || (m === 0 && today.getUTCDate() < d.getUTCDate())) age--;
  return age;
}

export function genderToStudent(s: unknown): 'female' | 'male' | 'other' | undefined {
  if (!s) return undefined;
  const v = String(s).trim().toLowerCase();
  if (v.startsWith('f')) return 'female';
  if (v.startsWith('m')) return 'male';
  return 'other';
}

export function genderToDependent(s: unknown): 'girl' | 'boy' | 'other' | undefined {
  if (!s) return undefined;
  const v = String(s).trim().toLowerCase();
  if (v.startsWith('f')) return 'girl';
  if (v.startsWith('m')) return 'boy';
  return 'other';
}

function emailFor(name: string, fallbackDomain = 'sem-email.local'): string {
  const slug = name
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '.')
    .replace(/^\.|\.$/g, '');
  return `${slug || 'sem.nome'}@${fallbackDomain}`;
}

function pickAddress(raw: RawRow): AddressInput | undefined {
  const addr: AddressInput = {
    type: stringOrUndef(raw.endereco_tipo),
    cep: normalizeCep(raw.endereco_cep),
    street: stringOrUndef(raw.endereco_rua),
    number: stringOrUndef(raw.endereco_numero),
    complement: stringOrUndef(raw.endereco_complemento),
    neighborhood: stringOrUndef(raw.endereco_bairro),
    city: stringOrUndef(raw.endereco_cidade),
    state: stringOrUndef(raw.endereco_uf),
  };
  const hasAny = Object.values(addr).some((v) => v != null && v !== '');
  return hasAny ? addr : undefined;
}

function stringOrUndef(v: unknown): string | undefined {
  if (v == null) return undefined;
  const s = String(v).trim();
  return s ? s : undefined;
}

function namesMatch(a: string, b: string) {
  return (
    a.trim().toLocaleLowerCase('pt-BR') === b.trim().toLocaleLowerCase('pt-BR')
  );
}

export function mapRow(raw: RawRow, rowNumber: number): ImportRow {
  const warnings: string[] = [];
  const errors: string[] = [];

  const prospectName = stringOrUndef(raw.prospect_nome);
  const responsavelName = stringOrUndef(raw.responsavel_nome);

  if (!prospectName) {
    errors.push('Nome do aluno (prospect_nome) é obrigatório.');
  }

  const isFamily =
    !!responsavelName && !!prospectName && !namesMatch(responsavelName, prospectName);

  const prospectBirthIso = brDateToIso(raw.prospect_data_nascimento);
  if (raw.prospect_data_nascimento && !prospectBirthIso) {
    warnings.push('Data de nascimento ignorada (formato inválido).');
  }

  const address = pickAddress(raw);

  if (isFamily) {
    // Dependente exige data de nascimento (Strapi schema marca como required).
    // Falhar aqui mantém a linha visível em vermelho no preview ao invés de
    // explodir só quando o usuário clica "Importar".
    if (!prospectBirthIso) {
      errors.push(
        'Dependente sem data de nascimento — preencha prospect_data_nascimento na planilha.',
      );
    }
    const guardianEmail =
      stringOrUndef(raw.responsavel_email) ?? emailFor(responsavelName!);
    if (!stringOrUndef(raw.responsavel_email)) {
      warnings.push(`E-mail do responsável gerado automaticamente (${guardianEmail}).`);
    }
    return {
      rowNumber,
      kind: 'family',
      name: responsavelName!,
      email: guardianEmail,
      phone: normalizePhone(raw.responsavel_celular),
      cpf: normalizeCpf(raw.responsavel_cpf),
      address,
      dependentName: prospectName,
      dependentBirthdate: prospectBirthIso,
      dependentCpf: normalizeCpf(raw.prospect_cpf),
      dependentGender: genderToDependent(raw.prospect_sexo),
      emergencyContactName: stringOrUndef(raw.emergencia_contato),
      emergencyContactPhone: normalizePhone(raw.emergencia_celular),
      _warnings: warnings,
      _errors: errors,
    };
  }

  // Aluno adulto.
  const adultEmail =
    stringOrUndef(raw.responsavel_email) ?? (prospectName ? emailFor(prospectName) : '');
  if (prospectName && !stringOrUndef(raw.responsavel_email)) {
    warnings.push(`E-mail gerado automaticamente (${adultEmail}).`);
  }
  return {
    rowNumber,
    kind: 'student',
    name: prospectName ?? '',
    email: adultEmail,
    phone:
      normalizePhone(raw.responsavel_celular) ?? normalizePhone(raw.emergencia_celular),
    cpf: normalizeCpf(raw.prospect_cpf) ?? normalizeCpf(raw.responsavel_cpf),
    gender: genderToStudent(raw.prospect_sexo),
    birthdate: prospectBirthIso,
    address,
    emergencyContactName: stringOrUndef(raw.emergencia_contato),
    emergencyContactPhone: normalizePhone(raw.emergencia_celular),
    _warnings: warnings,
    _errors: errors,
  };
}

/**
 * Procura, nas primeiras linhas, aquela que tem mais cabeçalhos reconhecidos.
 * Necessário porque algumas planilhas têm linhas de grupo ("ALUNO" / "RESPONSÁVEL")
 * acima dos nomes de coluna reais.
 */
export function findHeaderRow(
  matrix: unknown[][],
  scanLimit = 8,
): { headerIndex: number; cols: (ColumnKey | null)[]; matched: number } {
  let best = { headerIndex: 0, cols: [] as (ColumnKey | null)[], matched: -1 };
  const limit = Math.min(scanLimit, matrix.length);
  for (let i = 0; i < limit; i++) {
    const cols = (matrix[i] ?? []).map((c) => normalizeHeader(String(c ?? '')));
    const matched = cols.filter((c) => c !== null).length;
    if (matched > best.matched) best = { headerIndex: i, cols, matched };
  }
  return best;
}

/**
 * Escolhe a aba mais provável: a que tem mais cabeçalhos reconhecidos
 * (não a com mais linhas — pode ser uma aba de "anexo" / agrupada).
 */
export function pickBestSheet<T extends { name: string; matrix: unknown[][] }>(
  sheets: T[],
): { sheet: T; header: ReturnType<typeof findHeaderRow> } | null {
  let best: { sheet: T; header: ReturnType<typeof findHeaderRow> } | null = null;
  for (const s of sheets) {
    const header = findHeaderRow(s.matrix);
    if (!best || header.matched > best.header.matched) {
      best = { sheet: s, header };
    }
  }
  return best;
}

/**
 * Recebe a matriz da planilha e retorna linhas mapeadas. Detecta automaticamente
 * a linha-cabeçalho (até 8 linhas iniciais), pulando linhas de grupo. Linhas
 * inteiramente vazias são descartadas.
 */
export function mapSheet(matrix: unknown[][]): ImportRow[] {
  if (matrix.length === 0) return [];
  const { headerIndex, cols } = findHeaderRow(matrix);

  const rows: ImportRow[] = [];
  for (let r = headerIndex + 1; r < matrix.length; r++) {
    const row = matrix[r];
    if (!row || row.every((c) => c == null || String(c).trim() === '')) continue;
    const raw: RawRow = {};
    cols.forEach((col, idx) => {
      if (col) raw[col] = row[idx];
    });
    rows.push(mapRow(raw, r + 1));
  }
  return rows;
}

/** Versão "limpa" pra enviar à mutation — descarta `_warnings` / `_errors`. */
export function toMutationInput(rows: ImportRow[]) {
  return rows
    .filter((r) => r._errors.length === 0)
    .map(({ _warnings, _errors, ...clean }) => clean);
}
