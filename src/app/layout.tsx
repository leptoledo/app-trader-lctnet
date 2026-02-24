import { Inter, Outfit } from "next/font/google"
import "./globals.css";
import { Toaster } from "@/components/ui/sonner"
import { PwaRegister } from "@/components/pwa-register"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
})

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-heading",
})

export const metadata = {
  title: "TraderLCTNET | O Diário de Trade Profissional",
  description: "A plataforma nº 1 para traders de alta performance. Gerencie seus trades, analise estatísticas e domine o mercado.",
  manifest: "/manifest.json",
}

export const viewport = {
  themeColor: "#059669",
}

import { ThemeProvider } from "@/components/theme-provider"

// ... imports

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning className="scroll-smooth">
      <body className={`${inter.variable} ${outfit.variable} font-sans antialiased`} suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <PwaRegister />
          <Toaster position="top-right" richColors />
        </ThemeProvider>
      </body>
    </html>
  );
}
