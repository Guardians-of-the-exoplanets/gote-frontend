"use client"

import { useState } from "react"
import { useMode } from "@/lib/mode-context"
import { usePlanetData } from "@/lib/planet-data-context"
import { DataInputSection } from "@/components/data-input-section"
import { ManualDataForm } from "@/components/manual-data-form"
import { ModelConfigSection } from "@/components/model-config-section"
import { PipelineSection } from "@/components/pipeline-section"
import { ResultsSection } from "@/components/results-section"
import { ExplainabilitySection } from "@/components/explainability-section"
import { VettingSection } from "@/components/vetting-section"
import { InteractiveVizSection } from "@/components/interactive-viz-section"
import { ExportSection } from "@/components/export-section"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Microscope, BarChart3, FileOutput, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AnalyticsDashboard } from "./analytics-dashboard"

export function ResearcherFlow() {
  const { mode } = useMode()
  const { isProcessing, prediction } = usePlanetData()
  const [activeTab, setActiveTab] = useState("pipeline")
  const [tabsVisible, setTabsVisible] = useState(false)

  if (mode !== "researcher") return null

  const hasResults = prediction !== null
  const canAccessPipeline = isProcessing || hasResults
  const showTabs = true
  const canAccessVisualization = hasResults
  const canAccessResults = hasResults
  const canAccessExport = hasResults

  // Auto-activate pipeline tab when processing starts
  if (isProcessing && activeTab !== "pipeline") {
    setActiveTab("pipeline")
  }

  return (
    <div className="space-y-8">
      {/* <Card className="p-4 md:p-6 bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
        <div>
          <h2 className="text-lg font-semibold mb-1">Modo Pesquisador</h2>
          <p className="text-sm text-muted-foreground">
            Pipeline completo de análise com configuração avançada e métricas detalhadas
          </p>
        </div>
      </Card> */}

      {/* Entrada de dados + Configuração do Modelo lado a lado (desktop) e empilhados (mobile) */}
      <section className="" id="data-and-config">
          <DataInputSection />
      </section>

      {/* Botão de classificação agora fica dentro do formulário manual (DataInputSection) */}

        {showTabs && (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 h-auto bg-transparent p-0 gap-2">
            <TabsTrigger
              value="pipeline"
              className="flex items-center gap-2 py-3"
              disabled={!canAccessPipeline}
            >
              <div className={`w-full px-4 py-2 rounded-lg border transition-all data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary/20 data-[state=active]:to-accent/20 data-[state=active]:border-primary/50`}>
                <div className="flex items-center gap-2 justify-center">
                  <Microscope className="h-4 w-4" />
                  <span className="text-xs md:text-sm">Pipeline</span>
                </div>
              </div>
            </TabsTrigger>
            <TabsTrigger
              value="analytics"
              className="flex items-center gap-2 py-3"
              disabled={!hasResults}
            >
              <div className={`w-full px-4 py-2 rounded-lg border transition-all ${canAccessPipeline ? "hover:bg-card/80" : "opacity-60"} data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary/20 data-[state=active]:to-accent/20 data-[state=active]:border-primary/50`}>
                <div className="flex items-center gap-2 justify-center">
                  <BarChart3 className="h-4 w-4" />
                  <span className="text-xs md:text-sm">Dashboard</span>
                </div>
              </div>
            </TabsTrigger>
            <TabsTrigger
              value="visualizations"
              className="flex items-center gap-2 py-3"
              disabled={!hasResults}
            >
              <div className={`w-full px-4 py-2 rounded-lg border transition-all ${canAccessPipeline ? "hover:bg-card/80" : "opacity-60"} data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary/20 data-[state=active]:to-accent/20 data-[state=active]:border-primary/50`}>
                <div className="flex items-center gap-2 justify-center">
                  <Sparkles className="h-4 w-4" />
                  <span className="text-xs md:text-sm">Visualizações</span>
                </div>
              </div>
            </TabsTrigger>
            <TabsTrigger
              value="results"
              className="flex items-center gap-2 py-3"
              disabled={!hasResults}
            >
              <div className={`w-full px-4 py-2 rounded-lg border transition-all ${canAccessPipeline ? "hover:bg-card/80" : "opacity-60"} data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary/20 data-[state=active]:to-accent/20 data-[state=active]:border-primary/50`}>
                <div className="flex items-center gap-2 justify-center">
                  <BarChart3 className="h-4 w-4" />
                  <span className="text-xs md:text-sm">Resultados</span>
                </div>
              </div>
            </TabsTrigger>
            <TabsTrigger
              value="export"
              className="flex items-center gap-2 py-3"
              disabled={!hasResults}
            >
              <div className={`w-full px-4 py-2 rounded-lg border transition-all ${canAccessPipeline ? "hover:bg-card/80" : "opacity-60"} data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary/20 data-[state=active]:to-accent/20 data-[state=active]:border-primary/50`}>
                <div className="flex items-center gap-2 justify-center">
                  <FileOutput className="h-4 w-4" />
                  <span className="text-xs md:text-sm">Exportar</span>
                </div>
              </div>
            </TabsTrigger>
          </TabsList>
          {!canAccessPipeline && (
            <div className="mt-4 text-center">
              <div className="inline-flex flex-col items-center gap-2 p-4 border rounded-xl bg-card/60 shadow-sm">
                <Microscope className="h-5 w-5 text-primary" />
                <p className="text-sm text-muted-foreground">Conclua as etapas de seleção de dataset, entrada e configuração do modelo para iniciar o pipeline.</p>
              </div>
            </div>
          )}
          {/* Conteúdos só aparecem quando permitido */}
          {canAccessPipeline && (
            <TabsContent value="pipeline" className="mt-6 space-y-8">
              <PipelineSection />
            </TabsContent>
          )}

          {hasResults && (
            <TabsContent value="analytics" className="mt-6 space-y-8">
              <AnalyticsDashboard />
            </TabsContent>
          )}

          {hasResults && (
            <TabsContent value="visualizations" className="mt-6 space-y-8">
              <InteractiveVizSection />
            </TabsContent>
          )}

          {hasResults && (
            <TabsContent value="results" className="mt-6 space-y-8">
              <ResultsSection />
              <ExplainabilitySection />
              <VettingSection />
            </TabsContent>
          )}

          {hasResults && (
            <TabsContent value="export" className="mt-6">
              <ExportSection />
            </TabsContent>
          )}
        </Tabs>
        )}
    </div>
  )
}
