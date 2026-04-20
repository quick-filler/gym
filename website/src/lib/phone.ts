/**
 * Phone parsing / formatting.
 *
 * Display format (what shows in inputs and student rows):
 *   +55 (11) 99999-9999
 *
 * Storage format (what lands in the DB):
 *   +55119999999999
 *
 * Exposes pure helpers so they're easy to unit test.
 */

export interface Country {
  code: string; // ISO-3166 alpha-2 (BR, US, PT, …)
  name: string; // Display name in pt-BR
  dial: string; // Digits only, no plus sign ("55", "1", "351")
  flag: string; // Emoji fallback used in the picker label
  example: string; // Example national-portion digits for placeholder
  /** Inserts the national-number separators for this country. */
  format(digits: string): string;
}

/** "(11) 99999-9999" pattern for BR (mobile 11 digits) + "(11) 9999-9999" landline. */
function formatBR(digits: string): string {
  const d = digits.replace(/\D/g, "").slice(0, 11);
  if (d.length === 0) return "";
  if (d.length <= 2) return `(${d}`;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10)
    return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

/** "(555) 123-4567" pattern for US/CA (10 digits). */
function formatNANP(digits: string): string {
  const d = digits.replace(/\D/g, "").slice(0, 10);
  if (d.length === 0) return "";
  if (d.length <= 3) return `(${d}`;
  if (d.length <= 6) return `(${d.slice(0, 3)}) ${d.slice(3)}`;
  return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
}

/** Generic fallback: chunk into groups of 3 + 3 + rest. */
function formatGeneric(digits: string): string {
  const d = digits.replace(/\D/g, "").slice(0, 14);
  if (d.length <= 3) return d;
  if (d.length <= 6) return `${d.slice(0, 3)} ${d.slice(3)}`;
  if (d.length <= 9)
    return `${d.slice(0, 3)} ${d.slice(3, 6)} ${d.slice(6)}`;
  return `${d.slice(0, 3)} ${d.slice(3, 6)} ${d.slice(6, 9)} ${d.slice(9)}`;
}

/**
 * Ordered list. Brazil first (default). Keeps the picker short but
 * covers the LATAM + anglosphere markets an operator likely runs into.
 */
export const COUNTRIES: Country[] = [
  { code: "BR", name: "Brasil", dial: "55", flag: "🇧🇷", example: "11999999999", format: formatBR },
  { code: "PT", name: "Portugal", dial: "351", flag: "🇵🇹", example: "911234567", format: formatGeneric },
  { code: "US", name: "Estados Unidos", dial: "1", flag: "🇺🇸", example: "5551234567", format: formatNANP },
  { code: "CA", name: "Canadá", dial: "1", flag: "🇨🇦", example: "5551234567", format: formatNANP },
  { code: "AR", name: "Argentina", dial: "54", flag: "🇦🇷", example: "1155551234", format: formatGeneric },
  { code: "CL", name: "Chile", dial: "56", flag: "🇨🇱", example: "912345678", format: formatGeneric },
  { code: "CO", name: "Colômbia", dial: "57", flag: "🇨🇴", example: "3001234567", format: formatGeneric },
  { code: "MX", name: "México", dial: "52", flag: "🇲🇽", example: "5512345678", format: formatGeneric },
  { code: "PY", name: "Paraguai", dial: "595", flag: "🇵🇾", example: "981234567", format: formatGeneric },
  { code: "UY", name: "Uruguai", dial: "598", flag: "🇺🇾", example: "91234567", format: formatGeneric },
  { code: "ES", name: "Espanha", dial: "34", flag: "🇪🇸", example: "612345678", format: formatGeneric },
  { code: "GB", name: "Reino Unido", dial: "44", flag: "🇬🇧", example: "7123456789", format: formatGeneric },
  { code: "FR", name: "França", dial: "33", flag: "🇫🇷", example: "612345678", format: formatGeneric },
  { code: "DE", name: "Alemanha", dial: "49", flag: "🇩🇪", example: "15112345678", format: formatGeneric },
  { code: "IT", name: "Itália", dial: "39", flag: "🇮🇹", example: "3123456789", format: formatGeneric },
  { code: "JP", name: "Japão", dial: "81", flag: "🇯🇵", example: "9012345678", format: formatGeneric },
];

