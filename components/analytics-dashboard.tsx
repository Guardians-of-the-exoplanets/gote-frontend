"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart3, TrendingUp, Target, Zap } from "lucide-react"
// import { ExoplanetDistributionChart } from "@/components/exoplanet-distribution-chart"
import { FeatureImportanceChart } from "@/components/feature-importance-chart"
import { ClassificationDistributionChart } from "@/components/classification-distribution-chart"
import { PerformanceMetricsChart } from "@/components/performance-metrics-chart"
import { useMode } from "@/lib/mode-context"
import { usePlanetData } from "@/lib/planet-data-context"
import { ConfusionMatrix } from "@/components/confusion-matrix"
import { ChartContainer, ChartTooltip } from "@/components/ui/chart"
import { Line, LineChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Legend } from "recharts"

export function AnalyticsDashboard() {
  const { mode } = useMode()
  const { streamPredictions, streamSteps, researchMetrics } = usePlanetData()

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

  const fmtPct = (v?: number) => (typeof v === "number" ? `${(v * 100).toFixed(2)}%` : "—")
  const fmtInt = (v?: number) => (typeof v === "number" ? v.toLocaleString() : "—")
  const fmtTime = (ms?: number) => {
    if (typeof ms !== "number" || !isFinite(ms) || ms < 0) return "—"
    const sec = Math.floor(ms / 1000)
    const h = Math.floor(sec / 3600)
    const m = Math.floor((sec % 3600) / 60)
    const s = sec % 60
    if (h > 0) return `${h}h ${m}m ${s}s`
    if (m > 0) return `${m}m ${s}s`
    return `${s}s`
  }

  // Build K-fold chart data (defaults to 5 folds with placeholders)
  const kFold = (researchMetrics.kFoldMetrics && researchMetrics.kFoldMetrics.length)
    ? researchMetrics.kFoldMetrics
    : [1, 2, 3, 4, 5].map((fold) => ({ fold, accuracy: undefined, precision: undefined, recall: undefined, f1: undefined }))

  const kFoldData = kFold.map((m) => ({
    fold: `Fold ${m.fold}`,
    accuracy: m.accuracy ?? null,
    precision: m.precision ?? null,
    recall: m.recall ?? null,
    f1: m.f1 ?? null,
  }))

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
            <CardDescription className="text-xs">Test accuracy</CardDescription>
            <CardTitle className="text-3xl font-bold font-mono">{fmtPct(researchMetrics.testAccuracy)}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Target className="h-3 w-3 text-accent" />
              <span>Evaluated on holdout set</span>
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

      {/* Research Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
          <CardHeader className="pb-3">
            <CardDescription className="text-xs">Features</CardDescription>
            <CardTitle className="text-3xl font-bold font-mono">{fmtInt(researchMetrics.numFeatures)}</CardTitle>
          </CardHeader>
        </Card>

        <Card className="border-accent/20 bg-gradient-to-br from-accent/5 to-transparent">
          <CardHeader className="pb-3">
            <CardDescription className="text-xs">Test F1</CardDescription>
            <CardTitle className="text-3xl font-bold font-mono">{fmtPct(researchMetrics.testF1)}</CardTitle>
          </CardHeader>
        </Card>

        <Card className="border-accent/20 bg-gradient-to-br from-accent/5 to-transparent">
          <CardHeader className="pb-3">
            <CardDescription className="text-xs">Blind accuracy</CardDescription>
            <CardTitle className="text-3xl font-bold font-mono">{fmtPct(researchMetrics.blindTestAccuracy)}</CardTitle>
          </CardHeader>
        </Card>

        <Card className="border-accent/20 bg-gradient-to-br from-accent/5 to-transparent">
          <CardHeader className="pb-3">
            <CardDescription className="text-xs">Blind F1</CardDescription>
            <CardTitle className="text-3xl font-bold font-mono">{fmtPct(researchMetrics.blindTestF1)}</CardTitle>
          </CardHeader>
        </Card>

        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
          <CardHeader className="pb-3">
            <CardDescription className="text-xs">Training time</CardDescription>
            <CardTitle className="text-3xl font-bold font-mono">{fmtTime(researchMetrics.totalTrainingTimeMs)}</CardTitle>
          </CardHeader>
        </Card>

        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
          <CardHeader className="pb-3">
            <CardDescription className="text-xs">Test size</CardDescription>
            <CardTitle className="text-3xl font-bold font-mono">{fmtInt(researchMetrics.testConfusionMatrix?.flat().reduce((a, b) => a + b, 0))}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* 1) Métricas de Performance por Fold (full-width, mobile-ready) */}
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="text-lg">Métricas por Fold (K=5)</CardTitle>
          <CardDescription className="text-xs">Acurácia, Precisão, Recall e F1 em cada fold</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              accuracy: { label: "Acurácia", color: "hsl(var(--chart-1))" },
              precision: { label: "Precisão", color: "hsl(var(--chart-2))" },
              recall: { label: "Recall", color: "hsl(var(--chart-3))" },
              f1: { label: "F1", color: "hsl(var(--chart-4))" },
            }}
            className="h-[360px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={kFoldData} margin={{ top: 5, right: 16, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="fold" tick={{ fontSize: 10 }} interval={0} angle={0} height={30} />
                <YAxis domain={[0, 1]} tick={{ fontSize: 10 }} tickFormatter={(v: number) => `${Math.round(v * 100)}%`} />
                <ChartTooltip
                  content={({ active, payload }: { active?: boolean; payload?: any[] }) => {
                    if (active && payload && payload.length) {
                      const p = payload
                      return (
                        <div className="rounded-lg border bg-background p-3 shadow-md">
                          <div className="grid gap-2">
                            <div className="text-xs font-semibold">{p[0].payload.fold}</div>
                            {p.map((entry, idx) => (
                              <div key={idx} className="flex items-center justify-between gap-4">
                                <div className="flex items-center gap-2">
                                  <div className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
                                  <span className="text-xs">{entry.name}</span>
                                </div>
                                <span className="text-xs font-mono font-semibold">
                                  {entry.value == null ? "—" : `${((entry.value as number) * 100).toFixed(1)}%`}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )
                    }
                    return null
                  }}
                />
                <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "20px" }} iconType="line" />
                <Line type="monotone" dataKey="accuracy" stroke="hsl(var(--chart-1))" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} connectNulls />
                <Line type="monotone" dataKey="precision" stroke="hsl(var(--chart-2))" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} connectNulls />
                <Line type="monotone" dataKey="recall" stroke="hsl(var(--chart-3))" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} connectNulls />
                <Line type="monotone" dataKey="f1" stroke="hsl(var(--chart-4))" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} connectNulls />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* 2) Matrizes de Confusão lado a lado */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <ConfusionMatrix
          title="Matriz de Confusão (Teste)"
          description="Desempenho no conjunto de teste"
          matrix={researchMetrics.testConfusionMatrix}
          labels={researchMetrics.labels || ["Confirmado", "Candidato", "Falso Positivo"]}
          accuracy={researchMetrics.testAccuracy}
        />
        <ConfusionMatrix
          title="Matriz de Confusão (Teste Cego)"
          description="Desempenho em teste cego (holdout)"
          matrix={researchMetrics.blindTestConfusionMatrix}
          labels={researchMetrics.labels || ["Confirmado", "Candidato", "Falso Positivo"]}
          accuracy={researchMetrics.blindTestAccuracy}
        />
      </div>

      {/* 3) Importância das Features */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <FeatureImportanceChart />
        <ClassificationDistributionChart />
      </div>

      {/* Confusion Matrices */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <ConfusionMatrix
          title="Matriz de Confusão (Teste)"
          description="Desempenho no conjunto de teste"
          matrix={researchMetrics.testConfusionMatrix}
          labels={researchMetrics.labels || ["Confirmado", "Candidato", "Falso Positivo"]}
          accuracy={researchMetrics.testAccuracy}
        />
        <ConfusionMatrix
          title="Matriz de Confusão (Teste Cego)"
          description="Desempenho em teste cego (holdout)"
          matrix={researchMetrics.blindTestConfusionMatrix}
          labels={researchMetrics.labels || ["Confirmado", "Candidato", "Falso Positivo"]}
          accuracy={researchMetrics.blindTestAccuracy}
        />
      </div>
    </section>
  )
}
