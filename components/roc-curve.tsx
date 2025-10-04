"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from "recharts"

// Mock ROC curve data
const rocData = [
  { fpr: 0, tpr: 0 },
  { fpr: 0.05, tpr: 0.65 },
  { fpr: 0.1, tpr: 0.78 },
  { fpr: 0.15, tpr: 0.85 },
  { fpr: 0.2, tpr: 0.89 },
  { fpr: 0.3, tpr: 0.93 },
  { fpr: 0.4, tpr: 0.95 },
  { fpr: 0.5, tpr: 0.97 },
  { fpr: 0.7, tpr: 0.98 },
  { fpr: 1, tpr: 1 },
]

export function RocCurve() {
  return (
    <Card className="bg-card/50">
      <CardHeader>
        <CardTitle className="text-lg">Curva ROC</CardTitle>
        <CardDescription className="text-xs">Taxa de Verdadeiros Positivos vs Falsos Positivos</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            tpr: {
              label: "Taxa de Verdadeiros Positivos",
              color: "hsl(var(--chart-1))",
            },
          }}
          className="h-[280px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={rocData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="rocGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="fpr"
                label={{ value: "Taxa de Falsos Positivos", position: "insideBottom", offset: -5 }}
                className="text-xs"
                tick={{ fontSize: 10 }}
              />
              <YAxis
                dataKey="tpr"
                label={{ value: "Taxa de Verdadeiros Positivos", angle: -90, position: "insideLeft" }}
                className="text-xs"
                tick={{ fontSize: 10 }}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Area
                type="monotone"
                dataKey="tpr"
                stroke="hsl(var(--chart-1))"
                strokeWidth={2}
                fill="url(#rocGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>

        <div className="mt-4 pt-4 border-t border-border">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">AUC Score</span>
            <span className="font-mono font-semibold text-primary">0.92</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
