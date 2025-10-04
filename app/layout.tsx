import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import "./globals.css"
import { ModeProvider } from "@/lib/mode-context"
import { PlanetDataProvider } from "@/lib/planet-data-context"

export const metadata: Metadata = {
  title: "Guardians of The Exoplanets - Classificador Avançado de Exoplanetas",
  description:
    "Plataforma híbrida para análise e classificação de dados de exoplanetas usando modelos de IA/ML de última geração com modos Explorador e Pesquisador",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable} antialiased`}>
        <ModeProvider>
          <PlanetDataProvider>
            <Suspense fallback={null}>{children}</Suspense>
            <Analytics />
          </PlanetDataProvider>
        </ModeProvider>
      </body>
    </html>
  )
}
