"use client"

import { useState, useMemo } from "react"
import { useMode } from "@/lib/mode-context"
import { usePlanetData } from "@/lib/planet-data-context"
import { DataInputSection } from "@/components/data-input-section"
import { ResultsSection } from "@/components/results-section"
import { ExplainabilitySection } from "@/components/explainability-section"
// import { VettingSection } from "@/components/vetting-section"
import { InteractiveVizSection } from "@/components/interactive-viz-section"
import { ExportSection } from "@/components/export-section"
import { VettingSection } from "@/components/vetting-section"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Microscope, BarChart3, FileOutput, History, ChevronRight } from "lucide-react"
import { AnalyticsDashboard } from "./analytics-dashboard"
import { CandidateHistoryDialog } from "@/components/candidate-history-dialog"
import { groupRowsById, normalizeId, normalizeClassification, normalizeProbability, normalizePubdate } from "@/lib/utils"

export function ResearcherFlow() {
  const { mode } = useMode()
  const { isProcessing, prediction, streamSteps, streamPredictions, runMeta } = usePlanetData()
  const [activeTab, setActiveTab] = useState("pipeline")
  const [historyOpen, setHistoryOpen] = useState(false)
  const [historySelection, setHistorySelection] = useState<{ id: string; entries: any[] } | null>(null)

  const showTabs = true


  // Do not early-return before hooks; render null at the bottom if needed

  // Flatten potential nested arrays from backend
  const normalizedPredictions = Array.isArray(streamPredictions)
    ? (Array.isArray((streamPredictions as any)[0]) ? (streamPredictions as any[]).flat() as any[] : streamPredictions)
    : []

  // Simplified: results are available if we have predictions or a non-null single prediction
  const hasResults = (normalizedPredictions.length > 0 || prediction !== null)
  const canAccessPipeline = isProcessing || hasResults || (streamSteps && streamSteps.length > 0)
  const canAccessVisualization = hasResults
  const canAccessResults = hasResults
  const canAccessExport = hasResults

  const isComparison = Array.isArray(normalizedPredictions) && normalizedPredictions.some((x:any) => (
    'old_classificacao' in (x || {}) ||
    'new_classificacao' in (x || {}) ||
    'old_classification' in (x || {}) ||
    'new_classification' in (x || {})
  ))
  const isSingleManualResult = Array.isArray(normalizedPredictions) && (
    (
      normalizedPredictions.length === 1 && !('id' in (normalizedPredictions[0] || {}))
    ) || (
      normalizedPredictions.length >= 1 && (
        ('old_classificacao' in (normalizedPredictions[0] || {})) ||
        ('old_probabilidade' in (normalizedPredictions[0] || {}))
      )
    )
  )

  // Group rows by id for standard tables
  const grouped = useMemo(() => {
    const map = groupRowsById(normalizedPredictions || [])
    const toRank = (d: string | null) => {
      if (!d) return -Infinity
      const [y, m] = String(d).split('-')
      const yy = Number(y) || 0
      const mm = Number(m) || 0
      return yy * 12 + mm
    }
    const arr = Array.from(map.entries()).map(([id, rows]) => {
      const entries = rows.map((r:any)=>({
        id: normalizeId(r),
        classification: normalizeClassification(r),
        probability: normalizeProbability(r),
        pubdate: normalizePubdate(r),
      }))
      entries.sort((a,b)=> toRank(a.pubdate) - toRank(b.pubdate))
      const latest = entries.slice(-1)[0] || { classification: 'Candidate', probability: 0 }
      const sortProb = latest?.probability ?? Math.max(0, ...entries.map(e=>e.probability))
      return { id, entries, latest, sortProb }
    })
    arr.sort((a,b)=> b.sortProb - a.sortProb)
    return arr
  }, [normalizedPredictions])

  if (mode !== "researcher") {
    return null
  }

  return (
    <div className="space-y-8">
      {/* Entrada de dados + Configuração do Modelo lado a lado (desktop) e empilhados (mobile) */}
      <section className="" id="data-and-config">
          <DataInputSection />
      </section>

      {/* Botão de classificação agora fica dentro do formulário manual (DataInputSection) */}

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
            >
              <div className={`w-full px-4 py-2 rounded-lg border transition-all ${canAccessPipeline ? "hover:bg-card/80" : "opacity-60"} data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary/20 data-[state=active]:to-accent/20 data-[state=active]:border-primary/50`}>
                <div className="flex items-center gap-2 justify-center">
                  <BarChart3 className="h-4 w-4" />
                  <span className="text-xs md:text-sm">Results</span>
                </div>
              </div>
            </TabsTrigger>

            <TabsTrigger
              value="analytics"
              className="flex items-center gap-2 py-3"
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
            >
              <div className={`w-full px-4 py-2 rounded-lg border transition-all ${canAccessPipeline ? "hover:bg-card/80" : "opacity-60"} data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary/20 data-[state=active]:to-accent/20 data-[state=active]:border-primary/50`}>
                <div className="flex items-center gap-2 justify-center">
                  <FileOutput className="h-4 w-4" />
                  <span className="text-xs md:text-sm">Exportar</span>
                </div>
              </div>
            </TabsTrigger>
          </TabsList>

          {!canAccessPipeline && !hasResults && (
            <div className="mt-4 text-center">
              <div className="inline-flex flex-col items-center gap-2 p-4 border rounded-xl bg-card/60 shadow-sm">
                <Microscope className="h-5 w-5 text-primary" />
                <p className="text-sm text-muted-foreground">Complete the dataset selection, input, and model configuration steps to start the pipeline.</p>
              </div>
            </div>
          )}

          <TabsContent value="pipeline" className="mt-6 space-y-8">
            {/* Ensure scroll target is inside the visible tab */}
            <div id="pipeline" className="h-0" />
            {streamSteps.length > 0 && (
              <div className="space-y-6">
                <div className="p-6 border rounded-xl">
                  <div className="text-center space-y-2 mb-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-primary/20 to-accent/20 border border-primary/30 rounded-full text-xs">
                      <Microscope className="h-4 w-4 text-primary" />
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
                        if (s.step === 400) {
                          return (
                            <div key={s.step} className={`p-3 rounded-lg border transition-all border-destructive/30 bg-destructive/5 `}>
                              <div className="flex items-center justify-between gap-3 min-w-0">
                                <div className="min-w-0 flex-1">
                                  <div className="text-xs text-muted-foreground">Error</div>
                                  <div className="font-medium truncate">{s.status}</div>
                                </div>
                              </div>
                            </div>
                          )
                        } else {
                        return (
                          <div key={s.step} className={`p-3 rounded-lg border transition-all ${done ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-sky-500/30 bg-sky-500/5'} `}>
                            <div className="flex items-center justify-between gap-3 min-w-0">
                              <div className="min-w-0 flex-1">
                                <div className="text-[10px] text-muted-foreground tracking-wide uppercase">Step {s.step}</div>
                                <div className="font-medium truncate">{s.status}</div>
                              </div>
                              <div className="flex items-center gap-3">
                                <div className="hidden sm:block w-28 h-1.5 bg-muted rounded overflow-hidden">
                                  <div className={`h-1.5 ${done ? 'bg-emerald-500' : 'bg-primary animate-pulse'} w-full`} />
                                </div>
                                <div className="text-xs font-mono text-muted-foreground flex-shrink-0">
                                  {done ? `${(s.durationMs!/1000).toFixed(2)}s` : 'running…'}
                                </div>
                              </div>
                            </div>
                          </div>
                        )
                      }})}
                  </div>
                  <div className="p-3 bg-muted/50 rounded-lg border border-border">
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
                        <div className="text-[10px] text-muted-foreground mt-0.5 truncate">Mode</div>
                        <div className="text-xs">
                          {runMeta?.inputKind === 'upload' ? 'Upload' : 'Manual'} • {runMeta?.hasHyperparams ? 'Hyperparams' : 'Baseline'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="results" className="mt-6 space-y-8">
            {runMeta && (
              <Card className="p-4 border-primary/30 bg-gradient-to-r from-primary/10 to-accent/10">
                <div className="flex flex-wrap gap-2 text-xs">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded border ${runMeta.inputKind==='upload' ? 'border-primary/30 text-primary' : 'border-secondary/30 text-secondary'}`}>
                    {runMeta.inputKind === 'upload' ? 'Uploaded CSV' : 'Manual Input'}
                  </span>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded border ${runMeta.hasHyperparams ? 'border-emerald-400/40 text-emerald-400' : 'border-amber-400/40 text-amber-400'}`}>
                    {runMeta.hasHyperparams ? 'With Hyperparameters' : 'Baseline'}
                  </span>
                </div>
              </Card>
            )}
            <ResultsSection />
          </TabsContent>

          <TabsContent value="analytics" className="mt-6 space-y-8">
            <AnalyticsDashboard />
          </TabsContent>

          <TabsContent value="visualizations" className="mt-6 space-y-8">
            <InteractiveVizSection />
          </TabsContent>

          <TabsContent value="export" className="mt-6">
            <ExportSection />
          </TabsContent>
        </Tabs>
        <div id="pipeline-researcher" className="scroll-mt-20 space-y-6"></div>
    </div>
  )
}
