/**
 * CEP (Brazilian postal code) → address lookup.
 *
 * Proxies ViaCEP (https://viacep.com.br) server-side so the frontends keep
 * their single GraphQL data surface (design-decisions §9.x / CLAUDE rule #4):
 * the app never calls an external REST API directly. Best-effort — any
 * failure resolves to null and the user just fills the address by hand.
 *
 * `sanitizeCep` and `mapViaCep` are pure (unit-tested); `lookupCep` does the
 * network call.
 */

import type { Core } from '@strapi/strapi';

export interface CepAddress {
  cep: string;
  street: string;
  neighborhood: string;
  city: string;
  state: string;
}

/** Keep only digits, capped at the 8 a CEP has. */
export function sanitizeCep(input: string | null | undefined): string {
  return (input ?? '').replace(/\D/g, '').slice(0, 8);
}

/**
 * Map a ViaCEP JSON response to our shape. Returns null when ViaCEP flags
 * the CEP as not found (`erro: true`) or the payload has no usable CEP.
 */
export function mapViaCep(raw: any): CepAddress | null {
  if (!raw || raw.erro) return null;
  const cep = sanitizeCep(raw.cep);
  if (!cep) return null;
  return {
    cep,
    street: raw.logradouro ?? '',
    neighborhood: raw.bairro ?? '',
    city: raw.localidade ?? '',
    state: (raw.uf ?? '').toUpperCase(),
  };
}

const VIACEP_URL = (cep: string) => `https://viacep.com.br/ws/${cep}/json/`;

/** Resolve a CEP to an address, or null when invalid / not found / offline. */
export async function lookupCep(
  strapi: Core.Strapi,
  cep: string,
): Promise<CepAddress | null> {
  const clean = sanitizeCep(cep);
  if (clean.length !== 8) return null;
  try {
    const res = await fetch(VIACEP_URL(clean));
    if (!res.ok) return null;
    const raw = await res.json();
    return mapViaCep(raw);
  } catch (e) {
    strapi?.log?.warn?.(`[cep] lookup failed for ${clean}: ${(e as Error).message}`);
    return null;
  }
}
