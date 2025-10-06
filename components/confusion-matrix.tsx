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
  title = "Confusion Matrix",
  description = "Comparison between predictions and actual values",
  matrix = [
    [85, 10, 5],
    [8, 78, 14],
    [3, 7, 90],
  ],
  labels = ["Confirmed", "Candidate", "False Positive"],
  accuracy,
}: ConfusionMatrixProps) {

  const getColorIntensity = (value: number) => {
    if (value >= 80) return "bg-primary/80 text-primary-foreground"
    if (value >= 60) return "bg-primary/60 text-foreground"
    if (value >= 40) return "bg-primary/40 text-foreground"
    if (value >= 20) return "bg-primary/20 text-foreground"
    return "bg-primary/10 text-muted-foreground"
  }

  // Safety checks for invalid data
  if (!matrix || !labels || matrix.length === 0 || labels.length === 0) {
    return (
      <Card className="bg-card/50">
        <CardHeader>
          <CardTitle className="text-lg">{title}</CardTitle>
          <CardDescription className="text-xs">{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-8 text-center text-muted-foreground text-sm">
            No confusion matrix data available
          </div>
        </CardContent>
      </Card>
    )
  }

  // Helper function to safely get label
  const getLabel = (index: number): string => {
    if (labels && labels[index]) {
      return labels[index].split(" ")[0]
    }
    return `Class ${index + 1}`
  }

  return (
    <Card className="bg-card/50">
      <CardHeader className="pb-3 md:pb-6">
        <CardTitle className="text-base md:text-lg">{title}</CardTitle>
        <CardDescription className="text-[10px] md:text-xs">{description}</CardDescription>
      </CardHeader>
      <CardContent className="px-3 md:px-6">
        <div className="space-y-1.5 md:space-y-2">
          <div className="grid grid-cols-4 gap-1.5 md:gap-2">
            <div className="text-[10px] md:text-xs font-medium text-muted-foreground" />
            {labels.map((label, idx) => (
              <div key={label || idx} className="text-[10px] md:text-xs font-medium text-center text-muted-foreground">
                {label ? label.split(" ")[0] : `Class ${idx + 1}`}
              </div>
            ))}
          </div>

          {matrix.map((row, i) => (
            <div key={i} className="grid grid-cols-4 gap-1.5 md:gap-2">
              <div className="text-[10px] md:text-xs font-medium text-muted-foreground flex items-center">
                {getLabel(i)}
              </div>
              {row.map((value, j) => (
                <div
                  key={j}
                  className={`
                    aspect-square rounded-md md:rounded-lg flex items-center justify-center
                    text-xs md:text-sm font-semibold transition-all hover:scale-105
                    ${getColorIntensity(value)}
                  `}
                >
                  {value}
                </div>
              ))}
            </div>
          ))}
        </div>

        <div className="mt-3 md:mt-4 pt-3 md:pt-4 border-t border-border">
          <div className="flex items-center justify-between text-[10px] md:text-xs">
            <span className="text-muted-foreground">Overall Accuracy</span>
            <span className="font-mono font-semibold text-primary">{typeof accuracy === 'number' ? `${(accuracy * 100).toFixed(1)}%` : '—'}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