/**
 * Sentinel for a country the picker doesn't list. The caller swaps the
 * dial code at runtime; formatting falls back to the generic grouper.
 *
 * Kept out of COUNTRIES so the search list stays curated — the caller
 * renders it as a manual "Outro país" entry.
 */
export const OTHER_COUNTRY: Country = {
  code: "OTHER",
  name: "Outro país",
  dial: "",
  flag: "🌐",
  example: "123456789",
  format: formatGeneric,
};

/** Create a custom country with the operator-typed dial code. */
export function makeOtherCountry(dial: string): Country {
  return {
    ...OTHER_COUNTRY,
    dial: digitsOnly(dial).slice(0, 4),
  };
}

export const DEFAULT_COUNTRY = COUNTRIES[0]!; // Brazil

export function findCountry(code: string | undefined | null): Country {
  if (!code) return DEFAULT_COUNTRY;
  return COUNTRIES.find((c) => c.code === code) ?? DEFAULT_COUNTRY;
}

/** Strip everything that isn't a digit. */
export function digitsOnly(s: string): string {
  return s.replace(/\D/g, "");
}

/**
 * Parse a stored phone like `+55119999999999` (or a legacy
 * `11 99999-9999` without prefix) into { country, national }.
 * Tries the country dial codes longest-first so `+55` and `+55XX`
 * don't collide with `+5` prefixes from shorter codes.
 */
export function parseStoredPhone(stored: string | null | undefined): {
  country: Country;
  national: string;
} {
  if (!stored) return { country: DEFAULT_COUNTRY, national: "" };

  const raw = stored.trim();
  // Stored format with + prefix.
  if (raw.startsWith("+")) {
    const digits = digitsOnly(raw);
    // Try longest dial codes first so "+55" doesn't win over "+1".
    const sorted = [...COUNTRIES].sort(
      (a, b) => b.dial.length - a.dial.length,
    );
    for (const c of sorted) {
      if (digits.startsWith(c.dial)) {
        return { country: c, national: digits.slice(c.dial.length) };
      }
    }
    // Unknown code — keep the whole thing on the default country.
    return { country: DEFAULT_COUNTRY, national: digits };
  }

  // No +prefix — assume default country, strip the (probable)
  // country code if the operator pasted a raw "55..." string.
  const d = digitsOnly(raw);
  if (d.startsWith(DEFAULT_COUNTRY.dial) && d.length > 10) {
    return {
      country: DEFAULT_COUNTRY,
      national: d.slice(DEFAULT_COUNTRY.dial.length),
    };
  }
  return { country: DEFAULT_COUNTRY, national: d };
}

/** Turns `{ country, national }` into the display string shown in an input. */
export function formatDisplay(country: Country, national: string): string {
  const d = digitsOnly(national);
  if (d.length === 0) return "";
  return `+${country.dial} ${country.format(d)}`;
}

/**
 * Builds the DB-bound storage string `+<dial><digits>` from the
 * current form state. Returns `""` when the national portion is
 * empty (so the caller can decide to send `null`/`undefined`).
 */
export function toStored(country: Country, national: string): string {
  const d = digitsOnly(national);
  if (d.length === 0) return "";
  return `+${country.dial}${d}`;
}

/**
 * Stored phone → display string for listings and read-only views.
 *   `+55119999999999` → `+55 (11) 99999-9999`
 *   `11 98765-4321`   → `+55 (11) 98765-4321` (legacy values)
 * Returns the input unchanged when parsing fails so the operator
 * sees something — never an empty cell.
 */
export function formatPhoneForDisplay(
  stored: string | null | undefined,
): string {
  if (!stored) return "";
  const { country, national } = parseStoredPhone(stored);
  if (!national) return stored;
  return formatDisplay(country, national);
}
