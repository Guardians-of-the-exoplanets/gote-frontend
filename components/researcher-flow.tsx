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
  const showTabs = tabsVisible || canAccessPipeline
  const canAccessVisualization = hasResults
  const canAccessResults = hasResults
  const canAccessExport = hasResults

  return (
    <div className="space-y-8">
      <Card className="p-4 md:p-6 bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
        <div>
          <h2 className="text-lg font-semibold mb-1">Modo Pesquisador</h2>
          <p className="text-sm text-muted-foreground">
            Pipeline completo de análise com configuração avançada e métricas detalhadas
          </p>
        </div>
      </Card>

      {/* Entrada de dados + Configuração do Modelo lado a lado (desktop) e empilhados (mobile) */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="data-and-config">
        <div className="lg:col-span-2">
          <DataInputSection />
        </div>
        <div className="lg:col-span-1 order-last lg:order-none">
          <ModelConfigSection />
        </div>
      </section>

      {/* Botão de classificação agora fica dentro do formulário manual (DataInputSection) */}

        {showTabs && (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 h-auto">
            <TabsTrigger
              value="pipeline"
              className="flex items-center gap-2 py-3"
            >
              <Microscope className="h-4 w-4" />
              <span className="text-xs md:text-sm">Pipeline</span>
            </TabsTrigger>
            <TabsTrigger
              value="analytics"
              className="flex items-center gap-2 py-3"
            >
              <BarChart3 className="h-4 w-4" />
              <span className="text-xs md:text-sm">Dashboard Analítico</span>
            </TabsTrigger>
            <TabsTrigger
              value="visualizations"
              className="flex items-center gap-2 py-3"
            >
              <Sparkles className="h-4 w-4" />
              <span className="text-xs md:text-sm">Visualizações</span>
            </TabsTrigger>
            <TabsTrigger
              value="results"
              className="flex items-center gap-2 py-3"
            >
              <BarChart3 className="h-4 w-4" />
              <span className="text-xs md:text-sm">Resultados</span>
            </TabsTrigger>
            <TabsTrigger
              value="export"
              className="flex items-center gap-2 py-3"
            >
              <FileOutput className="h-4 w-4" />
              <span className="text-xs md:text-sm">Exportar</span>
            </TabsTrigger>
          </TabsList>
          {/* A aba de Configuração foi removida do conteúdo de abas; mantida acima ao lado de Entrada de Dados */}

          <TabsContent value="pipeline" className="mt-6 space-y-8">
            <PipelineSection />
          </TabsContent>

          <TabsContent value="analytics" className="mt-6 space-y-8">
            <AnalyticsDashboard />
          </TabsContent>

          <TabsContent value="visualizations" className="mt-6 space-y-8">
            <InteractiveVizSection />
          </TabsContent>

          <TabsContent value="results" className="mt-6 space-y-8">
            <ResultsSection />
            <ExplainabilitySection />
            <VettingSection />
          </TabsContent>

          <TabsContent value="export" className="mt-6">
            <ExportSection />
          </TabsContent>
        </Tabs>
        )}
    </div>
  )
}
