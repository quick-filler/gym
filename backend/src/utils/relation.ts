/**
 * Helpers para extrair o id de uma relação dentro de um lifecycle hook.
 *
 * Strapi v5 entrega o `data.<rel>` em vários formatos dependendo da origem
 * da escrita:
 *   - via Documents API:   `'docId-string'` ou `{ documentId: 'docId-string' }`
 *   - via REST/admin UI:   `numericId` ou `{ id: numericId }`
 *   - via GraphQL:         `{ connect: [{ documentId | id }] }`
 *   - relação removida:    `null` ou `{ disconnect: [...] }`
 *
 * `pickRelationId` devolve um identificador "puro" (number ou documentId
 * string) e `resolveNumericId` converte pra id numérico consultando o
 * banco quando necessário — id numérico é o que `strapi.db.query` aceita
 * em filtros `where: { id }`.
 */

export type RelationRef = number | string | null;

export function pickRelationId(value: any): RelationRef {
  if (value === undefined || value === null) return null;
  if (typeof value === 'number' || typeof value === 'string') return value;
  if (typeof value === 'object') {
    const direct = value.id ?? value.documentId;
    if (direct !== undefined && direct !== null) return direct;
    const connect = Array.isArray(value.connect) ? value.connect[0] : null;
    if (connect) return connect.id ?? connect.documentId ?? null;
    const set = Array.isArray(value.set) ? value.set[0] : null;
    if (set) return set.id ?? set.documentId ?? null;
  }
  return null;
}

export async function resolveNumericId(
  uid: string,
  ref: RelationRef,
): Promise<number | null> {
  if (ref === null || ref === undefined) return null;
  if (typeof ref === 'number') return ref;
  // documentId string → busca no banco pra recuperar o numeric id.
  const row: any = await strapi.db
    .query(uid)
    .findOne({ where: { documentId: ref }, select: ['id'] });
  return row?.id ?? null;
}
