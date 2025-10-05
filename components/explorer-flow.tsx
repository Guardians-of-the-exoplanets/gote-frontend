"use client"

import { useMemo, useState } from "react"
import { useMode } from "@/lib/mode-context"
import { usePlanetData } from "@/lib/planet-data-context"
import { DataInputSection } from "@/components/data-input-section"
import { ExplorerResultsSection } from "@/components/explorer-results-section"
import { ExportSection } from "@/components/export-section"
import dynamic from "next/dynamic"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { CheckCircle2, Circle, BarChart3, Globe, Download, Database, SlidersHorizontal, Brain, ShieldCheck, Timer } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Info } from "lucide-react"
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
  const { prediction, planetData, streamSteps, streamPredictions } = usePlanetData()
  const [activeTab, setActiveTab] = useState("pipeline")
  const steps = [
    { id: 1, name: "Enter Data", href: "#data", completed: false },
    { id: 2, name: "View Results", href: "#results", completed: false },
    { id: 3, name: "Export", href: "#export", completed: false },
  ]

  const hasResults = prediction !== null || (streamPredictions && streamPredictions.length > 0)
  const pipelineCompleted = (streamSteps && streamSteps.length > 0) && streamSteps.every((s:any) => s && s.durationMs != null)
  const isExoplanet = prediction?.classification === "Confirmado" || prediction?.classification === "Candidato"
  const showVisualization = isExoplanet && Object.keys(planetData).length > 0

  // Pagination for candidates table in Results tab
  const [currentPage, setCurrentPage] = useState(1)
  const rowsPerPage = 8

  const sortedPredictions = useMemo(() => {
    return (streamPredictions || [])
      .slice()
      .sort((a: any, b: any) => Number(b.probabilidade) - Number(a.probabilidade))
  }, [streamPredictions])

  const totalPages = Math.max(1, Math.ceil(sortedPredictions.length / rowsPerPage))
  const visibleRows = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage
    const endIndex = startIndex + rowsPerPage
    return sortedPredictions.slice(startIndex, endIndex)
  }, [sortedPredictions, currentPage])

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

          {!hasResults && (
            <div className="mt-4 text-center">
              <div className="inline-flex flex-col items-center gap-2 p-4 border rounded-xl bg-card/60 shadow-sm">
                <Info className="h-5 w-5 text-primary" />
                <p className="text-sm text-muted-foreground">Complete dataset selection and data entry to unlock results.</p>
              </div>
            </div>
          )}

          <TabsContent value="pipeline" className="mt-6">
            {/* Anchor to ensure smooth scroll lands in Explorer too */}
            <div id="pipeline" className="h-0" />
            <div className="space-y-6">
              <Card className="p-6 border-primary/30 bg-primary/5">
                <div className="space-y-3">
                  <h4 className="text-lg font-semibold">Story: From raw signal to a planet candidate</h4>
                  <ol className="list-decimal pl-5 space-y-2 text-sm text-muted-foreground">
                    <li><span className="text-foreground font-medium">Ingest</span> — You upload a file or type values. We validate and prepare the inputs.</li>
                    <li><span className="text-foreground font-medium">Preprocess</span> — We remove trends and noise so the transit becomes clear.</li>
                    <li><span className="text-foreground font-medium">AI Inference</span> — The model compares your signal with thousands of examples.</li>
                    <li><span className="text-foreground font-medium">Post‑process</span> — Simple checks highlight if it’s worth a closer look.</li>
                  </ol>
                  <p className="text-xs text-muted-foreground">Tip: Re-run with a slightly different transit depth to see confidence change.</p>
                </div>
              </Card>

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

          <TabsContent value="results" className="mt-6">
            <Card className="p-6 border-accent/30 bg-accent/5 mb-4">
              <div className="space-y-2 text-sm">
                <h4 className="font-semibold">How to read this table</h4>
                <p className="text-muted-foreground">The colored tag shows the model’s decision. The bar shows confidence. Sort by probability to find the strongest cases first.</p>
              </div>
            </Card>
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
                    {visibleRows.map((row:any) => {
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
              {sortedPredictions.length > rowsPerPage && (
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
              </>
            ) : (
              <ExplorerResultsSection />
            )}
          </TabsContent>

          <TabsContent value="export" className="mt-6">
            <ExportSection />
          </TabsContent>
        </Tabs>
    </div>
  )
}
