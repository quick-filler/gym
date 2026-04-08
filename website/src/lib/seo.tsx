/**
 * SEO helpers — canonical URLs, JSON-LD schemas, shared metadata
 * defaults. Each page imports from here instead of hand-rolling.
 */

import type { Metadata } from "next";
import { SITE_ORIGIN } from "./config";

export function canonical(path: string): string {
  const clean = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_ORIGIN}${clean}`;
}

type PageMetaInput = {
  title: string;
  description: string;
  path: string;
  noIndex?: boolean;
};

export function pageMetadata({
  title,
  description,
  path,
  noIndex,
}: PageMetaInput): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    robots: noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true },
    openGraph: {
      title,
      description,
      url: path,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Gym",
  url: SITE_ORIGIN,
  logo: `${SITE_ORIGIN}/logo.svg`,
  description: "Plataforma white-label de gestão para academias brasileiras.",
  areaServed: { "@type": "Country", name: "Brasil" },
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "sales",
    email: "vendas@gym.app",
    availableLanguage: ["pt-BR"],
  },
  sameAs: ["https://instagram.com/gym.app", "https://wa.me/5511999990000"],
};

export const softwareApplicationSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Gym",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web, iOS, Android",
  offers: [
    {
      "@type": "Offer",
      name: "Starter",
      price: "99.00",
      priceCurrency: "BRL",
    },
    {
      "@type": "Offer",
      name: "Business",
      price: "199.00",
      priceCurrency: "BRL",
    },
    { "@type": "Offer", name: "Pro", price: "399.00", priceCurrency: "BRL" },
  ],
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.8",
    ratingCount: "127",
  },
};

export function faqSchema(
  items: Array<{ question: string; answer: string }>,
) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

export function breadcrumbSchema(
  items: Array<{ name: string; url: string }>,
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: canonical(item.url),
    })),
  };
}

/** Inline <script type="application/ld+json"> helper. */
export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
