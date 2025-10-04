"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Eye } from "lucide-react"

export function AttentionHeatmap() {
  // Generate mock attention weights
  const generateHeatmap = () => {
    const size = 20
    const data = []
    for (let i = 0; i < size; i++) {
      const row = []
      for (let j = 0; j < size; j++) {
        // Create diagonal pattern with some noise
        const distance = Math.abs(i - j)
        const value = Math.max(0, 1 - distance / 5) + Math.random() * 0.2
        row.push(Math.min(1, value))
      }
      data.push(row)
    }
    return data
  }

  const heatmapData = generateHeatmap()

  const getColor = (value: number) => {
    const intensity = Math.floor(value * 255)
    return `rgb(${intensity}, ${Math.floor(intensity * 0.6)}, ${255 - intensity})`
  }

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Eye className="h-5 w-5 text-primary" />
          <CardTitle className="text-2xl">Mapa de Atenção</CardTitle>
        </div>
        <CardDescription>Visualização dos pesos de atenção do Transformer</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="aspect-square max-w-md mx-auto border border-border rounded-lg overflow-hidden bg-card">
            <div className="grid grid-cols-20 gap-0 h-full">
              {heatmapData.map((row, i) =>
                row.map((value, j) => (
                  <div
                    key={`${i}-${j}`}
                    className="aspect-square transition-all hover:scale-110 hover:z-10"
                    style={{ backgroundColor: getColor(value) }}
                    title={`Position (${i}, ${j}): ${value.toFixed(2)}`}
                  />
                )),
              )}
            </div>
          </div>

          <div className="flex items-center justify-between px-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: "rgb(0, 0, 255)" }} />
              <span className="text-xs text-muted-foreground">Baixa Atenção</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: "rgb(255, 153, 0)" }} />
              <span className="text-xs text-muted-foreground">Alta Atenção</span>
            </div>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            Áreas mais claras indicam maior atenção do modelo a essas regiões temporais da light curve
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
