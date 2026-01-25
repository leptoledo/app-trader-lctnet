import { Lexend, Outfit } from "next/font/google"
import "./globals.css";
import { Toaster } from "@/components/ui/sonner"

const lexend = Lexend({ subsets: ["latin"], variable: "--font-lexend" })
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" })

export const metadata = {
  title: "TraderLCTNET | O Diário de Trade Profissional",
  description: "A plataforma nº 1 para traders de alta performance. Gerencie seus trades, analise estatísticas e domine o mercado.",
  manifest: "/manifest.json",
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
      <body className={`${lexend.variable} ${outfit.variable} font-sans antialiased`} suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster position="top-right" richColors />
        </ThemeProvider>
      </body>
    </html>
  );
}

