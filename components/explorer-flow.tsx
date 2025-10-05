"use client"

import { useMemo, useState, useEffect } from "react"
import { useMode } from "@/lib/mode-context"
import { usePlanetData } from "@/lib/planet-data-context"
import { DataInputSection } from "@/components/data-input-section"
import { ExplorerResultsSection } from "@/components/explorer-results-section"
import { ExportSection } from "@/components/export-section"
import dynamic from "next/dynamic"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { CheckCircle2, Circle, BarChart3, Globe, Download, Database, SlidersHorizontal, Brain, ShieldCheck, Timer, History, ChevronRight } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Info } from "lucide-react"
import { CandidateHistoryDialog } from "@/components/candidate-history-dialog"
import { groupRowsById, normalizeId, normalizeClassification, normalizeProbability, normalizePubdate } from "@/lib/utils"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination"

const PlanetVisualization = dynamic(
  () => import("@/components/planet-visualization").then((m) => m.PlanetVisualization),
  { ssr: false }
)

export function ExplorerFlow() {
  const { mode } = useMode()
  const { isProcessing, prediction, planetData, streamSteps, streamPredictions, runMeta } = usePlanetData()
  const [activeTab, setActiveTab] = useState("pipeline")
  const [historyOpen, setHistoryOpen] = useState(false)
  const [historySelection, setHistorySelection] = useState<{ id: string; entries: any[] } | null>(null)
  const steps = [
    { id: 1, name: "Enter Data", href: "#data", completed: false },
    { id: 2, name: "View Results", href: "#results", completed: false },
    { id: 3, name: "Export", href: "#export", completed: false },
  ]

  const normalizedPredictions = useMemo(() => {
    let preds: any = streamPredictions || []
    if (Array.isArray(preds) && preds.length > 0 && Array.isArray(preds[0])) {
      // Backend sometimes wraps each row (or the whole set) in an extra array
      preds = (preds as any[]).flat()
    }
    return preds as any[]
  }, [streamPredictions])

  const hasResults = prediction !== null || (normalizedPredictions && normalizedPredictions.length > 0)
  const canAccessPipeline = isProcessing || hasResults

  // Auto-activate pipeline tab when processing starts (mirror researcher behavior)
  useEffect(() => {
    if (isProcessing && activeTab !== "pipeline") {
      setActiveTab("pipeline")
    }
  }, [isProcessing])
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
  const pipelineCompleted = (streamSteps && streamSteps.length > 0) && streamSteps.every((s:any) => s && s.durationMs != null)
  const isExoplanet = prediction?.classification === "Confirmado" || prediction?.classification === "Candidato"
  const showVisualization = isExoplanet && Object.keys(planetData).length > 0

  // Pagination for grouped candidates table in Results tab
  const [currentPage, setCurrentPage] = useState(1)
  const rowsPerPage = 8

  const groupedPredictions = useMemo(() => {
    const map = groupRowsById(normalizedPredictions || [])
    const toRank = (d: string | null) => {
      if (!d) return -Infinity
      const [y, m] = String(d).split("-")
      const yy = Number(y) || 0
      const mm = Number(m) || 0
      return yy * 12 + mm
    }
    const arr = Array.from(map.entries()).map(([id, rows]) => {
      const entries = rows.map((r:any) => ({
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
    // sort by latest summary probability desc
    arr.sort((a,b)=> b.sortProb - a.sortProb)
    return arr
  }, [normalizedPredictions])

  const totalPages = Math.max(1, Math.ceil(groupedPredictions.length / rowsPerPage))
  const visibleGroups = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage
    const endIndex = startIndex + rowsPerPage
    return groupedPredictions.slice(startIndex, endIndex)
  }, [groupedPredictions, currentPage])

  const goToPage = (nextPage: number) => {
    if (nextPage < 1 || nextPage > totalPages) return
    setCurrentPage(nextPage)
  }

  const renderPageNumbers = () => {
    const items: (number | "ellipsis")[] = []
    const maxButtons = 5
    if (totalPages <= maxButtons) {
      for (let i = 1; i <= totalPages; i++) items.push(i)
    } else {
      const left = Math.max(2, currentPage - 1)
      const right = Math.min(totalPages - 1, currentPage + 1)
      items.push(1)
      if (left > 2) items.push("ellipsis")
      for (let i = left; i <= right; i++) items.push(i)
      if (right < totalPages - 1) items.push("ellipsis")
      items.push(totalPages)
    }
    return items
  }

  if (mode !== "explorer") return null

  return (
    <div className="space-y-8">
      <Card className="p-4 md:p-6 bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
        <div className="flex flex-col gap-4">
          <div>
            <h2 className="text-lg font-semibold mb-1">Explorer Mode</h2>
            <p className="text-sm text-muted-foreground">Discover if your signal is an exoplanet in 3 simple steps</p>
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
                  value="pipeline"
                  className="flex items-center gap-2 py-3"
                  disabled={!canAccessPipeline}
                >
                  <div className={`w-full px-4 py-2 rounded-lg border transition-all hover:bg-card/80 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary/20 data-[state=active]:to-accent/20 data-[state=active]:border-primary/50`}>
                    <div className="flex items-center gap-2 justify-center">
                      <Database className="h-4 w-4" />
                      <span className="hidden sm:inline">Pipeline</span>
                    </div>
                  </div>
                </TabsTrigger>

                <TabsTrigger
                  value="results"
                  className="flex items-center gap-2 py-3"
                  disabled={!hasResults}
                >
                  <div className={`w-full px-4 py-2 rounded-lg border transition-all ${hasResults ? "hover:bg-card/80" : "opacity-60"} data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary/20 data-[state=active]:to-accent/20 data-[state=active]:border-primary/50`}> 
                    <div className="flex items-center gap-2 justify-center">
                      <BarChart3 className="h-4 w-4" />
                  <span className="hidden sm:inline">Results</span>
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
                  <span className="hidden sm:inline">Export</span>
                    </div>
                  </div>
                </TabsTrigger>
          </TabsList>

          {!canAccessPipeline && (
            <div className="mt-4 text-center">
              <div className="inline-flex flex-col items-center gap-2 p-4 border rounded-xl bg-card/60 shadow-sm">
                <Info className="h-5 w-5 text-primary" />
                <p className="text-sm text-muted-foreground">Complete the dataset selection, input, and model configuration steps to start the pipeline.</p>
              </div>
            </div>
          )}

          {canAccessPipeline && (
          <TabsContent value="pipeline" className="mt-6">
            {/* Anchor to ensure smooth scroll lands in Explorer too */}
            <div id="pipeline" className="h-0" />
            <div className="space-y-6">
              {streamSteps.length > 0 && (
                <Card className="border-primary/20">
                  <div className="p-6">
                    <div className="text-center space-y-2 mb-4">
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-accent/10 border border-accent/20 rounded-full text-xs text-accent">
                        <Timer className="h-4 w-4" />
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

                    {/* Small summary, inspired by PipelineVisualization */}
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
                </Card>
              )}

            </div>
          </TabsContent>
          )}

          <TabsContent value="results" className="mt-6">
            <Card className="p-6 border-accent/30 bg-accent/5 mb-4">
              <div className="space-y-2 text-sm">
                <h4 className="font-semibold">How to read this table</h4>
                <p className="text-muted-foreground">The colored tag shows the model’s decision. The bar shows confidence. Sort by probability to find the strongest cases first.</p>
                {runMeta && (
                  <div className="mt-2 text-xs flex flex-wrap gap-2">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded border ${runMeta.inputKind==='upload' ? 'border-primary/40 text-primary bg-primary/10' : 'border-secondary/40 text-secondary bg-secondary/10'}`}>
                      <span className="h-1.5 w-1.5 rounded-full bg-current" />
                      {runMeta.inputKind === 'upload' ? 'Uploaded CSV' : 'Manual Input'}
                    </span>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded border ${runMeta.hasHyperparams ? 'border-emerald-400/50 text-emerald-400 bg-emerald-500/10' : 'border-amber-400/50 text-amber-400 bg-amber-500/10'}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${runMeta.hasHyperparams ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                      {runMeta.hasHyperparams ? 'With Hyperparametersww' : 'Baseline'}
                    </span>
                  </div>
                )}
                {runMeta?.inputKind === 'upload' && (
                  <p className="text-xs text-muted-foreground mt-2">
                    We grouped duplicate rows by <span className="font-medium text-foreground">Object ID</span>. The <span className="font-medium text-foreground">Records</span> column shows how many entries each candidate has. Click any row to open the candidate history and see all records; the table shows the latest classification per candidate.
                  </p>
                )}
              </div>
            </Card>
            {isSingleManualResult ? (
              (() => {
                const oldItem:any = (normalizedPredictions as any[]).find((x:any)=> 'old_classificacao' in x || 'old_probabilidade' in x)
                const row:any = oldItem ?? normalizedPredictions[0]
                const prob = Number(row.old_probabilidade ?? row.probabilidade ?? row.probability ?? 0)
                const raw = String(row.old_classificacao ?? row.classificacao ?? row.classification ?? '')
                const norm = raw.toLowerCase().normalize('NFD').replace(/[^a-z ]/g,'')
                const cls = norm.includes('confirm') ? 'Confirmed' : norm.includes('candidate') || norm.includes('candidat') ? 'Candidate' : 'False Positive'
                const badgeClass = cls === 'Confirmed'
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  : cls === 'Candidate'
                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                  : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                return (
                  <Card className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 bg-card border border-border rounded-lg">
                        <div className="text-sm text-muted-foreground mb-2">Classification</div>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded border text-sm ${badgeClass}`}>{cls}</span>
                      </div>
                      <div className="p-4 bg-card border border-border rounded-lg">
                        <div className="text-sm text-muted-foreground mb-2">Probability</div>
                        <div className="text-2xl font-bold font-mono text-primary">{Number.isFinite(prob) ? `${prob.toFixed(2)}%` : '—'}</div>
                      </div>
                      <div className="p-4 bg-card border border-border rounded-lg">
                        <div className="text-sm text-muted-foreground mb-2">Decision</div>
                        <div className="text-sm">{cls === 'False Positive' ? 'Unlikely an exoplanet' : 'Likely an exoplanet or candidate'}</div>
                      </div>
                    </div>
                  </Card>
                )
              })()
            ) : streamPredictions && streamPredictions.length > 0 ? (
              <>
              <div className="rounded-xl border overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left p-3">Object ID</th>
                      <th className="text-left p-3">Classification</th>
                      <th className="text-right p-3">Records</th>
                      <th className="text-right p-3">Avg Probability</th>
                      <th className="text-right p-3">History</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleGroups.map((g:any, idx:number) => {
                      const idVal = g.id
                      const cls = g.latest.classification as 'Confirmed' | 'Candidate' | 'False Positive'
                      const prob = g.latest.probability as number
                      const avgProb = (() => {
                        const vals = (g.entries || []).map((e:any)=> Number(e.probability) || 0)
                        const n = Math.max(1, vals.length)
                        return vals.reduce((a:number,b:number)=>a+b,0) / n
                      })()
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
                          title="Click to view candidate history"
                          onClick={() => { setHistorySelection({ id: idVal, entries: g.entries }); setHistoryOpen(true) }}
                        >
                          <td className="p-3 font-mono">{idVal}</td>
                          <td className="p-3">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded border text-xs ${badgeClass}`}>{cls}</span>
                          </td>
                          <td className="p-3 text-right">
                            <span className="inline-flex items-center justify-center min-w-8 px-2 py-0.5 rounded-md border bg-card/70 text-xs">
                              {g.entries.length}
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            <span className="font-mono">{Number.isFinite(avgProb) ? avgProb.toFixed(2) : '—'}%</span>
                          </td>
                          <td className="p-3 text-right">
                            <Button variant="ghost" size="sm" className="gap-1" onClick={(e)=>{ e.stopPropagation(); setHistorySelection({ id: idVal, entries: g.entries }); setHistoryOpen(true) }}>
                              <History className="h-3.5 w-3.5" />
                              <span className="hidden sm:inline">History</span>
                              <ChevronRight className="h-3.5 w-3.5" />
                            </Button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
              {groupedPredictions.length > rowsPerPage && (
                <div className="mt-4">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          href="#"
                          onClick={(e) => {
                            e.preventDefault()
                            goToPage(currentPage - 1)
                          }}
                          className={currentPage === 1 ? "pointer-events-none opacity-50" : undefined}
                        />
                      </PaginationItem>
                      {renderPageNumbers().map((item, idx) => (
                        <PaginationItem key={`${item}-${idx}`}>
                          {item === "ellipsis" ? (
                            <PaginationEllipsis />
                          ) : (
                            <PaginationLink
                              href="#"
                              isActive={item === currentPage}
                              onClick={(e) => {
                                e.preventDefault()
                                goToPage(item as number)
                              }}
                            >
                              {item}
                            </PaginationLink>
                          )}
                        </PaginationItem>
                      ))}
                      <PaginationItem>
                        <PaginationNext
                          href="#"
                          onClick={(e) => {
                            e.preventDefault()
                            goToPage(currentPage + 1)
                          }}
                          className={currentPage === totalPages ? "pointer-events-none opacity-50" : undefined}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
              <div className="mt-3 text-xs text-muted-foreground text-center">
                Colors: <span className="px-1 rounded border bg-emerald-500/10 text-emerald-500 border-emerald-500/20">Confirmed</span> · <span className="px-1 rounded border bg-amber-500/10 text-amber-500 border-amber-500/20">Candidate</span> · <span className="px-1 rounded border bg-rose-500/10 text-rose-500 border-rose-500/20">False Positive</span>. Higher bar = higher confidence.
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
              </>
            ) : (
              <ExplorerResultsSection />
            )}
          </TabsContent>

          <TabsContent value="export" className="mt-6">
            <ExportSection />
          </TabsContent>
        </Tabs>
        <div id="pipeline-explorer" className="scroll-mt-20 space-y-6"></div>
    </div>
  )
}
