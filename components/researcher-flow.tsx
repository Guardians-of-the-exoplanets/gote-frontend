"use client"

import { useState, useMemo, useEffect, useRef } from "react"
import { useMode } from "@/lib/mode-context"
import { usePlanetData } from "@/lib/planet-data-context"
import { DataInputSection } from "@/components/data-input-section"
import { ResultsSection } from "@/components/results-section"
import { ExplainabilitySection } from "@/components/explainability-section"
// import { VettingSection } from "@/components/vetting-section"
import { ExportSection } from "@/components/export-section"
import { VettingSection } from "@/components/vetting-section"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Microscope, BarChart3, FileOutput, History, ChevronRight, TrendingUp, Activity, Cpu, CheckCircle2, AlertCircle, Clock, Zap, Database, Brain, Target } from "lucide-react"
import { AnalyticsDashboard } from "./analytics-dashboard"
import { CandidateHistoryDialog } from "@/components/candidate-history-dialog"
import { groupRowsById, normalizeId, normalizeClassification, normalizeProbability, normalizePubdate } from "@/lib/utils"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"

export function ResearcherFlow() {
  const { mode } = useMode()
  const { isProcessing, prediction, streamSteps, streamPredictions, runMeta } = usePlanetData()
  const [activeTab, setActiveTab] = useState("pipeline")
  const [historyOpen, setHistoryOpen] = useState(false)
  const [historySelection, setHistorySelection] = useState<{ id: string; entries: any[] } | null>(null)
  const hasAutoSwitchedRef = useRef(false)
  
  // Dynamic timer for real-time elapsed time
  const [elapsedTime, setElapsedTime] = useState(0)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const startTimeRef = useRef<number | null>(null)

  const showTabs = true

  // Format time as "XXs (Xm Ys)" or just "XXs" if under 60s
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    if (mins > 0) {
      return `${seconds.toFixed(2)}s (${mins}m ${secs.toFixed(0)}s)`
    }
    return `${seconds.toFixed(2)}s`
  }

  // Dynamic timer effect - updates every 100ms while processing
  useEffect(() => {
    if (isProcessing) {
      if (!startTimeRef.current) {
        startTimeRef.current = Date.now()
        setElapsedTime(0)
      }
      
      timerRef.current = setInterval(() => {
        if (startTimeRef.current) {
          const elapsed = (Date.now() - startTimeRef.current) / 1000
          setElapsedTime(elapsed)
        }
      }, 100) // Update every 100ms for smooth counting

      return () => {
        if (timerRef.current) {
          clearInterval(timerRef.current)
        }
      }
    } else {
      // Processing finished, clear timer but keep final time
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
      startTimeRef.current = null
    }
  }, [isProcessing])

  // Auto-switch to results tab when pipeline completes (only once per run)
  useEffect(() => {
    // Check if we have a final step (step 7 = predictions done)
    const hasFinalStep = streamSteps.some(s => s.step === 7 || (s.status && s.status.toLowerCase().includes('prediction') && s.status.toLowerCase().includes('done')))

    // Only auto-switch if:
    // 1. We haven't auto-switched yet for this run
    // 2. We have predictions available (or final step exists)
    // 3. Processing is done
    // 4. We're currently on the pipeline tab
    if (
      !hasAutoSwitchedRef.current &&
      (
        (streamPredictions && Array.isArray(streamPredictions) && streamPredictions.length > 0) ||
        hasFinalStep
      ) &&
      !isProcessing &&
      activeTab === "pipeline"
    ) {
      // eslint-disable-next-line no-console
      console.log('[ResearcherFlow] 🎯 Auto-switching to Results tab')
      setTimeout(() => {
        setActiveTab("results")
        hasAutoSwitchedRef.current = true
      }, 150) // Small delay to ensure state updates have propagated
    }
  }, [streamPredictions, isProcessing, activeTab, streamSteps])

  // Reset auto-switch flag when processing starts (new run)
  useEffect(() => {
    if (isProcessing) {
      hasAutoSwitchedRef.current = false
    }
  }, [isProcessing])

  // Do not early-return before hooks; render null at the bottom if needed

  // Flatten potential nested arrays from backend
  const normalizedPredictions = Array.isArray(streamPredictions)
    ? (Array.isArray((streamPredictions as any)[0]) ? (streamPredictions as any[]).flat() as any[] : streamPredictions)
    : []

  // Simplified: results are available if we have predictions or a non-null single prediction
  // Also check streamSteps for final completion status
  const hasFinalStep = streamSteps.some(s => s.step === 7 || (s.status && s.status.toLowerCase().includes('prediction') && s.status.toLowerCase().includes('done')))
  const hasResults = (normalizedPredictions.length > 0 || prediction !== null || (hasFinalStep && !isProcessing))
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
              disabled={!hasResults}
            >
              <div className={`w-full px-4 py-2 rounded-lg border transition-all ${hasResults ? "hover:bg-card/80" : "opacity-60"} data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary/20 data-[state=active]:to-accent/20 data-[state=active]:border-primary/50`}>
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
              <div className={`w-full px-3 py-2 rounded-lg border-2 transition-all ${hasResults ? "hover:bg-accent/10 hover:border-accent/40" : "opacity-60"} data-[state=active]:bg-gradient-to-r data-[state=active]:from-accent/20 data-[state=active]:to-primary/20 data-[state=active]:border-accent/60 data-[state=active]:shadow-lg`}>
                <div className="flex items-center gap-2 justify-center">
                  <TrendingUp className="h-4 w-4" />
                  <span className="text-xs md:text-sm font-semibold">Analytics</span>
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
                  <FileOutput className="h-4 w-4" />
                  <span className="text-xs md:text-sm">Export</span>
                </div>
              </div>
            </TabsTrigger>
          </TabsList>


          <TabsContent value="pipeline" className="mt-0 space-y-8">
            {/* Ensure scroll target is inside the visible tab */}
            <div id="pipeline" className="h-0" />
            {streamSteps.length > 0 ? (
              <>
                {/* Technical Pipeline Header */}
                <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-background to-accent/5">
                  <div className="p-6">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="p-2 bg-primary/20 rounded-lg">
                            <Cpu className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold">ML Pipeline Execution</h3>
                            <p className="text-xs text-muted-foreground">Real-time monitoring • {runMeta?.dataset?.toUpperCase() || 'Kepler'} Dataset</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="border-primary/40 text-primary font-mono">
                          <Activity className="h-3 w-3 mr-1" />
                          {streamSteps.filter(s=>s.durationMs!=null).length}/{streamSteps.length} steps
                        </Badge>
                        <Badge variant="outline" className={`font-mono ${isProcessing ? 'border-accent/40 text-accent animate-pulse' : 'border-accent/40 text-accent'}`}>
                          <Clock className="h-3 w-3 mr-1" />
                          {isProcessing ? formatTime(elapsedTime) : formatTime(streamSteps.reduce((acc,s)=>acc+(s.durationMs||0),0)/1000)}
                        </Badge>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-muted-foreground">Pipeline Progress</span>
                        <span className="text-xs font-mono font-semibold text-primary">
                          {Math.round((streamSteps.filter(s=>s.durationMs!=null).length / streamSteps.length) * 100)}%
                        </span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden border border-border">
                        <div 
                          className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500"
                          style={{ width: `${(streamSteps.filter(s=>s.durationMs!=null).length / streamSteps.length) * 100}%` }}
                        />
                      </div>
                    </div>

                    {/* Configuration Info */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      <div className="p-2 rounded-lg bg-card/60 border border-border">
                        <div className="text-[10px] text-muted-foreground uppercase tracking-wide">Input Mode</div>
                        <div className="text-xs font-medium">{runMeta?.inputKind === 'upload' ? 'Batch CSV' : 'Single Entry'}</div>
                      </div>
                      <div className="p-2 rounded-lg bg-card/60 border border-border">
                        <div className="text-[10px] text-muted-foreground uppercase tracking-wide">Model Config</div>
                        <div className="text-xs font-medium">{runMeta?.hasHyperparams ? 'Custom HP' : 'Baseline'}</div>
                      </div>
                      <div className="p-2 rounded-lg bg-card/60 border border-border">
                        <div className="text-[10px] text-muted-foreground uppercase tracking-wide">Dataset</div>
                        <div className="text-xs font-medium">{runMeta?.dataset?.toUpperCase() || 'KEPLER'}</div>
                      </div>
                      <div className="p-2 rounded-lg bg-card/60 border border-border">
                        <div className="text-[10px] text-muted-foreground uppercase tracking-wide">Predictions</div>
                        <div className="text-xs font-medium">{normalizedPredictions.length || '—'}</div>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Technical Step Breakdown */}
                <div className="grid gap-3">
                    {streamSteps
                      .slice()
                      .sort((a,b)=>a.step-b.step)
                    .map((s, idx) => {
                        const done = typeof s.durationMs === 'number'
                      const isActive = idx === streamSteps.filter(st=>st.durationMs!=null).length && !done
                      const isError = s.step === 400
                      
                      // Technical step metadata
                      const getStepMeta = () => {
                        const statusLower = s.status.toLowerCase()
                        if (statusLower.includes('reading') || statusLower.includes('csv')) {
                          return { icon: <Database className="h-4 w-4" />, category: 'I/O', color: 'text-blue-400' }
                        }
                        if (statusLower.includes('preprocess')) {
                          return { icon: <Zap className="h-4 w-4" />, category: 'ETL', color: 'text-yellow-400' }
                        }
                        if (statusLower.includes('download') || statusLower.includes('model')) {
                          return { icon: <Brain className="h-4 w-4" />, category: 'Model', color: 'text-purple-400' }
                        }
                        if (statusLower.includes('training')) {
                          return { icon: <Activity className="h-4 w-4" />, category: 'Training', color: 'text-pink-400' }
                        }
                        if (statusLower.includes('predict')) {
                          return { icon: <Target className="h-4 w-4" />, category: 'Inference', color: 'text-green-400' }
                        }
                        return { icon: <Cpu className="h-4 w-4" />, category: 'Process', color: 'text-gray-400' }
                      }
                      
                      const meta = getStepMeta()
                      
                        return (
                        <Card 
                          key={s.step}
                          className={`
                            transition-all duration-300 border-l-4
                            ${isError 
                              ? 'border-l-red-500 bg-red-500/10 shadow-lg' 
                              : done 
                              ? 'border-l-emerald-500 bg-emerald-500/5' 
                              : isActive 
                              ? 'border-l-primary bg-primary/5 shadow-md' 
                              : 'border-l-muted bg-muted/20'
                            }
                          `}
                        >
                          <div className="p-4">
                            <div className="flex items-center gap-4">
                              {/* Step Icon & Category */}
                              <div className="flex-shrink-0">
                                <div className={`
                                  p-3 rounded-lg transition-all
                                  ${isError
                                    ? 'bg-red-500/20 text-red-500'
                                    : done 
                                    ? 'bg-emerald-500/20 text-emerald-500' 
                                    : isActive 
                                    ? 'bg-primary/20 text-primary' 
                                    : 'bg-muted text-muted-foreground'
                                  }
                                `}>
                                  {isError ? <AlertCircle className="h-4 w-4" /> : done ? <CheckCircle2 className="h-4 w-4" /> : meta.icon}
                                </div>
                              </div>

                              {/* Step Info */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className={`text-[10px] font-mono font-bold uppercase tracking-wider ${isError ? 'text-red-500' : 'text-muted-foreground'}`}>
                                    STEP {s.step}
                                  </span>
                                  {isError ? (
                                    <Badge variant="outline" className="text-[9px] font-mono text-red-500 border-red-500">
                                      ERROR
                                    </Badge>
                                  ) : (
                                    <Badge variant="outline" className={`text-[9px] font-mono ${meta.color} border-current`}>
                                      {meta.category}
                                    </Badge>
                                  )}
                                  {isActive && !isError && (
                                    <div className="flex items-center gap-1">
                                      <span className="relative flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                                      </span>
                                      <span className="text-[10px] font-mono text-primary animate-pulse">ACTIVE</span>
                                    </div>
                                  )}
                                </div>
                                <div className={`font-medium text-sm mb-1 ${isError ? 'text-red-500' : 'text-foreground'}`}>{s.status}</div>
                                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                  {isError && (
                                    <span className="flex items-center gap-1 text-red-500">
                                      <AlertCircle className="h-3 w-3" />
                                      <span>Invalid file format for selected dataset</span>
                                    </span>
                                  )}
                                  {done && !isError && (
                                    <>
                                      <span className="flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        <span className="font-mono">{(s.durationMs!/1000).toFixed(3)}s</span>
                                      </span>
                                      <span className="flex items-center gap-1">
                                        <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                                        <span>Completed</span>
                                      </span>
                                    </>
                                  )}
                                  {isActive && !isError && (
                                    <span className="flex items-center gap-1 text-primary">
                                      <Activity className="h-3 w-3 animate-pulse" />
                                      <span>Processing...</span>
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Visual Progress Bar */}
                              <div className="hidden md:block flex-shrink-0 w-32">
                                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                                  <div 
                                    className={`h-full transition-all duration-500 ${
                                      isError ? 'bg-red-500 w-full' : done ? 'bg-emerald-500 w-full' : isActive ? 'bg-primary w-3/4 animate-pulse' : 'w-0'
                                    }`} 
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        </Card>
                        )
                      })}
                  </div>

                {/* Technical Summary Footer */}
                <Card className="border-accent/30 bg-gradient-to-r from-accent/5 to-primary/5">
                  <div className="p-5">
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                      <div className="space-y-1">
                        <div className="text-[10px] text-muted-foreground uppercase tracking-wide">Total Steps</div>
                        <div className="text-2xl font-bold font-mono text-primary">{streamSteps.length}</div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-[10px] text-muted-foreground uppercase tracking-wide">Completed</div>
                        <div className="text-2xl font-bold font-mono text-emerald-500">{streamSteps.filter(s=>s.durationMs!=null).length}</div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-[10px] text-muted-foreground uppercase tracking-wide">Total Time</div>
                        <div className={`text-xl md:text-2xl font-bold font-mono text-accent ${isProcessing ? 'animate-pulse' : ''}`}>
                          {isProcessing ? (
                            <span className="text-base md:text-xl">{formatTime(elapsedTime)}</span>
                          ) : (
                            <span className="text-base md:text-xl">{formatTime(streamSteps.reduce((acc,s)=>acc+(s.durationMs||0),0)/1000)}</span>
                          )}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-[10px] text-muted-foreground uppercase tracking-wide">Avg/Step</div>
                        <div className="text-2xl font-bold font-mono text-primary">
                          {streamSteps.filter(s=>s.durationMs!=null).length > 0 ? ((streamSteps.reduce((acc,s)=>acc+(s.durationMs||0),0)/1000) / streamSteps.filter(s=>s.durationMs!=null).length).toFixed(3) : '—'}s
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-[10px] text-muted-foreground uppercase tracking-wide">Status</div>
                        <div className="text-lg font-bold">
                          {streamSteps.every(s=>s.durationMs!=null) ? (
                            <Badge className="bg-emerald-500/20 text-emerald-500 border-emerald-500/30">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Complete
                            </Badge>
                          ) : (
                            <Badge className="bg-primary/20 text-primary border-primary/30">
                              <Activity className="h-3 w-3 mr-1 animate-pulse" />
                              Running
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Technical Note */}
                <Alert className="border-primary/30 bg-primary/5">
                  <Brain className="h-4 w-4 text-primary" />
                  <AlertDescription className="text-xs leading-relaxed">
                    <span className="font-semibold">Pipeline Architecture:</span> Multi-stage ensemble combining 1D Transformer (temporal features), 2D CNN (phase-folded views), and MLP fusion layer for stellar metadata integration. All metrics computed using stratified k-fold cross-validation.
                  </AlertDescription>
                </Alert>
              </>
            ) : (
              <Card className="border-dashed border-2 border-border">
                <div className="p-12 text-center">
                  <Cpu className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h4 className="text-lg font-semibold mb-2">Pipeline Awaiting Execution</h4>
                  <p className="text-muted-foreground text-sm max-w-md mx-auto">
                    Configure your dataset, input data, and model parameters above to initialize the processing pipeline.
                  </p>
                </div>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="results" className="mt-6 space-y-8">
            {/* Technical Results Header */}
            <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-background to-accent/5">
              <div className="p-6">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-accent/20 rounded-lg">
                        <BarChart3 className="h-5 w-5 text-accent" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold">Classification Results</h3>
                        <p className="text-xs text-muted-foreground">Model predictions • Confidence scores • Comparative analysis</p>
                      </div>
                    </div>
                        </div>
                  
                  {runMeta && (
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="outline" className={`border-primary/40 font-mono ${runMeta.inputKind==='upload' ? 'text-primary' : 'text-secondary'}`}>
                        <Database className="h-3 w-3 mr-1" />
                        {runMeta.inputKind === 'upload' ? 'Batch CSV' : 'Single Entry'}
                      </Badge>
                      <Badge variant="outline" className={`font-mono ${runMeta.hasHyperparams ? 'text-emerald-400 border-emerald-400/40' : 'text-amber-400 border-amber-400/40'}`}>
                        <Brain className="h-3 w-3 mr-1" />
                        {runMeta.hasHyperparams ? 'Custom HP' : 'Baseline'}
                      </Badge>
                      {normalizedPredictions.length > 0 && (
                        <Badge variant="outline" className="border-accent/40 text-accent font-mono">
                          <Target className="h-3 w-3 mr-1" />
                          {normalizedPredictions.length} predictions
                        </Badge>
                      )}
                    </div>
                  )}
                </div>

                {/* Technical Note */}
                <Alert className="border-accent/30 bg-accent/5">
                  <Target className="h-4 w-4 text-accent" />
                  <AlertDescription className="text-xs leading-relaxed">
                    <span className="font-semibold">Output Schema:</span> Each prediction includes class label (CONFIRMED, CANDIDATE, FALSE POSITIVE), probability scores (softmax output), and comparison metrics when hyperparameter tuning is enabled. Confidence intervals represent model uncertainty quantification.
                  </AlertDescription>
                </Alert>
              </div>
            </Card>

                <ResultsSection />
          </TabsContent>

          <TabsContent value="analytics" className="mt-6 space-y-8">
            {/* Technical Analytics Header */}
            <Card className="border-accent/20 bg-gradient-to-br from-accent/5 via-background to-primary/5">
              <div className="p-6">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-accent/20 rounded-lg">
                        <TrendingUp className="h-6 w-6 text-accent" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold">Performance Analytics</h2>
                        <p className="text-xs text-muted-foreground">
                          Model evaluation • Cross-validation metrics • Statistical analysis
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {runMeta && (
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="outline" className={`border-primary/40 font-mono ${runMeta.inputKind==='upload' ? 'text-primary' : 'text-secondary'}`}>
                        <Database className="h-3 w-3 mr-1" />
                        {runMeta.inputKind === 'upload' ? 'Batch' : 'Single'}
                      </Badge>
                      <Badge variant="outline" className={`font-mono ${runMeta.hasHyperparams ? 'text-emerald-400 border-emerald-400/40' : 'text-amber-400 border-amber-400/40'}`}>
                        <Brain className="h-3 w-3 mr-1" />
                        {runMeta.hasHyperparams ? 'Tuned' : 'Baseline'}
                      </Badge>
                      {normalizedPredictions.length > 0 && (
                        <Badge variant="outline" className="border-accent/40 text-accent font-mono">
                          <Activity className="h-3 w-3 mr-1" />
                          {normalizedPredictions.length}n
                        </Badge>
                      )}
                    </div>
                  )}
                </div>

                {/* Metrics Overview Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="p-3 rounded-lg bg-card/60 border border-border">
                    <div className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">Evaluation</div>
                    <div className="text-xs font-medium">K-Fold CV</div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">Stratified split</div>
                  </div>
                  <div className="p-3 rounded-lg bg-card/60 border border-border">
                    <div className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">Metrics</div>
                    <div className="text-xs font-medium">Multi-class</div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">Acc, F1, P, R</div>
                  </div>
                  <div className="p-3 rounded-lg bg-card/60 border border-border">
                    <div className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">Validation</div>
                    <div className="text-xs font-medium">Blind Test</div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">Holdout set</div>
                  </div>
                  <div className="p-3 rounded-lg bg-card/60 border border-border">
                    <div className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">Analysis</div>
                    <div className="text-xs font-medium">Confusion Matrix</div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">Per-class errors</div>
                  </div>
                </div>

                {/* Technical Note */}
                <Alert className="border-primary/30 bg-primary/5 mt-4">
                  <Brain className="h-4 w-4 text-primary" />
                  <AlertDescription className="text-xs leading-relaxed">
                    <span className="font-semibold">Methodology:</span> Performance evaluated using stratified k-fold cross-validation with macro-averaged metrics. Blind test set ensures generalization capability. Confusion matrices provide per-class error analysis for imbalanced exoplanet datasets.
                  </AlertDescription>
                </Alert>
              </div>
            </Card>

            <AnalyticsDashboard />
          </TabsContent>

          <TabsContent value="export" className="mt-6">
            <ExportSection />
          </TabsContent>
        </Tabs>
        <div id="pipeline-researcher" className="scroll-mt-20 space-y-6"></div>
    </div>
  )
}
