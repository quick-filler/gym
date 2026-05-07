/**
 * Strapi media upload helpers. Strapi's `/api/upload` is REST-only —
 * the GraphQL plugin doesn't expose multipart, so we hit the REST
 * endpoint directly with the JWT from localStorage and return the
 * uploaded media's documentId for linking via `updateAcademy`.
 */

"use client";

import { GRAPHQL_ENDPOINT, JWT_STORAGE_KEY } from "./config";

const UPLOAD_ENDPOINT = `${GRAPHQL_ENDPOINT.replace(/\/graphql$/, "")}/api/upload`;

export interface UploadedMedia {
  documentId: string;
  url: string;
  name: string;
  mime: string;
  size: number;
}

interface RawStrapiUpload {
  documentId: string;
  url: string;
  name: string;
  mime: string;
  size: number;
}

export async function uploadMedia(file: File): Promise<UploadedMedia> {
  const jwt =
    typeof window !== "undefined"
      ? window.localStorage.getItem(JWT_STORAGE_KEY)
      : null;
  if (!jwt) {
    throw new Error("Sessão expirada. Faça login novamente.");
  }

  const body = new FormData();
  body.append("files", file);

  const res = await fetch(UPLOAD_ENDPOINT, {
    method: "POST",
    headers: { Authorization: `Bearer ${jwt}` },
    body,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(
      text || `Falha no upload (${res.status} ${res.statusText}).`,
    );
  }

  const json = (await res.json()) as RawStrapiUpload[];
  const first = json[0];
  if (!first?.documentId) {
    throw new Error("Upload concluído, mas o servidor não retornou o arquivo.");
  }
  return {
    documentId: first.documentId,
    url: first.url,
    name: first.name,
    mime: first.mime,
    size: first.size,
  };
}
