"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart3, TrendingUp, Target, Zap, Activity } from "lucide-react"
import { PerformanceMetricsChart } from "@/components/performance-metrics-chart"
import { useMode } from "@/lib/mode-context"
import { usePlanetData } from "@/lib/planet-data-context"
import { ConfusionMatrix } from "@/components/confusion-matrix"
import { ChartContainer, ChartTooltip } from "@/components/ui/chart"
import { Line, LineChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Legend } from "recharts"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function AnalyticsDashboard() {
  const { mode } = useMode()
  const { streamPredictions, streamSteps, researchMetrics } = usePlanetData()
  
  // Debug: log analytics data
  // eslint-disable-next-line no-console
  console.log('[AnalyticsDashboard] 📈 Data:', {
    streamPredictions: streamPredictions?.length ?? 0,
    streamSteps: streamSteps?.length ?? 0,
    researchMetrics: Object.keys(researchMetrics || {}).length
  })
  // eslint-disable-next-line no-console
  if (researchMetrics && Object.keys(researchMetrics).length > 0) {
    console.log('[AnalyticsDashboard] 📈 researchMetrics:', researchMetrics)
  }

  const getLabel = (row: any) => {
    const raw = String(row?.classificacao ?? row?.classification ?? "").toLowerCase().normalize("NFD").replace(/[^a-z ]/g, "").trim()
    if (raw.includes("confirm")) return "confirmed"
    if (raw.includes("candidate") || raw.includes("candidat")) return "candidate"
    if (raw.includes("false") || raw.includes("falso") || raw.includes("fp")) return "false_positive"
    return raw || "unknown"
  }

  // Total objects should consider unique IDs after flattening and grouping
  // Support both Kepler (id, kepoi_name, koi) and TESS (tid, toi) fields
  const totalObjects = (() => {
    const rows = Array.isArray(streamPredictions)
      ? (Array.isArray((streamPredictions as any)[0]) ? (streamPredictions as any[]).flat() as any[] : (streamPredictions as any[]))
      : []
    const ids = new Set<string>()
    for (const r of rows) {
      // Try all possible ID fields (Kepler + TESS)
      const id = String(
        r?.tid ?? r?.toi ?? r?.id ?? r?.object_id ?? r?.kepoi_name ?? r?.koi ?? r?.ID ?? r?.name ?? ''
      ).trim()
      if (id && id !== 'undefined' && id !== 'null') {
        ids.add(id)
      }
    }
    // eslint-disable-next-line no-console
    console.log('[AnalyticsDashboard] 📊 Total unique IDs:', ids.size, 'from', rows.length, 'rows')
    return ids.size
  })()
  
  // Count confirmed from flattened predictions (handles both old_ and new_ classifications)
  const confirmedCount = (() => {
    const rows = Array.isArray(streamPredictions)
      ? (Array.isArray((streamPredictions as any)[0]) ? (streamPredictions as any[]).flat() as any[] : (streamPredictions as any[]))
      : []
    return rows.filter((r: any) => {
      const cls = String(r?.new_classification ?? r?.old_classification ?? r?.classificacao ?? r?.classification ?? '').toUpperCase()
      return cls.includes('CONFIRM')
    }).length
  })()
  const totalElapsedMs = (streamSteps || []).reduce((acc, s) => acc + (s.durationMs || 0), 0)
  const modelStep = (streamSteps || []).find((s) => /class|predict|inferen/i.test(String(s.status)))
  const processingMs = modelStep?.durationMs ?? totalElapsedMs

  const fmtPct = (v?: number) => (typeof v === "number" ? `${(v * 100).toFixed(2)}%` : "—")
  const fmtInt = (v?: number) => (typeof v === "number" ? v.toLocaleString() : "—")
  const fmtTimeMinutes = (ms?: number) => {
    if (typeof ms !== "number" || !isFinite(ms) || ms < 0) return "—"
    const minutes = ms / 60000
    if (minutes >= 1) return `${minutes.toFixed(2)} min`
    const seconds = ms / 1000
    return `${seconds.toFixed(1)} s`
  }
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

  // Build K-fold chart data with statistics
  const kFold = (researchMetrics.kFoldMetrics && researchMetrics.kFoldMetrics.length)
    ? researchMetrics.kFoldMetrics
    : [1, 2, 3, 4, 5].map((fold) => ({ fold, accuracy: undefined, precision: undefined, recall: undefined, f1: undefined }))

  const kFoldData = kFold.map((m) => ({
    fold: `Fold ${m.fold}`,
    foldNum: m.fold,
    accuracy: m.accuracy ?? null,
    precision: m.precision ?? null,
    recall: m.recall ?? null,
    f1: m.f1 ?? null,
  }))

  // Calculate statistics for each metric
  const calculateStats = (metric: 'accuracy' | 'precision' | 'recall' | 'f1') => {
    const values = kFold.map(m => m[metric]).filter((v): v is number => typeof v === 'number')
    if (values.length === 0) return { mean: 0, std: 0, min: 0, max: 0 }
    const mean = values.reduce((a, b) => a + b, 0) / values.length
    const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length
    const std = Math.sqrt(variance)
    return {
      mean,
      std,
      min: Math.min(...values),
      max: Math.max(...values)
    }
  }

  const accuracyStats = calculateStats('accuracy')
  const precisionStats = calculateStats('precision')
  const recallStats = calculateStats('recall')
  const f1Stats = calculateStats('f1')

  // Dynamic Y-axis domain for better visualization
  const allMetricValues = [
    ...kFold.map(m => m.accuracy),
    ...kFold.map(m => m.precision),
    ...kFold.map(m => m.recall),
    ...kFold.map(m => m.f1)
  ].filter((v): v is number => typeof v === 'number')
  
  const minMetricValue = allMetricValues.length > 0 ? Math.min(...allMetricValues) : 0
  const maxMetricValue = allMetricValues.length > 0 ? Math.max(...allMetricValues) : 1
  const yAxisMin = Math.max(0, Math.floor((minMetricValue - 0.05) * 20) / 20) // Round down to nearest 0.05
  const yAxisMax = Math.min(1, Math.ceil((maxMetricValue + 0.02) * 20) / 20) // Round up to nearest 0.05

  return (
    <section id="analytics" className="scroll-mt-20 space-y-6 md:space-y-8">
      {/* Key Metrics Summary (live) - 2 cols mobile, 4 cols desktop */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
          <CardHeader className="pb-2 md:pb-3">
            <CardDescription className="text-[10px] md:text-xs">Total Objects</CardDescription>
            <CardTitle className="text-2xl md:text-3xl font-bold font-mono">{totalObjects}</CardTitle>
          </CardHeader>
        </Card>

        <Card className="border-accent/20 bg-gradient-to-br from-accent/5 to-transparent">
          <CardHeader className="pb-2 md:pb-3">
            <CardDescription className="text-[10px] md:text-xs">Accuracy (Blind)</CardDescription>
            <CardTitle className="text-2xl md:text-3xl font-bold font-mono">{fmtPct(researchMetrics.blindTestAccuracy)}</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 md:pt-2">
            <div className="flex items-center gap-1 md:gap-2 text-[10px] md:text-xs text-muted-foreground">
              <Target className="h-3 w-3 text-accent flex-shrink-0" />
              <span className="line-clamp-1">Blind test</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
          <CardHeader className="pb-2 md:pb-3">
            <CardDescription className="text-[10px] md:text-xs">Confirmed</CardDescription>
            <CardTitle className="text-2xl md:text-3xl font-bold font-mono text-emerald-500">{confirmedCount}</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 md:pt-2">
            <div className="flex items-center gap-1 md:gap-2 text-[10px] md:text-xs text-muted-foreground">
              <Zap className="h-3 w-3 text-emerald-500 flex-shrink-0" />
              <span className="line-clamp-1">{totalObjects ? Math.round((confirmedCount / totalObjects) * 100) : 0}%</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-accent/20 bg-gradient-to-br from-accent/5 to-transparent">
          <CardHeader className="pb-2 md:pb-3">
            <CardDescription className="text-[10px] md:text-xs">Time</CardDescription>
            <CardTitle className="text-2xl md:text-3xl font-bold font-mono">{(processingMs / 1000).toFixed(2)}s</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 md:pt-2">
            <div className="flex items-center gap-1 md:gap-2 text-[10px] md:text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 text-accent flex-shrink-0" />
              <span className="line-clamp-1">Inference</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Research Metrics - 2 cols mobile, 3 cols tablet, 6 cols desktop */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
          <CardHeader className="pb-2 md:pb-3">
            <CardDescription className="text-[10px] md:text-xs">Features</CardDescription>
            <CardTitle className="text-2xl md:text-3xl font-bold font-mono">{fmtInt(researchMetrics.numFeatures)}</CardTitle>
          </CardHeader>
        </Card>

        <Card className="border-accent/20 bg-gradient-to-br from-accent/5 to-transparent">
          <CardHeader className="pb-2 md:pb-3">
            <CardDescription className="text-[10px] md:text-xs">F1 (Blind)</CardDescription>
            <CardTitle className="text-2xl md:text-3xl font-bold font-mono">{fmtPct(researchMetrics.blindTestF1)}</CardTitle>
          </CardHeader>
        </Card>

        <Card className="border-accent/20 bg-gradient-to-br from-accent/5 to-transparent">
          <CardHeader className="pb-2 md:pb-3">
            <CardDescription className="text-[10px] md:text-xs">Accuracy</CardDescription>
            <CardTitle className="text-2xl md:text-3xl font-bold font-mono">{fmtPct(researchMetrics.blindPrecision)}</CardTitle>
          </CardHeader>
        </Card>

        <Card className="border-accent/20 bg-gradient-to-br from-accent/5 to-transparent">
          <CardHeader className="pb-2 md:pb-3">
            <CardDescription className="text-[10px] md:text-xs">Recall</CardDescription>
            <CardTitle className="text-2xl md:text-3xl font-bold font-mono">{fmtPct(researchMetrics.blindRecall)}</CardTitle>
          </CardHeader>
        </Card>

        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
          <CardHeader className="pb-2 md:pb-3">
            <CardDescription className="text-[10px] md:text-xs">Training</CardDescription>
            <CardTitle className="text-xl md:text-3xl font-bold font-mono">{fmtTimeMinutes(researchMetrics.totalTrainingTimeMs)}</CardTitle>
          </CardHeader>
        </Card>

        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
          <CardHeader className="pb-2 md:pb-3">
            <CardDescription className="text-[10px] md:text-xs">Test Size</CardDescription>
            <CardTitle className="text-2xl md:text-3xl font-bold font-mono">{fmtInt(researchMetrics.blindTestConfusionMatrix?.flat().reduce((a, b) => a + b, 0))}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* 1) Métricas de Performance por Fold (full-width, mobile-ready) */}
      <Card className="border-primary/20 w-full">
        <CardHeader className="pb-3 md:pb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <CardTitle className="text-base md:text-lg flex items-center gap-2">
                <Activity className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                Cross-Validation: Metrics per Fold (K={kFold.length})
              </CardTitle>
              <CardDescription className="text-[10px] md:text-xs mt-1">
                Stratified cross-validation • Model stability and generalization
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="text-[10px] font-mono">
                {kFold.length} folds
              </Badge>
              <Badge variant="outline" className="text-[10px] font-mono">
                Stratified CV
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="w-full px-2 md:px-6 space-y-4">
          {/* Statistics Summary Cards */}
          {/* <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
            {[
              { label: 'Acurácia', stats: accuracyStats, color: '#3b82f6' },
              { label: 'Precisão', stats: precisionStats, color: '#8b5cf6' },
              { label: 'Recall', stats: recallStats, color: '#ec4899' },
              { label: 'F1-Score', stats: f1Stats, color: '#10b981' }
            ].map((metric, idx) => (
              <div key={idx} className="rounded-lg border bg-card/50 p-2 md:p-3 space-y-1">
                <div className="flex items-center gap-1.5">
                  <div className="h-2 w-2 rounded-full" style={{ backgroundColor: metric.color }} />
                  <span className="text-[9px] md:text-xs font-medium text-muted-foreground">{metric.label}</span>
                </div>
                <div className="space-y-0.5">
                  <div className="flex items-baseline gap-1">
                    <span className="text-xs md:text-sm font-bold font-mono">
                      {(metric.stats.mean * 100).toFixed(1)}%
                    </span>
                    <span className="text-[8px] md:text-[10px] text-muted-foreground">μ</span>
                  </div>
                  <div className="text-[8px] md:text-[10px] text-muted-foreground font-mono">
                    σ = {(metric.stats.std * 100).toFixed(2)}%
                  </div>
                  <div className="text-[8px] md:text-[10px] text-muted-foreground">
                    [{(metric.stats.min * 100).toFixed(1)}% – {(metric.stats.max * 100).toFixed(1)}%]
                  </div>
                </div>
              </div>
            ))}
          </div> */}

          {/* Chart */}
          <div className="rounded-lg bg-card/30 p-3 md:p-4 border border-border/50">
            <ChartContainer
              config={{
                accuracy: { label: "Accuracy", color: "#3b82f6" },
                precision: { label: "Precision", color: "#8b5cf6" },
                recall: { label: "Recall", color: "#ec4899" },
                f1: { label: "F1-Score", color: "#10b981" },
              }}
              className="h-[320px] md:h-[400px] w-full"
            >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={kFoldData} margin={{ top: 20, right: 20, left: 0, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.15)" vertical={false} />
                <XAxis 
                  dataKey="fold" 
                  tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.7)' }} 
                  stroke="rgba(255,255,255,0.3)"
                  interval={0} 
                  angle={0} 
                  height={35}
                  label={{ value: 'Fold Index', position: 'insideBottom', offset: -5, fontSize: 11, fill: 'rgba(255,255,255,0.6)' }}
                />
                <YAxis 
                  domain={[yAxisMin, yAxisMax]} 
                  tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.7)' }} 
                  stroke="rgba(255,255,255,0.3)"
                  tickFormatter={(v: number) => `${Math.round(v * 100)}%`} 
                  width={45}
                  label={{ value: 'Score', angle: -90, position: 'insideLeft', fontSize: 11, fill: 'rgba(255,255,255,0.6)' }}
                />
                <ChartTooltip
                  content={({ active, payload }: { active?: boolean; payload?: any[] }) => {
                    if (active && payload && payload.length) {
                      const p = payload
                      return (
                        <div className="rounded-lg border-2 border-primary/20 bg-background/95 backdrop-blur-sm p-3 shadow-xl">
                          <div className="grid gap-2">
                            <div className="text-xs font-bold border-b pb-2 mb-1">{p[0].payload.fold}</div>
                            {p.map((entry, idx) => {
                              const val = entry.value as number
                              const metricName = String(entry.dataKey || entry.name).toLowerCase()
                              const stats = metricName.includes('accuracy') ? accuracyStats :
                                           metricName.includes('precision') ? precisionStats :
                                           metricName.includes('recall') ? recallStats : f1Stats
                              const deviation = val ? ((val - stats.mean) / stats.std) : 0
                              return (
                                <div key={idx} className="space-y-1">
                                  <div className="flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-2">
                                      <div className="h-2.5 w-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: entry.color }} />
                                      <span className="text-xs font-medium">{entry.name}</span>
                                    </div>
                                    <span className="text-sm font-mono font-bold">
                                      {entry.value == null ? "—" : `${((entry.value as number) * 100).toFixed(2)}%`}
                                    </span>
                                  </div>
                                  {val != null && (
                                    <div className="text-[10px] text-muted-foreground pl-4 font-mono">
                                      {deviation > 0 ? '+' : ''}{deviation.toFixed(2)}σ from mean
                                    </div>
                                  )}
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      )
                    }
                    return null
                  }}
                />
                <Legend 
                  wrapperStyle={{ fontSize: "11px", paddingTop: "16px" }} 
                  iconType="line"
                  formatter={(value) => <span className="font-medium">{value}</span>}
                />
                <Line 
                  type="monotone" 
                  dataKey="accuracy" 
                  stroke="#3b82f6" 
                  strokeWidth={3} 
                  dot={{ r: 5, fill: '#3b82f6', stroke: '#fff', strokeWidth: 2 }} 
                  activeDot={{ r: 8, fill: '#3b82f6', stroke: '#fff', strokeWidth: 3 }} 
                  connectNulls
                  filter="drop-shadow(0px 0px 4px rgba(59, 130, 246, 0.5))"
                />
                <Line 
                  type="monotone" 
                  dataKey="precision" 
                  stroke="#8b5cf6" 
                  strokeWidth={3} 
                  dot={{ r: 5, fill: '#8b5cf6', stroke: '#fff', strokeWidth: 2 }} 
                  activeDot={{ r: 8, fill: '#8b5cf6', stroke: '#fff', strokeWidth: 3 }} 
                  connectNulls
                  filter="drop-shadow(0px 0px 4px rgba(139, 92, 246, 0.5))"
                />
                <Line 
                  type="monotone" 
                  dataKey="recall" 
                  stroke="#ec4899" 
                  strokeWidth={3} 
                  dot={{ r: 5, fill: '#ec4899', stroke: '#fff', strokeWidth: 2 }} 
                  activeDot={{ r: 8, fill: '#ec4899', stroke: '#fff', strokeWidth: 3 }} 
                  connectNulls
                  filter="drop-shadow(0px 0px 4px rgba(236, 72, 153, 0.5))"
                />
                <Line 
                  type="monotone" 
                  dataKey="f1" 
                  stroke="#10b981" 
                  strokeWidth={3} 
                  dot={{ r: 5, fill: '#10b981', stroke: '#fff', strokeWidth: 2 }} 
                  activeDot={{ r: 8, fill: '#10b981', stroke: '#fff', strokeWidth: 3 }} 
                  connectNulls
                  filter="drop-shadow(0px 0px 4px rgba(16, 185, 129, 0.5))"
                />
              </LineChart>
            </ResponsiveContainer>
            </ChartContainer>
          </div>

          {/* Interpretation Guide */}
          <Alert className="border-primary/30 bg-primary/5">
            <Activity className="h-4 w-4" />
            <AlertDescription className="text-[10px] md:text-xs">
              <strong>Interpretation:</strong> Low standard deviation (σ) indicates model stability.  
              Significant differences between folds may suggest sensitivity to data splitting or unbalanced classes.
              Consistently high values (≥95%) indicate good generalization.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* 2) Matrizes de Confusão lado a lado */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 lg:gap-8">
        <ConfusionMatrix
          title="Confusion Matrix (Test)"
          description="Performance in the test set"
          matrix={researchMetrics.testConfusionMatrix}
          labels={researchMetrics.labels || ["Confirmed", "Candidate", "False Positive"]}
          accuracy={researchMetrics.testAccuracy}
        />
        <ConfusionMatrix
          title="Confusion Matrix (Blind Test)"
          description="Blind test performance (holdout)"
          matrix={researchMetrics.blindTestConfusionMatrix}
          labels={researchMetrics.labels || ["Confirmed", "Candidate", "False Positive"]}
          accuracy={researchMetrics.blindTestAccuracy}
        />
      </div>
    </section>
  )
}
