import type { Metadata } from "next";
import { Geist, JetBrains_Mono, Outfit } from "next/font/google";
import { ApolloClientProvider } from "@/lib/apollo-provider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_ORIGIN ?? "http://localhost:9999",
  ),
  title: {
    default: "Gym — Sistema de gestão para academias modernas",
    template: "%s — Gym",
  },
  description:
    "Gestão completa para academias brasileiras: matrículas, cobranças via PIX e boleto, agenda de aulas, fichas de treino e app white-label com a identidade visual da sua academia.",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: "Gym",
  },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${outfit.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-paper text-ink-900">
        <ApolloClientProvider>{children}</ApolloClientProvider>
      </body>
    </html>
  );
}
