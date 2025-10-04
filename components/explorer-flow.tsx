"use client"

import { useState } from "react"
import { useMode } from "@/lib/mode-context"
import { usePlanetData } from "@/lib/planet-data-context"
import { DataInputSection } from "@/components/data-input-section"
import { ExplorerResultsSection } from "@/components/explorer-results-section"
import { ExportSection } from "@/components/export-section"
import dynamic from "next/dynamic"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { CheckCircle2, Circle, BarChart3, Globe, Download } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Info } from "lucide-react"

const PlanetVisualization = dynamic(
  () => import("@/components/planet-visualization").then((m) => m.PlanetVisualization),
  { ssr: false }
)

export function ExplorerFlow() {
  const { mode } = useMode()
  const { prediction, planetData } = usePlanetData()
  const [activeTab, setActiveTab] = useState("results")

  if (mode !== "explorer") return null

  const steps = [
    { id: 1, name: "Inserir Dados", href: "#data", completed: false },
    { id: 2, name: "Ver Resultados", href: "#results", completed: false },
    { id: 3, name: "Exportar", href: "#export", completed: false },
  ]

  const hasResults = prediction !== null
  const isExoplanet = prediction?.classification === "Confirmado" || prediction?.classification === "Candidato"
  const showVisualization = isExoplanet && Object.keys(planetData).length > 0

  return (
    <div className="space-y-8">
      <Card className="p-4 md:p-6 bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
        <div className="flex flex-col gap-4">
          <div>
            <h2 className="text-lg font-semibold mb-1">Modo Explorador</h2>
            <p className="text-sm text-muted-foreground">Descubra se seu sinal é um exoplaneta em 3 passos simples</p>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center gap-3 w-full sm:w-auto">
                <div className="flex items-center gap-2 flex-1 sm:flex-initial">
                  <div className="flex-shrink-0">
                    {step.completed ? (
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                    ) : (
                      <div className="relative">
                        <Circle className="h-5 w-5 text-muted-foreground" />
                        <span className="absolute inset-0 flex items-center justify-center text-xs font-medium">
                          {step.id}
                        </span>
                      </div>
                    )}
                  </div>
                  <span className="text-sm font-medium">{step.name}</span>
                </div>
                {index < steps.length - 1 && <div className="hidden sm:block w-8 h-px bg-border flex-shrink-0" />}
              </div>
            ))}
          </div>
        </div>
      </Card>

      <DataInputSection />

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 h-auto bg-transparent p-0 gap-2">

                <TabsTrigger
                  value="results"
                  className="flex items-center gap-2 py-3"
                  disabled={!hasResults}
                >
                  <div className={`w-full px-4 py-2 rounded-lg border transition-all ${hasResults ? "hover:bg-card/80" : "opacity-60"} data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary/20 data-[state=active]:to-accent/20 data-[state=active]:border-primary/50`}> 
                    <div className="flex items-center gap-2 justify-center">
                      <BarChart3 className="h-4 w-4" />
                      <span className="hidden sm:inline">Resultados</span>
                    </div>
                  </div>
                </TabsTrigger>


                <TabsTrigger
                  value="visualization"
                  className="flex items-center gap-2 py-3"
                  disabled={!hasResults}
                >
                  <div className={`w-full px-4 py-2 rounded-lg border transition-all ${hasResults ? "hover:bg-card/80" : "opacity-60"} data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary/20 data-[state=active]:to-accent/20 data-[state=active]:border-primary/50`}>
                    <div className="flex items-center gap-2 justify-center">
                      <Globe className="h-4 w-4" />
                      <span className="hidden sm:inline">Visualização</span>
                    </div>
                  </div>
                </TabsTrigger>

                <TabsTrigger
                  value="export"
                  className="flex items-center gap-2 py-3"
                  disabled={!hasResults}
                >
                  <div className={`w-full px-4 py-2 rounded-lg border transition-all ${hasResults ? "hover:bg-card/80" : "opacity-60"} data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary/20 data-[state=active]:to-accent/20 data-[state=active]:border-primary/50`}>
                    <div className="flex items-center gap-2 justify-center">
                      <Download className="h-4 w-4" />
                      <span className="hidden sm:inline">Exportação</span>
                    </div>
                  </div>
                </TabsTrigger>
          </TabsList>

          {!hasResults && (
            <div className="mt-4 text-center">
              <div className="inline-flex flex-col items-center gap-2 p-4 border rounded-xl bg-card/60 shadow-sm">
                <Info className="h-5 w-5 text-primary" />
                <p className="text-sm text-muted-foreground">Conclua a seleção do dataset e a entrada de dados para desbloquear os resultados.</p>
              </div>
            </div>
          )}

          <TabsContent value="results" className="mt-6">
            <ExplorerResultsSection />
          </TabsContent>

          <TabsContent value="visualization" className="mt-6">
            <section id="visualization" className="scroll-mt-20">
                <div className="space-y-6">
                  <Card className="p-6 bg-gradient-to-br from-primary/10 via-accent/10 to-secondary/10 border-primary/30">
                    <div className="text-center mb-4">
                      <h3 className="text-2xl font-bold mb-2 gradient-text">Comparação: Terra vs Exoplaneta</h3>
                      <p className="text-muted-foreground">Compare o exoplaneta descoberto com a Terra lado a lado</p>
                    </div>
                  </Card>
                  {/* <PlanetVisualization
                    data={planetData}
                    comparisonMode={true}
                    classification={prediction?.classification}
                  /> */}
                </div>
            </section>
          </TabsContent>

          <TabsContent value="export" className="mt-6">
            <ExportSection />
          </TabsContent>
        </Tabs>
    </div>
  )
}
