import { Header } from "@/components/header"
import { ModeNavigation } from "@/components/mode-navigation"
import { TutorialOverlay } from "@/components/tutorial-overlay"
import { ExplorerFlow } from "@/components/explorer-flow"
import { ResearcherFlow } from "@/components/researcher-flow"
import { Sparkles } from "lucide-react"
import Image from "next/image"

export default function Home() {
  return (
    <div className="min-h-screen cosmic-grid">
      <Header />
      <ModeNavigation />
      <TutorialOverlay />
      <main className="container mx-auto px-4 py-8 space-y-8 max-w-7xl">
        <ExplorerFlow />
        <ResearcherFlow />
      </main>

      <footer className="border-t border-border/50 mt-20">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <Image
              src="/logo.png"
              alt="Guardians of The Exoplanets"
              width={220}
              height={40}
              className="h-12 w-auto"
              priority
            />
            <p className="text-sm text-muted-foreground text-center md:text-left">
              Desenvolvido com tecnologia de ponta para pesquisa espacial
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
