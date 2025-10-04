"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart3, TrendingUp, Target, Zap } from "lucide-react"
import { ExoplanetDistributionChart } from "@/components/exoplanet-distribution-chart"
import { FeatureImportanceChart } from "@/components/feature-importance-chart"
import { ClassificationDistributionChart } from "@/components/classification-distribution-chart"
import { PerformanceMetricsChart } from "@/components/performance-metrics-chart"
import { useMode } from "@/lib/mode-context"

export function AnalyticsDashboard() {
  const { mode } = useMode()

  return (
    <section id="analytics" className="scroll-mt-20 space-y-8">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 border border-accent/20 rounded-full text-sm text-accent mb-2">
          <BarChart3 className="h-4 w-4" />
          Dashboard Analítico
        </div>
        <h2 className="text-4xl font-bold">Análise de Dados</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          {mode === "explorer"
            ? "Visualize estatísticas e distribuições dos dados de exoplanetas"
            : "Análise profunda de métricas, distribuições e performance do modelo"}
        </p>
      </div>

      {/* Key Metrics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
          <CardHeader className="pb-3">
            <CardDescription className="text-xs">Total de Objetos</CardDescription>
            <CardTitle className="text-3xl font-bold font-mono">1,000</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 text-green-500" />
              <span>+12% este mês</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-accent/20 bg-gradient-to-br from-accent/5 to-transparent">
          <CardHeader className="pb-3">
            <CardDescription className="text-xs">Acurácia do Modelo</CardDescription>
            <CardTitle className="text-3xl font-bold font-mono">90.0%</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Target className="h-3 w-3 text-accent" />
              <span>Alta confiança</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
          <CardHeader className="pb-3">
            <CardDescription className="text-xs">Confirmados</CardDescription>
            <CardTitle className="text-3xl font-bold font-mono text-green-500">450</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Zap className="h-3 w-3 text-green-500" />
              <span>45% do total</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-accent/20 bg-gradient-to-br from-accent/5 to-transparent">
          <CardHeader className="pb-3">
            <CardDescription className="text-xs">Tempo de Processamento</CardDescription>
            <CardTitle className="text-3xl font-bold font-mono">2.3s</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 text-accent" />
              <span>Por objeto</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <ExoplanetDistributionChart />
        <ClassificationDistributionChart />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <FeatureImportanceChart />
        <PerformanceMetricsChart />
      </div>
    </section>
  )
}
