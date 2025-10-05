"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface ConfusionMatrixProps {
  title?: string
  description?: string
  matrix?: number[][]
  labels?: string[]
  accuracy?: number
}

export function ConfusionMatrix({
  title = "Matriz de Confusão",
  description = "Comparação entre predições e valores reais",
  matrix = [
    [85, 10, 5],
    [8, 78, 14],
    [3, 7, 90],
  ],
  labels = ["Confirmado", "Candidato", "Falso Positivo"],
  accuracy,
}: ConfusionMatrixProps) {

  const getColorIntensity = (value: number) => {
    if (value >= 80) return "bg-primary/80 text-primary-foreground"
    if (value >= 60) return "bg-primary/60 text-foreground"
    if (value >= 40) return "bg-primary/40 text-foreground"
    if (value >= 20) return "bg-primary/20 text-foreground"
    return "bg-primary/10 text-muted-foreground"
  }

  return (
    <Card className="bg-card/50">
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
        <CardDescription className="text-xs">{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="grid grid-cols-4 gap-2">
            <div className="text-xs font-medium text-muted-foreground" />
            {labels.map((label) => (
              <div key={label} className="text-xs font-medium text-center text-muted-foreground">
                {label.split(" ")[0]}
              </div>
            ))}
          </div>

          {matrix.map((row, i) => (
            <div key={i} className="grid grid-cols-4 gap-2">
              <div className="text-xs font-medium text-muted-foreground flex items-center">
                {labels[i].split(" ")[0]}
              </div>
              {row.map((value, j) => (
                <div
                  key={j}
                  className={`
                    aspect-square rounded-lg flex items-center justify-center
                    text-sm font-semibold transition-all hover:scale-105
                    ${getColorIntensity(value)}
                  `}
                >
                  {value}
                </div>
              ))}
            </div>
          ))}
        </div>

        <div className="mt-4 pt-4 border-t border-border">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Acurácia Geral</span>
            <span className="font-mono font-semibold text-primary">{typeof accuracy === 'number' ? `${(accuracy * 100).toFixed(1)}%` : '—'}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
