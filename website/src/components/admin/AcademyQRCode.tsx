"use client";

import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";

/**
 * Academy access QR — encodes the app deep link `gymapp://academy?slug=<slug>`.
 * The academy prints/shares it; a student scans it in the app's academy picker
 * to jump straight to this tenant (the app's `normalizeSlug` extracts the slug).
 */
export function AcademyQRCode({ slug, color }: { slug: string; color?: string }) {
  const [copied, setCopied] = useState(false);
  const link = slug ? `gymapp://academy?slug=${slug}` : "";

  if (!slug) return null;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <Card className="p-6">
      <h3 className="font-display text-[1.05rem] font-semibold text-ink-900 mb-1">
        QR de acesso ao app
      </h3>
      <p className="text-[0.86rem] text-ink-500 mb-4">
        Os alunos escaneiam este código no app para entrar direto na sua
        academia. Imprima na recepção ou compartilhe na matrícula.
      </p>
      <div className="flex items-center gap-5 max-[520px]:flex-col max-[520px]:items-start">
        <div className="rounded-2xl border border-line bg-white p-3">
          <QRCodeSVG
            value={link}
            size={148}
            level="M"
            marginSize={2}
            fgColor={color || "#0c0a09"}
            bgColor="#ffffff"
          />
        </div>
        <div className="min-w-0">
          <div className="font-mono text-[0.72rem] uppercase tracking-[0.06em] text-ink-400 mb-1">
            Link
          </div>
          <code className="block text-[0.82rem] text-ink-700 break-all mb-3">
            {link}
          </code>
          <Button variant="ghost" onClick={copy}>
            <Icon name={copied ? "check" : "link"} /> {copied ? "Copiado!" : "Copiar link"}
          </Button>
        </div>
      </div>
    </Card>
  );
}
