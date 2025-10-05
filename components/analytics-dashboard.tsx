"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart3, TrendingUp, Target, Zap } from "lucide-react"
import { ExoplanetDistributionChart } from "@/components/exoplanet-distribution-chart"
import { FeatureImportanceChart } from "@/components/feature-importance-chart"
import { ClassificationDistributionChart } from "@/components/classification-distribution-chart"
import { PerformanceMetricsChart } from "@/components/performance-metrics-chart"
import { useMode } from "@/lib/mode-context"
import { usePlanetData } from "@/lib/planet-data-context"

export function AnalyticsDashboard() {
  const { mode } = useMode()
  const { streamPredictions, streamSteps } = usePlanetData()

  const getLabel = (row: any) => {
    const raw = String(row?.classificacao ?? row?.classification ?? "").toLowerCase().normalize("NFD").replace(/[^a-z ]/g, "").trim()
    if (raw.includes("confirm")) return "confirmed"
    if (raw.includes("candidate") || raw.includes("candidat")) return "candidate"
    if (raw.includes("false") || raw.includes("falso") || raw.includes("fp")) return "false_positive"
    return raw || "unknown"
  }

  const totalObjects = streamPredictions?.length || 0
  const confirmedCount = (streamPredictions || []).filter((r: any) => getLabel(r) === "confirmed").length
  const totalElapsedMs = (streamSteps || []).reduce((acc, s) => acc + (s.durationMs || 0), 0)
  const modelStep = (streamSteps || []).find((s) => /class|predict|inferen/i.test(String(s.status)))
  const processingMs = modelStep?.durationMs ?? totalElapsedMs

  return (
    <section id="analytics" className="scroll-mt-20 space-y-8">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 border border-accent/20 rounded-full text-sm text-accent mb-2">
          <BarChart3 className="h-4 w-4" />
          Analytics Dashboard
        </div>
        <h2 className="text-4xl font-bold">Data Analysis</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          {mode === "explorer"
            ? "Visualize statistics and distributions of exoplanet data"
            : "In-depth analysis of metrics, distributions, and model performance"}
        </p>
      </div>

      {/* Key Metrics Summary (live) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
          <CardHeader className="pb-3">
            <CardDescription className="text-xs">Total objects</CardDescription>
            <CardTitle className="text-3xl font-bold font-mono">{totalObjects}</CardTitle>
          </CardHeader>
        </Card>

        <Card className="border-accent/20 bg-gradient-to-br from-accent/5 to-transparent">
          <CardHeader className="pb-3">
            <CardDescription className="text-xs">Model accuracy</CardDescription>
            <CardTitle className="text-3xl font-bold font-mono">90.0%</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Target className="h-3 w-3 text-accent" />
              <span>High confidence</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
          <CardHeader className="pb-3">
            <CardDescription className="text-xs">Confirmed</CardDescription>
            <CardTitle className="text-3xl font-bold font-mono text-emerald-500">{confirmedCount}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Zap className="h-3 w-3 text-emerald-500" />
              <span>{totalObjects ? Math.round((confirmedCount / totalObjects) * 100) : 0}% of total</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-accent/20 bg-gradient-to-br from-accent/5 to-transparent">
          <CardHeader className="pb-3">
            <CardDescription className="text-xs">Processing time</CardDescription>
            <CardTitle className="text-3xl font-bold font-mono">{(processingMs / 1000).toFixed(2)}s</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 text-accent" />
              <span>Model inference</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* <ExoplanetDistributionChart /> */}
        <FeatureImportanceChart />
        <ClassificationDistributionChart />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <FeatureImportanceChart />
        <PerformanceMetricsChart />
      </div>
    </section>
  )
}
