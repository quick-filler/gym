/**
 * Direct-to-S3 upload pipeline.
 *
 * Three steps so the bytes never go through our backend:
 *   1. mintUploadUrl  → backend signs a 15-min PUT URL (S3 ACL public-read)
 *   2. PUT bytes       → browser → S3 directly (Content-Type matches what we signed)
 *   3. confirmUpload   → backend HEADs the public URL, creates plugin::upload.file
 *                        so Strapi Media admin and Academy.logo relations see it
 *
 * Pattern ported from quickfiller-strapi-api. Same uploadMedia(file)
 * signature as the original POST-based helper, so callers (settings page)
 * don't change.
 */

"use client";

import { graphql } from "@/gql";
import { apolloClient } from "./apollo";

const MINT_UPLOAD_URL = graphql(`
  mutation MintUploadUrl(
    $filename: String!
    $contentType: String!
    $size: Int!
  ) {
    mintUploadUrl(
      filename: $filename
      contentType: $contentType
      size: $size
    ) {
      uploadUrl
      publicUrl
      key
    }
  }
`);

const CONFIRM_UPLOAD = graphql(`
  mutation ConfirmUpload($url: String!, $name: String!) {
    confirmUpload(url: $url, name: $name) {
      documentId
      url
      mime
    }
  }
`);

export interface UploadedMedia {
  documentId: string;
  url: string;
  name: string;
  mime: string;
  size: number;
}

export async function uploadMedia(file: File): Promise<UploadedMedia> {
  // 1. Ask backend for a presigned PUT URL.
  const mintRes = await apolloClient.mutate({
    mutation: MINT_UPLOAD_URL,
    variables: {
      filename: file.name,
      contentType: file.type || "application/octet-stream",
      size: file.size,
    },
  });
  const minted = mintRes.data?.mintUploadUrl;
  if (!minted) {
    throw new Error("Não foi possível gerar a URL de upload.");
  }

  // 2. PUT bytes straight to S3. The Content-Type header MUST match the
  //    one signed in step 1 — S3 rejects the upload otherwise.
  const put = await fetch(minted.uploadUrl, {
    method: "PUT",
    headers: {
      "Content-Type": file.type || "application/octet-stream",
    },
    body: file,
  });
  if (!put.ok) {
    const text = await put.text().catch(() => "");
    throw new Error(
      text || `Falha no upload para o S3 (${put.status} ${put.statusText}).`,
    );
  }

  // 3. Tell the backend to register the uploaded object as a Media file.
  const confirm = await apolloClient.mutate({
    mutation: CONFIRM_UPLOAD,
    variables: { url: minted.publicUrl, name: file.name },
  });
  const confirmed = confirm.data?.confirmUpload;
  if (!confirmed?.documentId) {
    throw new Error("Upload feito, mas o registro Media não foi criado.");
  }

  return {
    documentId: confirmed.documentId,
    url: confirmed.url ?? minted.publicUrl,
    name: file.name,
    mime: confirmed.mime ?? file.type,
    size: file.size,
  };
}
