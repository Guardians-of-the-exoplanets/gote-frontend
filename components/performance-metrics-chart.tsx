"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip } from "@/components/ui/chart"
import { Line, LineChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Legend } from "recharts"

const performanceData = [
  { epoch: 0, accuracy: 0.65, precision: 0.62, recall: 0.68 },
  { epoch: 10, accuracy: 0.72, precision: 0.7, recall: 0.74 },
  { epoch: 20, accuracy: 0.78, precision: 0.76, recall: 0.8 },
  { epoch: 30, accuracy: 0.82, precision: 0.81, recall: 0.84 },
  { epoch: 40, accuracy: 0.85, precision: 0.84, recall: 0.86 },
  { epoch: 50, accuracy: 0.87, precision: 0.86, recall: 0.88 },
  { epoch: 60, accuracy: 0.88, precision: 0.87, recall: 0.89 },
  { epoch: 70, accuracy: 0.89, precision: 0.88, recall: 0.9 },
  { epoch: 80, accuracy: 0.89, precision: 0.88, recall: 0.9 },
  { epoch: 90, accuracy: 0.9, precision: 0.89, recall: 0.91 },
  { epoch: 100, accuracy: 0.9, precision: 0.89, recall: 0.91 },
]

export function PerformanceMetricsChart() {
  return (
    <Card className="border-primary/20">
      <CardHeader>
        <CardTitle className="text-lg">Performance Metrics</CardTitle>
        <CardDescription className="text-xs">Evolution of metrics during training</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            accuracy: {
              label: "Acurácia",
              color: "hsl(var(--chart-1))",
            },
            precision: {
              label: "Precisão",
              color: "hsl(var(--chart-2))",
            },
            recall: {
              label: "Recall",
              color: "hsl(var(--chart-3))",
            },
          }}
          className="h-[350px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={performanceData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="epoch"
                label={{ value: "Época", position: "insideBottom", offset: -5, style: { fontSize: 12 } }}
                tick={{ fontSize: 10 }}
              />
              <YAxis
                domain={[0.6, 1]}
                label={{ value: "Score", angle: -90, position: "insideLeft", style: { fontSize: 12 } }}
                tick={{ fontSize: 10 }}
                tickFormatter={(value) => value.toFixed(1)}
              />
              <ChartTooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="rounded-lg border bg-background p-3 shadow-md">
                        <div className="grid gap-2">
                          <div className="text-xs font-semibold">Época {payload[0].payload.epoch}</div>
                          {payload.map((entry, index) => (
                            <div key={index} className="flex items-center justify-between gap-4">
                              <div className="flex items-center gap-2">
                                <div className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
                                <span className="text-xs">{entry.name}</span>
                              </div>
                              <span className="text-xs font-mono font-semibold">
                                {((entry.value as number) * 100).toFixed(1)}%
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
              <Line
                type="monotone"
                dataKey="accuracy"
                stroke="hsl(var(--chart-1))"
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
              <Line
                type="monotone"
                dataKey="precision"
                stroke="hsl(var(--chart-2))"
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
              <Line
                type="monotone"
                dataKey="recall"
                stroke="hsl(var(--chart-3))"
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>

        <div className="mt-6 grid grid-cols-3 gap-4">
          <div className="p-3 bg-card border border-border rounded-lg text-center">
            <div className="text-2xl font-bold font-mono text-primary">90.0%</div>
            <div className="text-xs text-muted-foreground mt-1">Final Accuracy</div>
          </div>
          <div className="p-3 bg-card border border-border rounded-lg text-center">
            <div className="text-2xl font-bold font-mono text-accent">89.0%</div>
            <div className="text-xs text-muted-foreground mt-1">Ultimate Accuracyl</div>
          </div>
          <div className="p-3 bg-card border border-border rounded-lg text-center">
            <div className="text-2xl font-bold font-mono" style={{ color: "hsl(var(--chart-3))" }}>
              91.0%
            </div>
            <div className="text-xs text-muted-foreground mt-1">Final Recall</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
