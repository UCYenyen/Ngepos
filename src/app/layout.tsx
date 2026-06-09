import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/layout/ThemeProvider/ThemeProvider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { SITE_URL } from "@/lib/site";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Ngepos — Kasir digital untuk semua bisnismu",
  description:
    "Ngepos adalah aplikasi kasir (POS) multi-bisnis untuk F&B dan retail di Indonesia. Kelola produk, transaksi, stok, meja, staf, dan laporan dalam satu tempat.",
  applicationName: "Ngepos",
  keywords: [
    "aplikasi kasir",
    "POS",
    "point of sale",
    "kasir online",
    "kasir restoran",
    "kasir toko",
    "UMKM",
    "Indonesia",
  ],
  openGraph: {
    type: "website",
    siteName: "Ngepos",
    locale: "id_ID",
    url: SITE_URL,
    title: "Ngepos — Kasir digital untuk semua bisnismu",
    description:
      "Aplikasi kasir multi-bisnis untuk F&B dan retail di Indonesia. Produk, transaksi, stok, meja, staf, dan laporan dalam satu tempat.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <TooltipProvider>
            {children}
            <Toaster />
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
