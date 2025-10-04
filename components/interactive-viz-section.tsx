"use client"

import { Sparkles, Orbit } from "lucide-react"
import { LightCurveViewer } from "@/components/light-curve-viewer"
import { ModelArchitectureViz } from "@/components/model-architecture-viz"
import { AttentionHeatmap } from "@/components/attention-heatmap"
import { useMode } from "@/lib/mode-context"
import { usePlanetData } from "@/lib/planet-data-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import dynamic from "next/dynamic"

const PlanetVisualization = dynamic(
  () => import("@/components/planet-visualization").then((m) => m.PlanetVisualization),
  { ssr: false }
)

export function InteractiveVizSection() {
  const { mode } = useMode()
  const { planetData, prediction } = usePlanetData()

  const showPlanetViz =
    Object.keys(planetData).length > 0 &&
    prediction &&
    (prediction.classification === "Confirmado" || prediction.classification === "Candidato")

  return (
    <section id="visualizations" className="scroll-mt-20 space-y-8">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full text-sm text-primary mb-2">
          <Sparkles className="h-4 w-4" />
          Visualizações Interativas
        </div>
        <h2 className="text-4xl font-bold">Exploração Visual</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          {mode === "explorer"
            ? "Visualize curvas de luz e entenda as predições do modelo"
            : "Análise profunda: modelo 3D do planeta, light curves, arquitetura neural, e mapas de atenção"}
        </p>
      </div>

      {mode === "researcher" && showPlanetViz && (
        <div className="relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-accent/20 rounded-2xl blur-xl" />
          <div className="relative">
            {/* <PlanetVisualization data={planetData} classification={prediction?.classification} /> */}
          </div>
        </div>
      )}

      {mode === "researcher" && !showPlanetViz && (
        <Alert className="border-primary/30 bg-gradient-to-r from-primary/10 to-accent/10">
          <Orbit className="h-4 w-4" />
          <AlertDescription>
            <strong>Visualização 3D do Planeta:</strong> Insira dados de um exoplaneta confirmado ou candidato na seção
            de entrada de dados para ver a representação 3D baseada nas características físicas.
          </AlertDescription>
        </Alert>
      )}

      <LightCurveViewer />

      {mode === "researcher" && (
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="text-2xl">Análise do Modelo Neural</CardTitle>
            <CardDescription>Arquitetura da rede e mapas de atenção para interpretabilidade</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <ModelArchitectureViz />
              <AttentionHeatmap />
            </div>
          </CardContent>
        </Card>
      )}
    </section>
  )
}
