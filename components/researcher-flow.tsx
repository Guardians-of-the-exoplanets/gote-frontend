"use client"

import { useEffect, useState } from "react"
import { useMode } from "@/lib/mode-context"
import { usePlanetData } from "@/lib/planet-data-context"
import { DataInputSection } from "@/components/data-input-section"
import { ManualDataForm } from "@/components/manual-data-form"
import { ModelConfigSection } from "@/components/model-config-section"
import { ResultsSection } from "@/components/results-section"
import { ExplainabilitySection } from "@/components/explainability-section"
// import { VettingSection } from "@/components/vetting-section"
import { InteractiveVizSection } from "@/components/interactive-viz-section"
import { ExportSection } from "@/components/export-section"
import { VettingSection } from "@/components/vetting-section"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Microscope, BarChart3, FileOutput, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AnalyticsDashboard } from "./analytics-dashboard"

export function ResearcherFlow() {
  const { mode } = useMode()
  const { isProcessing, prediction, streamSteps, streamPredictions } = usePlanetData()
  const [activeTab, setActiveTab] = useState("pipeline")
  const [tabsVisible, setTabsVisible] = useState(false)

  const hasResults = (prediction !== null) || (streamPredictions && streamPredictions.length > 0)
  const canAccessPipeline = isProcessing || hasResults
  const showTabs = true
  const canAccessVisualization = hasResults
  const canAccessResults = hasResults
  const canAccessExport = hasResults

  // Auto-activate pipeline tab when processing starts
  useEffect(() => {
    if (isProcessing && activeTab !== "pipeline") {
      setActiveTab("pipeline")
    }
  }, [isProcessing])

  if (mode !== "researcher") return null

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
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 h-auto bg-transparent p-0 gap-2">
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
              value="analytics"
              className="flex items-center gap-2 py-3"
              disabled={!hasResults}
            >
              <div className={`w-full px-4 py-2 rounded-lg border transition-all ${canAccessPipeline ? "hover:bg-card/80" : "opacity-60"} data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary/20 data-[state=active]:to-accent/20 data-[state=active]:border-primary/50`}>
                <div className="flex items-center gap-2 justify-center">
                  <BarChart3 className="h-4 w-4" />
                  <span className="text-xs md:text-sm">Analytics Dashboard</span>
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
              {/* Ensure scroll target is inside the visible tab */}
              <div id="pipeline" className="h-0" />
              {streamSteps.length > 0 && (
                <div className="space-y-6">
                  <div className="p-6 border rounded-xl">
                    <div className="text-center space-y-2 mb-4">
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-accent/10 border border-accent/20 rounded-full text-xs text-accent">
                        <Microscope className="h-4 w-4" />
                        Live Pipeline
                      </div>
                      <h4 className="text-xl font-semibold">Processing</h4>
                      <p className="text-muted-foreground text-sm">Realtime view of each step as your data flows through the model</p>
                    </div>

                    <div className="space-y-3">
                      {streamSteps
                        .slice()
                        .sort((a,b)=>a.step-b.step)
                        .map((s) => {
                          const done = typeof s.durationMs === 'number'
                          return (
                            <div key={s.step} className={`p-3 rounded-lg border transition-all ${done ? 'border-primary/30 bg-primary/5' : 'border-accent/30 bg-accent/5'} `}>
                              <div className="flex items-center justify-between gap-3 min-w-0">
                                <div className="min-w-0 flex-1">
                                  <div className="text-xs text-muted-foreground">Step {s.step}</div>
                                  <div className="font-medium truncate">{s.status}</div>
                                </div>
                                <div className="text-xs font-mono text-muted-foreground flex-shrink-0">
                                  {done ? `${(s.durationMs!/1000).toFixed(2)}s` : 'running…'}
                                </div>
                              </div>
                            </div>
                          )
                        })}
                    </div>
                    <div className="mt-4 p-3 bg-muted/50 rounded-lg border border-border">
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div>
                          <div className="text-lg font-bold text-primary">{streamSteps.filter(s=>s.durationMs!=null).length}/{streamSteps.length}</div>
                          <div className="text-[10px] text-muted-foreground mt-0.5 truncate">Completed</div>
                        </div>
                        <div>
                          <div className="text-lg font-bold text-accent">{(streamSteps.reduce((acc,s)=>acc+(s.durationMs||0),0)/1000).toFixed(1)}s</div>
                          <div className="text-[10px] text-muted-foreground mt-0.5 truncate">Elapsed</div>
                        </div>
                        <div>
                          <div className="text-lg font-bold text-secondary">—</div>
                          <div className="text-[10px] text-muted-foreground mt-0.5 truncate">Remaining</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
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
              {streamPredictions && streamPredictions.length > 0 ? (
                <>
                <div className="rounded-xl border overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="text-left p-3">Object ID</th>
                        <th className="text-left p-3">Classification</th>
                        <th className="text-right p-3">Probability</th>
                      </tr>
                    </thead>
                    <tbody>
                      {streamPredictions.map((row:any) => {
                        const prob = Number(row.probabilidade)
                        const raw = String(row.classificacao ?? row.classification ?? '')
                        const norm = raw.toLowerCase().normalize('NFD').replace(/[^a-z ]/g,'')
                        const cls = norm.includes('confirm') ? 'Confirmed' : norm.includes('candidate') || norm.includes('candidat') ? 'Candidate' : 'False Positive'
                        const badgeClass = cls === 'Confirmed'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : cls === 'Candidate'
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                          : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                        return (
                          <tr key={row.id} className="border-t">
                            <td className="p-3 font-mono">{row.id}</td>
                            <td className="p-3">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded border text-xs ${badgeClass}`}>{cls}</span>
                            </td>
                            <td className="p-3">
                              <div className="flex items-center gap-2">
                                <div className="relative w-full h-2 bg-muted rounded">
                                  <div className="absolute left-0 top-0 h-2 rounded bg-primary/80" style={{ width: `${prob}%` }} />
                                </div>
                                <span className="text-right w-16 font-mono">{prob.toFixed(2)}%</span>
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
                {streamPredictions.some((row:any) => String(row.classificacao) === "Candidato") && (
                  <div className="mt-6">
                    <VettingSection />
                  </div>
                )}
                </>
              ) : (
                <>
                  <ResultsSection />
                  <ExplainabilitySection />
                </>
              )}
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
