"use client"

import { useEffect, useState, useMemo } from "react"
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
import { CandidateHistoryDialog } from "@/components/candidate-history-dialog"
import { groupRowsById, normalizeId, normalizeClassification, normalizeProbability, normalizePubdate } from "@/lib/utils"
import { Switch } from "@/components/ui/switch"

export function ResearcherFlow() {
  const { mode } = useMode()
  const { isProcessing, prediction, streamSteps, streamPredictions, runMeta, useHyperparams, setUseHyperparams } = usePlanetData()
  const [activeTab, setActiveTab] = useState("pipeline")
  const [tabsVisible, setTabsVisible] = useState(false)
  const [historyOpen, setHistoryOpen] = useState(false)
  const [historySelection, setHistorySelection] = useState<{ id: string; entries: any[] } | null>(null)

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

  // Do not early-return before hooks; render null at the bottom if needed

  // Flatten potential nested arrays from backend
  const normalizedPredictions = Array.isArray(streamPredictions) && streamPredictions.length > 0 && Array.isArray((streamPredictions as any)[0])
    ? (streamPredictions as any[]).flat() as any[]
    : (streamPredictions || [])

  const isComparison = Array.isArray(normalizedPredictions) && normalizedPredictions.some((x:any) => 'old_classificacao' in x || 'new_classificacao' in x)

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
                  <span className="text-xs md:text-sm">Results</span>
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
                        })}
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
              {isComparison ? (
                (() => {
                  const oldItem:any = normalizedPredictions.find((x:any) => 'old_classificacao' in x || 'old_probabilidade' in x)
                  const newItem:any = normalizedPredictions.find((x:any) => 'new_classificacao' in x || 'new_probabilidade' in x)
                  if (oldItem || newItem) {
                    const oldCls = String(oldItem?.old_classificacao ?? '')
                    const oldProb = Number(oldItem?.old_probabilidade ?? 0)
                    const newCls = String(newItem?.new_classificacao ?? '')
                    const newProb = Number(newItem?.new_probabilidade ?? 0)
                    const badge = (cls:string) => cls.toLowerCase().includes('confirm')
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      : cls.toLowerCase().includes('candidate')
                      ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                    return (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card className="border-primary/20">
                          <div className="p-5 space-y-3">
                            <div className="text-xs text-muted-foreground">Baseline (sem hiperparâmetros)</div>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded border text-sm ${badge(oldCls)}`}>{oldCls || '—'}</span>
                            <div className="text-sm font-mono">{Number.isFinite(oldProb) ? `${oldProb.toFixed(2)}%` : '—'}</div>
                          </div>
                        </Card>
                        <Card className="border-accent/20">
                          <div className="p-5 space-y-3">
                            <div className="text-xs text-muted-foreground">Com hiperparâmetros</div>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded border text-sm ${badge(newCls)}`}>{newCls || '—'}</span>
                            <div className="text-sm font-mono">{Number.isFinite(newProb) ? `${newProb.toFixed(2)}%` : '—'}</div>
                          </div>
                        </Card>
                      </div>
                    )
                  }
                  return null
                })()
              ) : normalizedPredictions && normalizedPredictions.length > 0 ? (
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
                      {grouped.map((g:any, idx:number) => {
                        const idVal = g.id
                        const cls = g.latest.classification as 'Confirmed' | 'Candidate' | 'False Positive'
                        const prob = g.latest.probability as number
                        const badgeClass = cls === 'Confirmed'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : cls === 'Candidate'
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                          : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                        const key = `${idVal}-${idx}`
                        return (
                          <tr
                            key={key}
                            className="border-t hover:bg-muted/30 cursor-pointer"
                            onClick={() => { setHistorySelection({ id: idVal, entries: g.entries }); setHistoryOpen(true) }}
                          >
                            <td className="p-3 font-mono">{idVal}</td>
                            <td className="p-3">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded border text-xs ${badgeClass}`}>{cls}</span>
                              {g.entries.length > 1 && (
                                <span className="ml-2 text-xs text-muted-foreground">{g.entries.length}×</span>
                              )}
                            </td>
                            <td className="p-3">
                              <div className="flex items-center gap-2">
                                <div className="relative w-full h-2 bg-muted rounded">
                                  <div className="absolute left-0 top-0 h-2 rounded bg-primary/80" style={{ width: `${prob}%` }} />
                                </div>
                                <span className="text-right w-16 font-mono">{Number.isFinite(prob) ? prob.toFixed(2) : '—'}%</span>
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
                <CandidateHistoryDialog
                  open={historyOpen}
                  onOpenChange={setHistoryOpen}
                  candidateId={historySelection?.id || ''}
                  entries={(historySelection?.entries || []).map((r:any)=>({
                    id: normalizeId(r),
                    classification: normalizeClassification(r),
                    probability: normalizeProbability(r),
                    pubdate: normalizePubdate(r),
                  }))}
                />
                {normalizedPredictions.some((row:any) => String(row.classificacao ?? row.classification ?? '') === "Candidato") && (
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
        <div id="pipeline-researcher" className="scroll-mt-20 space-y-6"></div>
    </div>
  )
}
