"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip } from "@/components/ui/chart"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from "recharts"

const featureData = [
  { feature: "Razão S/R", importance: 0.28 },
  { feature: "Prof. Trânsito", importance: 0.22 },
  { feature: "Período Orbital", importance: 0.18 },
  { feature: "Raio Planetário", importance: 0.15 },
  { feature: "Duração Trânsito", importance: 0.1 },
  { feature: "Temp. Equilíbrio", importance: 0.05 },
  { feature: "Mag. Estelar", importance: 0.02 },
]

export function FeatureImportanceChart() {
  return (
    <Card className="border-primary/20">
      <CardHeader>
        <CardTitle className="text-lg">Importância das Features</CardTitle>
        <CardDescription className="text-xs">Contribuição de cada parâmetro para a classificação</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            importance: {
              label: "Importância",
              color: "hsl(var(--chart-1))",
            },
          }}
          className="h-[350px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={featureData} layout="vertical" margin={{ top: 5, right: 30, left: 100, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" horizontal={false} />
              <XAxis
                type="number"
                domain={[0, 0.3]}
                tick={{ fontSize: 10 }}
                tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
              />
              <YAxis dataKey="feature" type="category" tick={{ fontSize: 11 }} width={90} />
              <ChartTooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="rounded-lg border bg-background p-3 shadow-md">
                        <div className="grid gap-2">
                          <div className="text-xs font-semibold">{payload[0].payload.feature}</div>
                          <div className="text-xs text-muted-foreground">
                            Importância: {((payload[0].value as number) * 100).toFixed(1)}%
                          </div>
                        </div>
                      </div>
                    )
                  }
                  return null
                }}
              />
              <Bar dataKey="importance" fill="hsl(var(--chart-1))" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
