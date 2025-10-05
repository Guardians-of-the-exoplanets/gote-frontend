"use client"

import { useMemo, useState, useEffect, useRef } from "react"
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
import { CheckCircle2, Circle, BarChart3, Globe, Download, Database, SlidersHorizontal, Brain, ShieldCheck, Timer, History, ChevronRight, Sparkles, Search, Zap, Target, FileSearch, Telescope, AlertCircle } from "lucide-react"
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
  const hasAutoSwitchedRef = useRef(false)
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
  const pipelineCompleted = (streamSteps && streamSteps.length > 0) && streamSteps.every((s:any) => s && s.durationMs != null)
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

  // Auto-activate pipeline tab when processing starts (mirror researcher behavior)
  useEffect(() => {
    if (isProcessing && activeTab !== "pipeline") {
      setActiveTab("pipeline")
    }
  }, [isProcessing])

  // Auto-switch to results tab when pipeline completes (only once per run)
  useEffect(() => {
    if (
      !hasAutoSwitchedRef.current &&
      pipelineCompleted &&
      !isProcessing &&
      hasResults &&
      activeTab === "pipeline"
    ) {
      // eslint-disable-next-line no-console
      console.log('[ExplorerFlow] 🎯 Pipeline completed! Auto-switching to Results tab')
      setActiveTab("results")
      hasAutoSwitchedRef.current = true
    }
  }, [pipelineCompleted, isProcessing, hasResults, activeTab])

  // Reset auto-switch flag when new processing starts
  useEffect(() => {
    if (isProcessing) {
      hasAutoSwitchedRef.current = false
    }
  }, [isProcessing])
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
    
    // Debug log
    if (normalizedPredictions.length > 0) {
      // eslint-disable-next-line no-console
      console.log('[ExplorerFlow] 📊 Grouped predictions:', {
        rawPredictions: normalizedPredictions.length,
        groupedCandidates: arr.length,
        firstRawItem: normalizedPredictions[0],
        firstGroupedItem: arr[0],
        detectedFields: {
          hasKeplerFields: 'kepoi_name' in (normalizedPredictions[0] || {}) || 'id' in (normalizedPredictions[0] || {}),
          hasTessFields: 'toi' in (normalizedPredictions[0] || {}) || 'tid' in (normalizedPredictions[0] || {}),
        }
      })
    }
    
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

  // Detect dataset type from runMeta or first prediction item
  const isTessData = 
    (runMeta?.dataset && runMeta.dataset.toLowerCase() === 'tess') ||
    (normalizedPredictions.length > 0 && ('toi' in normalizedPredictions[0] || 'tid' in normalizedPredictions[0]))
  const candidateLabel = isTessData ? 'TOI' : 'KOI'
  const datasetName = isTessData ? 'TESS' : 'Kepler'

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
      {/* Enhanced Explorer Mode Header */}
      <Card className="overflow-hidden bg-gradient-to-br from-primary/5 via-background to-accent/5 border-primary/20">
        <div className="p-5 md:p-6">
          {/* Hero Section */}
          <div className="flex items-start gap-4 mb-5">
            <div className="flex-shrink-0 p-3 bg-primary/10 rounded-xl">
              <Telescope className="h-6 w-6 md:h-7 md:w-7 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <h2 className="text-xl md:text-2xl font-bold">Explorer Mode</h2>
                <div className="flex items-center gap-1.5">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                    <Sparkles className="h-3 w-3 mr-1" />
                    AI-Powered
                  </span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-accent/10 text-accent border border-accent/20">
                    <Zap className="h-3 w-3 mr-1" />
                    Fast
                  </span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Select the dataset, input your data via upload or manually, and view the results in a clear and educational way.
                <span className="hidden md:inline"> Our trained neural network analyzes your data in seconds, providing confidence scores and detailed classifications.</span>
              </p>
            </div>
          </div>

          {/* Steps Flow */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Step 1 */}
            <div className="group relative p-3.5 rounded-lg border border-border bg-card/50 hover:bg-card transition-all hover:shadow-md">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 p-2 bg-blue-500/10 rounded-lg group-hover:scale-110 transition-transform">
                  <Telescope className="h-4 w-4 text-blue-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary/20 text-primary text-xs font-bold">1</span>
                    <h4 className="text-sm font-semibold">Select Dataset</h4>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Choose Kepler, K2, or TESS
                  </p>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="group relative p-3.5 rounded-lg border border-border bg-card/50 hover:bg-card transition-all hover:shadow-md">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 p-2 bg-emerald-500/10 rounded-lg group-hover:scale-110 transition-transform">
                  <Database className="h-4 w-4 text-emerald-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary/20 text-primary text-xs font-bold">2</span>
                    <h4 className="text-sm font-semibold">Input Data</h4>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Upload CSV or enter manually
                  </p>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="group relative p-3.5 rounded-lg border border-border bg-card/50 hover:bg-card transition-all hover:shadow-md">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 p-2 bg-violet-500/10 rounded-lg group-hover:scale-110 transition-transform">
                  <Target className="h-4 w-4 text-violet-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary/20 text-primary text-xs font-bold">3</span>
                    <h4 className="text-sm font-semibold">View Results</h4>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Educational and detailed analysis
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Info Banner */}
          <Alert className="mt-4 border-primary/30 bg-primary/5">
            <Info className="h-4 w-4" />
            <AlertDescription className="text-xs">
              <strong>Perfect for enthusiasts!</strong> This mode is designed for quick exoplanet detection. 
              <span className="hidden sm:inline"> Choose from Kepler, K2, or TESS datasets and get instant AI-powered classifications.</span>
            </AlertDescription>
          </Alert>
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
              {streamSteps.length > 0 ? (
                <>
                  {/* Hero section */}
                  <Card className={`border-primary/20 ${pipelineCompleted ? 'bg-gradient-to-br from-emerald-500/10 via-primary/5 to-emerald-500/10' : 'bg-gradient-to-br from-primary/5 via-accent/5 to-primary/5'}`}>
                    <div className="p-6">
                      <div className="text-center space-y-3 mb-6">
                        <div className={`inline-flex items-center gap-2 px-4 py-2 border rounded-full text-sm shadow-sm ${pipelineCompleted ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500' : 'bg-accent/10 border-accent/30 text-accent'}`}>
                          {pipelineCompleted ? <Target className="h-5 w-5" /> : <Telescope className="h-5 w-5" />}
                          <span className="font-semibold">Exoplanet Detection Pipeline</span>
                        </div>
                        <h3 className="text-2xl font-bold">
                          {pipelineCompleted ? 'Analysis Complete! ✨' : 'Your Data is Being Analyzed!'}
                        </h3>
                        <p className="text-muted-foreground max-w-xl mx-auto">
                          {pipelineCompleted 
                            ? `Your ${datasetName} data has been successfully analyzed by our AI system. Head to the Results tab to see if you've discovered an exoplanet! 🎉`
                            : `Watch your ${datasetName} signal journey through our AI system. Each step brings us closer to discovering if you've found a real exoplanet! 🪐`
                          }
                        </p>
                      </div>

                      {/* Progress bar */}
                      <div className="mb-6">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-foreground">Overall Progress</span>
                          <span className="text-sm font-mono font-medium text-primary">
                            {Math.round((streamSteps.filter(s=>s.durationMs!=null).length / streamSteps.length) * 100)}%
                          </span>
                        </div>
                        <div className="h-3 bg-muted rounded-full overflow-hidden border border-border shadow-inner">
                          <div 
                            className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500 ease-out rounded-full"
                            style={{ width: `${(streamSteps.filter(s=>s.durationMs!=null).length / streamSteps.length) * 100}%` }}
                          />
                        </div>
                      </div>

                      {/* Educational steps with icons and descriptions */}
                      <div className="space-y-4">
                        {streamSteps
                          .slice()
                          .sort((a,b)=>a.step-b.step)
                          .map((s, idx) => {
                            const done = typeof s.durationMs === 'number'
                            const isActive = idx === streamSteps.filter(st=>st.durationMs!=null).length && !done
                            const isError = s.step === 400
                            
                            // Map steps to educational content based on actual backend status
                            const stepInfo = (() => {
                              const statusLower = s.status.toLowerCase()
                              
                              // Handle error step 400
                              if (isError) {
                                return {
                                  icon: <AlertCircle className="h-5 w-5" />,
                                  title: s.status,
                                  description: "The uploaded file doesn't match the selected dataset. Please ensure you're uploading data from the correct telescope mission (Kepler, K2, or TESS) and try again.",
                                }
                              }
                              
                              // Use actual status as title, map to educational descriptions
                              if (statusLower.includes('reading') && statusLower.includes('csv')) {
                                return {
                                  icon: <FileSearch className="h-5 w-5" />,
                                  title: s.status, // "Reading your CSV"
                                  description: "Loading your observations from the telescope data file. The system is parsing each row of measurements to understand the light curve patterns.",
                                }
                              }
                              if (statusLower.includes('preprocessing')) {
                                return {
                                  icon: <Search className="h-5 w-5" />,
                                  title: s.status, // "Preprocessing your data"
                                  description: "Cleaning and normalizing the signal. Just like filtering static from a radio, we're removing noise and organizing the data for optimal analysis!",
                                }
                              }
                              if (statusLower.includes('downloading') && statusLower.includes('model')) {
                                return {
                                  icon: <Brain className="h-5 w-5" />,
                                  title: s.status, // "Downloading the Machine Learning model"
                                  description: `Loading the trained neural network. This AI was trained on thousands of confirmed exoplanets from NASA's ${datasetName} mission!`,
                                }
                              }
                              if (statusLower.includes('predicting')) {
                                return {
                                  icon: <Sparkles className="h-5 w-5" />,
                                  title: s.status, // "Predicting your data"
                                  description: "The AI is now analyzing your signal! It's comparing patterns with known exoplanets and false positives to make an intelligent classification.",
                                }
                              }
                              if (statusLower.includes('done') || statusLower.includes('prediction is done')) {
                                return {
                                  icon: <Target className="h-5 w-5" />,
                                  title: s.status, // "Your prediction is done!"
                                  description: "Analysis complete! The neural network has made its decision. Head to the Results tab to see if you've discovered an exoplanet! 🎉",
                                }
                              }
                              // Training steps (for researcher mode with hyperparameters)
                              if (statusLower.includes('training')) {
                                return {
                                  icon: <Brain className="h-5 w-5" />,
                                  title: s.status,
                                  description: "Training a new model with your custom hyperparameters. The AI is learning optimal patterns from the training data.",
                                }
                              }
                              // Default fallback
                              return {
                                icon: <Zap className="h-5 w-5" />,
                                title: s.status,
                                description: "Processing your data through the pipeline...",
                              }
                            })()

                            return (
                              <div 
                                key={s.step} 
                                className={`
                                  relative p-4 rounded-xl border-2 transition-all duration-300
                                  ${isError
                                    ? 'border-red-500/50 bg-red-500/10 shadow-lg'
                                    : done 
                                    ? 'border-emerald-500/30 bg-emerald-500/5 shadow-sm' 
                                    : isActive 
                                    ? 'border-accent/50 bg-accent/10 shadow-lg animate-pulse' 
                                    : 'border-muted bg-muted/30 opacity-60'
                                  }
                                `}
                              >
                                <div className="flex items-start gap-4">
                                  {/* Icon with status indicator */}
                                  <div className="flex-shrink-0 relative">
                                    <div className={`
                                      p-3 rounded-xl transition-all
                                      ${isError
                                        ? 'bg-red-500/20 text-red-500'
                                        : done 
                                        ? 'bg-emerald-500/20 text-emerald-500' 
                                        : isActive 
                                        ? 'bg-accent/20 text-accent' 
                                        : 'bg-muted text-muted-foreground'
                                      }
                                    `}>
                                      {isError ? <AlertCircle className="h-5 w-5" /> : done ? <CheckCircle2 className="h-5 w-5" /> : stepInfo.icon}
                                    </div>
                                    {!done && isActive && !isError && (
                                      <div className="absolute -top-1 -right-1">
                                        <span className="relative flex h-3 w-3">
                                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                                          <span className="relative inline-flex rounded-full h-3 w-3 bg-accent"></span>
                                        </span>
                                      </div>
                                    )}
                                  </div>

                                  {/* Content */}
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className={`text-xs font-mono font-semibold ${isError ? 'text-red-500' : 'text-muted-foreground'}`}>
                                        STEP {s.step}
                                      </span>
                                      {isError && (
                                        <span className="text-xs font-mono text-red-500 font-bold">
                                          ✗ ERROR
                                        </span>
                                      )}
                                      {done && !isError && (
                                        <span className="text-xs font-mono text-emerald-500">
                                          ✓ {(s.durationMs!/1000).toFixed(2)}s
                                        </span>
                                      )}
                                      {isActive && !isError && (
                                        <span className="text-xs font-mono text-accent animate-pulse">
                                          ⚡ Processing...
                                        </span>
                                      )}
                                    </div>
                                    <h4 className={`font-semibold mb-1 ${isError ? 'text-red-500' : 'text-foreground'}`}>
                                      {stepInfo.title}
                                    </h4>
                                    <p className={`text-sm leading-relaxed ${isError ? 'text-red-400' : 'text-muted-foreground'}`}>
                                      {stepInfo.description}
                                    </p>
                                  </div>
                                </div>

                                {/* Connection line to next step */}
                                {idx < streamSteps.length - 1 && !isError && (
                                  <div className="absolute left-[2.75rem] top-full h-4 w-0.5 bg-gradient-to-b from-border to-transparent" />
                                )}
                              </div>
                            )
                          })}
                      </div>

                      {/* Stats footer */}
                      <div className="mt-6 p-4 bg-muted/50 rounded-xl border border-border">
                        <div className="grid grid-cols-3 gap-4 text-center">
                          <div>
                            <div className="text-2xl font-bold font-mono text-emerald-500">
                              {streamSteps.filter(s=>s.durationMs!=null).length}
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">Steps Completed</div>
                          </div>
                          <div>
                            <div className="text-2xl font-bold font-mono text-accent">
                              {(streamSteps.reduce((acc,s)=>acc+(s.durationMs||0),0)/1000).toFixed(1)}s
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">Time Elapsed</div>
                          </div>
                          <div>
                            <div className="text-2xl font-bold font-mono text-primary">
                              {streamSteps.length - streamSteps.filter(s=>s.durationMs!=null).length}
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">Steps Remaining</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>

                  {/* Educational tip */}
                  {!pipelineCompleted && (
                    <Alert className="border-accent/30 bg-accent/5">
                      <Info className="h-4 w-4 text-accent" />
                      <AlertDescription className="text-sm">
                        <span className="font-semibold">Did you know?</span> The same AI techniques used here helped discover thousands of real exoplanets with NASA's Kepler and TESS missions! Your data is being analyzed by a neural network trained on real astronomical observations.
                      </AlertDescription>
                    </Alert>
                  )}
                </>
              ) : (
                <Card className="border-dashed border-2 border-border">
                  <div className="p-12 text-center">
                    <Telescope className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h4 className="text-lg font-semibold mb-2">Ready to Discover Exoplanets?</h4>
                    <p className="text-muted-foreground text-sm max-w-md mx-auto">
                      Enter your observation data above to start the analysis. We'll walk you through each step of the detection process!
                    </p>
                  </div>
                </Card>
              )}
            </div>
          </TabsContent>
          )}

          <TabsContent value="results" className="mt-6">
            {/* Hero Section */}
            <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-accent/5 to-primary/5 mb-6">
              <div className="p-6">
                <div className="text-center space-y-3 mb-6">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 border border-accent/30 rounded-full text-sm text-accent shadow-sm">
                    <Target className="h-5 w-5" />
                    <span className="font-semibold">
                      {isTessData ? 'TESS Mission Results' : 'Kepler Mission Results'}
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold">Your Exoplanet Analysis is Complete! 🎉</h3>
                  <p className="text-muted-foreground max-w-2xl mx-auto">
                    {isTessData 
                      ? "The AI has analyzed your TESS (Transiting Exoplanet Survey Satellite) data. TESS scans the entire sky to find planets orbiting nearby bright stars. Each TOI (TESS Object of Interest) below represents a potential exoplanet candidate!"
                      : "The AI has analyzed your Kepler mission data. Kepler was NASA's groundbreaking telescope that stared at one patch of sky, discovering thousands of exoplanets! Each KOI (Kepler Object of Interest) below represents a potential exoplanet candidate!"
                    }
                  </p>
                </div>

                {/* Classification Guide Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="p-4 rounded-xl border-2 border-emerald-500/30 bg-emerald-500/5">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="h-8 w-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                        <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                      </div>
                      <span className="font-semibold text-emerald-500">Confirmed</span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      This is a <span className="font-medium text-foreground">real exoplanet</span>! It has been verified by follow-up observations and scientific studies. These worlds exist around other stars! 🌍✨
                    </p>
                  </div>

                  <div className="p-4 rounded-xl border-2 border-amber-500/30 bg-amber-500/5">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="h-8 w-8 rounded-lg bg-amber-500/20 flex items-center justify-center">
                        <Sparkles className="h-5 w-5 text-amber-500" />
                      </div>
                      <span className="font-semibold text-amber-500">Candidate</span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      This looks like an exoplanet but needs more evidence! The signal shows promise, but astronomers need additional observations to rule out false positives. Still exciting! 🔭
                    </p>
                  </div>

                  <div className="p-4 rounded-xl border-2 border-rose-500/30 bg-rose-500/5">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="h-8 w-8 rounded-lg bg-rose-500/20 flex items-center justify-center">
                        <Info className="h-5 w-5 text-rose-500" />
                      </div>
                      <span className="font-semibold text-rose-500">False Positive</span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Not an exoplanet. The signal could be from stellar activity, binary stars, or instrument noise. These help us learn what doesn't work! Still valuable for science. 📊
                    </p>
                  </div>
                </div>

                {/* Analysis Info */}
                {runMeta && (
                  <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-medium ${runMeta.inputKind==='upload' ? 'border-primary/40 text-primary bg-primary/10' : 'border-secondary/40 text-secondary bg-secondary/10'}`}>
                      <Database className="h-3.5 w-3.5" />
                      {runMeta.inputKind === 'upload' ? 'Batch Analysis (CSV Upload)' : 'Single Target Analysis'}
                    </span>
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-medium ${runMeta.hasHyperparams ? 'border-emerald-400/50 text-emerald-400 bg-emerald-500/10' : 'border-amber-400/50 text-amber-400 bg-amber-500/10'}`}>
                      <Brain className="h-3.5 w-3.5" />
                      {runMeta.hasHyperparams ? 'Custom Model Parameters' : 'Standard Model'}
                    </span>
                  </div>
                )}
              </div>
            </Card>

            {/* How to Read Guide */}
            <Card className="p-5 border-accent/30 bg-accent/5 mb-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Info className="h-5 w-5 text-accent" />
                  <h4 className="font-semibold text-base">Understanding Your Results</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <span className="text-accent font-medium">•</span>
                      <p className="text-muted-foreground">
                        <span className="font-medium text-foreground">Object ID ({candidateLabel}):</span> The unique identifier for each target. {isTessData ? 'TOIs are numbered sequentially as TESS discovers them.' : 'KOIs are numbered based on the star they orbit.'}
                      </p>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-accent font-medium">•</span>
                      <p className="text-muted-foreground">
                        <span className="font-medium text-foreground">Classification:</span> What the AI thinks this signal is. The color-coded badge shows the verdict at a glance!
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <span className="text-accent font-medium">•</span>
                      <p className="text-muted-foreground">
                        <span className="font-medium text-foreground">Probability:</span> The AI's confidence level (0-100%). Higher numbers mean the AI is more certain. Above 80% is very confident!
                      </p>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-accent font-medium">•</span>
                      <p className="text-muted-foreground">
                        <span className="font-medium text-foreground">Records:</span> How many observations we have for this object. More records = more data to analyze!
                      </p>
                    </div>
                  </div>
                </div>
                {runMeta?.inputKind === 'upload' && (
                  <Alert className="border-primary/30 bg-primary/5 mt-3">
                    <Sparkles className="h-4 w-4 text-primary" />
                    <AlertDescription className="text-xs">
                      <span className="font-semibold">Pro Tip:</span> We automatically grouped duplicate observations by Object ID. Click any row to see the complete history of that target over time. Look for patterns—consistent classifications across multiple observations are more reliable!
                    </AlertDescription>
                  </Alert>
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
                const icon = cls === 'Confirmed' 
                  ? <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                  : cls === 'Candidate'
                  ? <Sparkles className="h-8 w-8 text-amber-500" />
                  : <Info className="h-8 w-8 text-rose-500" />
                const interpretation = cls === 'Confirmed'
                  ? "🎉 Excellent! The AI is highly confident this is a real exoplanet! The signal shows all the hallmarks of a planet transiting its host star."
                  : cls === 'Candidate'
                  ? "🔭 Interesting! This signal looks promising but needs verification. It could be a genuine exoplanet awaiting confirmation!"
                  : "📊 The AI determined this is likely not an exoplanet. The signal might be caused by stellar activity, eclipsing binaries, or instrumental artifacts."
                
                return (
                  <div className="space-y-4">
                    <Card className={`p-6 border-2 ${
                      cls === 'Confirmed' 
                        ? 'border-emerald-500/30 bg-emerald-500/5' 
                        : cls === 'Candidate'
                        ? 'border-amber-500/30 bg-amber-500/5'
                        : 'border-rose-500/30 bg-rose-500/5'
                    }`}>
                      <div className="flex flex-col md:flex-row items-center gap-6">
                        <div className="flex-shrink-0">
                          <div className={`h-20 w-20 rounded-2xl flex items-center justify-center ${
                            cls === 'Confirmed' 
                              ? 'bg-emerald-500/20' 
                              : cls === 'Candidate'
                              ? 'bg-amber-500/20'
                              : 'bg-rose-500/20'
                          }`}>
                            {icon}
                          </div>
                        </div>
                        <div className="flex-1 text-center md:text-left">
                          <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                            <span className="text-sm text-muted-foreground">AI Classification:</span>
                            <span className={`inline-flex items-center px-3 py-1 rounded-lg border font-semibold text-base ${badgeClass}`}>
                              {cls}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground leading-relaxed">{interpretation}</p>
                        </div>
                      </div>
                    </Card>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card className="p-5 border-accent/30">
                        <div className="flex items-center gap-2 mb-3">
                          <Target className="h-4 w-4 text-accent" />
                          <div className="text-xs font-semibold text-accent uppercase tracking-wide">Classification</div>
                        </div>
                        <div className={`inline-flex items-center px-3 py-1.5 rounded-lg border font-semibold text-lg ${badgeClass}`}>
                          {cls}
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          {cls === 'Confirmed' ? 'Verified exoplanet' : cls === 'Candidate' ? 'Awaiting confirmation' : 'Not a planet'}
                        </p>
                      </Card>

                      <Card className="p-5 border-primary/30">
                        <div className="flex items-center gap-2 mb-3">
                          <Brain className="h-4 w-4 text-primary" />
                          <div className="text-xs font-semibold text-primary uppercase tracking-wide">AI Confidence</div>
                        </div>
                        <div className="text-3xl font-bold font-mono text-primary">
                          {Number.isFinite(prob) ? `${prob.toFixed(1)}%` : '—'}
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          {prob >= 90 ? 'Extremely confident' : prob >= 75 ? 'Very confident' : prob >= 50 ? 'Moderately confident' : 'Low confidence'}
                        </p>
                      </Card>

                      <Card className="p-5 border-accent/30">
                        <div className="flex items-center gap-2 mb-3">
                          <Sparkles className="h-4 w-4 text-accent" />
                          <div className="text-xs font-semibold text-accent uppercase tracking-wide">Next Steps</div>
                        </div>
                        <div className="text-sm text-foreground font-medium">
                          {cls === 'False Positive' ? 'Further analysis needed' : 'Promising discovery!'}
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          {cls === 'False Positive' 
                            ? 'Try different parameters or more data' 
                            : 'Consider follow-up observations'}
                        </p>
                      </Card>
                    </div>
                  </div>
                )
              })()
            ) : streamPredictions && streamPredictions.length > 0 ? (
              <>
              {/* Summary Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3 mb-4">
                <Card className="p-3 md:p-4 border-primary/30">
                  <div className="text-[10px] md:text-xs text-muted-foreground mb-1">Total Analyzed</div>
                  <div className="text-xl md:text-2xl font-bold text-primary">{groupedPredictions.length}</div>
                  <div className="text-[10px] md:text-xs text-muted-foreground mt-0.5">{isTessData ? 'TOIs' : 'KOIs'}</div>
                </Card>
                <Card className="p-3 md:p-4 border-emerald-500/30">
                  <div className="text-[10px] md:text-xs text-muted-foreground mb-1">Confirmed</div>
                  <div className="text-xl md:text-2xl font-bold text-emerald-500">
                    {groupedPredictions.filter((g:any)=>g.latest.classification==='Confirmed').length}
                  </div>
                  <div className="text-[10px] md:text-xs text-muted-foreground mt-0.5">Planets! 🌍</div>
                </Card>
                <Card className="p-3 md:p-4 border-amber-500/30">
                  <div className="text-[10px] md:text-xs text-muted-foreground mb-1">Candidates</div>
                  <div className="text-xl md:text-2xl font-bold text-amber-500">
                    {groupedPredictions.filter((g:any)=>g.latest.classification==='Candidate').length}
                  </div>
                  <div className="text-[10px] md:text-xs text-muted-foreground mt-0.5">Follow-up 🔭</div>
                </Card>
                <Card className="p-3 md:p-4 border-rose-500/30">
                  <div className="text-[10px] md:text-xs text-muted-foreground mb-1">False Positives</div>
                  <div className="text-xl md:text-2xl font-bold text-rose-500">
                    {groupedPredictions.filter((g:any)=>g.latest.classification==='False Positive').length}
                  </div>
                  <div className="text-[10px] md:text-xs text-muted-foreground mt-0.5">Not planets 📊</div>
                </Card>
              </div>

              {/* Mobile scroll hint */}
              <div className="md:hidden mb-2 text-center">
                <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                  <ChevronRight className="h-3 w-3 animate-pulse" />
                  Swipe to see all columns
                  <ChevronRight className="h-3 w-3 animate-pulse" />
                </p>
              </div>

              <div className="rounded-xl border-2 border-border overflow-hidden shadow-sm">
                {/* Horizontal scroll container */}
                <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent hover:scrollbar-thumb-primary/40">
                  <table className="w-full text-sm min-w-[640px]">
                    <thead className="bg-muted/80 border-b-2 border-border">
                  <tr>
                    <th className="text-left p-2 md:p-3 font-semibold whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Database className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                        <span className="text-xs md:text-sm">ID ({candidateLabel})</span>
                      </div>
                    </th>
                    <th className="text-left p-2 md:p-3 font-semibold whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Target className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                        <span className="text-xs md:text-sm">Class</span>
                      </div>
                    </th>
                    <th className="text-right p-2 md:p-3 font-semibold whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <Info className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                        <span className="text-xs md:text-sm">Obs</span>
                      </div>
                    </th>
                    <th className="text-right p-2 md:p-3 font-semibold whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <Brain className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                        <span className="text-xs md:text-sm">Confidence</span>
                      </div>
                    </th>
                    <th className="text-right p-2 md:p-3 font-semibold whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <History className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                        <span className="text-xs md:text-sm">Details</span>
                      </div>
                    </th>
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
                            className="border-t hover:bg-muted/30 cursor-pointer transition-colors"
                            title="Click to view candidate history"
                            onClick={() => { setHistorySelection({ id: idVal, entries: g.entries }); setHistoryOpen(true) }}
                          >
                            <td className="p-2 md:p-3 font-mono whitespace-nowrap text-xs md:text-sm">{idVal}</td>
                            <td className="p-2 md:p-3 whitespace-nowrap">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded border text-[10px] md:text-xs ${badgeClass}`}>{cls}</span>
                            </td>
                            <td className="p-2 md:p-3 text-right whitespace-nowrap">
                              <span className="inline-flex items-center justify-center min-w-6 md:min-w-8 px-1.5 md:px-2 py-0.5 rounded-md border bg-card/70 text-[10px] md:text-xs">
                                {g.entries.length}
                              </span>
                            </td>
                            <td className="p-2 md:p-3 text-right whitespace-nowrap">
                              <span className="font-mono text-xs md:text-sm">{Number.isFinite(avgProb) ? avgProb.toFixed(2) : '—'}%</span>
                            </td>
                            <td className="p-2 md:p-3 text-right whitespace-nowrap">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="gap-0.5 md:gap-1 hover:bg-accent/20 hover:text-accent transition-colors h-7 md:h-8 px-2" 
                                onClick={(e)=>{ e.stopPropagation(); setHistorySelection({ id: idVal, entries: g.entries }); setHistoryOpen(true) }}
                              >
                                <History className="h-3 w-3 md:h-3.5 md:w-3.5" />
                                <span className="hidden md:inline text-xs">View</span>
                                <ChevronRight className="h-3 w-3 md:h-3.5 md:w-3.5" />
                              </Button>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
                
                {/* Table Footer with Legend */}
                <div className="bg-muted/50 border-t-2 border-border p-3 md:p-4">
                  <div className="flex flex-wrap items-center justify-center gap-2 md:gap-4 text-[10px] md:text-xs">
                    <div className="flex items-center gap-1 md:gap-1.5">
                      <span className="inline-flex h-2.5 w-2.5 md:h-3 md:w-3 rounded border-2 border-emerald-500 bg-emerald-500/20 flex-shrink-0"></span>
                      <span className="text-muted-foreground">
                        <span className="font-medium text-emerald-500">Confirmed</span>
                        <span className="hidden sm:inline"> = Verified</span>
                      </span>
                    </div>
                    <div className="flex items-center gap-1 md:gap-1.5">
                      <span className="inline-flex h-2.5 w-2.5 md:h-3 md:w-3 rounded border-2 border-amber-500 bg-amber-500/20 flex-shrink-0"></span>
                      <span className="text-muted-foreground">
                        <span className="font-medium text-amber-500">Candidate</span>
                        <span className="hidden sm:inline"> = Needs check</span>
                      </span>
                    </div>
                    <div className="flex items-center gap-1 md:gap-1.5">
                      <span className="inline-flex h-2.5 w-2.5 md:h-3 md:w-3 rounded border-2 border-rose-500 bg-rose-500/20 flex-shrink-0"></span>
                      <span className="text-muted-foreground">
                        <span className="font-medium text-rose-500">False Positive</span>
                        <span className="hidden sm:inline"> = Not planet</span>
                      </span>
                    </div>
                  </div>
                  <div className="text-center mt-2 text-[10px] md:text-xs text-muted-foreground">
                    💡 <span className="font-medium">Tip:</span> <span className="hidden sm:inline">Click any row to view the complete observation history and see how classifications evolved over time!</span><span className="sm:hidden">Tap any row for history</span>
                  </div>
                </div>
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

              {/* Educational Footer */}
              <Card className="mt-6 p-5 border-accent/30 bg-gradient-to-br from-accent/5 to-primary/5">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-accent" />
                    <h4 className="font-semibold">What Makes This Exciting?</h4>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {isTessData 
                      ? "TESS surveys 200,000 of the brightest stars near Earth, making it possible to find planets around stars bright enough for detailed follow-up studies. These nearby worlds are prime targets for atmospheric characterization with the James Webb Space Telescope!"
                      : "The Kepler mission revolutionized our understanding of exoplanets by proving that planets are incredibly common in our galaxy. Many of these discoveries helped establish the methods we use today to detect and confirm new worlds!"
                    }
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                    <div className="p-3 rounded-lg bg-card/50 border border-border">
                      <div className="text-xs font-semibold text-accent mb-1">📈 Understanding Confidence Scores</div>
                      <p className="text-xs text-muted-foreground">
                        The AI assigns probabilities based on light curve patterns. A 95% confidence means the signal matches known exoplanet transits very closely. Lower scores might indicate stellar variability or noise.
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-card/50 border border-border">
                      <div className="text-xs font-semibold text-accent mb-1">🔍 Multiple Observations Matter</div>
                      <p className="text-xs text-muted-foreground">
                        Objects with many records have been observed repeatedly over time. Consistent classifications across multiple observations strengthen the case for a real exoplanet!
                      </p>
                    </div>
                  </div>
                </div>
              </Card>

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
