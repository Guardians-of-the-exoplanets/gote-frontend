"use client"

import { Card } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Cell } from "recharts"

// Mock feature importance data
const featureData = [
  { feature: "Período Orbital", importance: 0.42, color: "hsl(var(--chart-1))" },
  { feature: "Raio Planetário", importance: 0.28, color: "hsl(var(--chart-2))" },
  { feature: "Duração do Trânsito", importance: 0.19, color: "hsl(var(--chart-3))" },
  { feature: "Temperatura Estelar", importance: 0.11, color: "hsl(var(--chart-4))" },
]

export function FeatureImportance() {
  return (
    <Card className="bg-card/50 p-6">
      <h3 className="text-lg font-semibold mb-6">Importância das Variáveis</h3>

      <ChartContainer
        config={{
          importance: {
            label: "Importância",
            color: "hsl(var(--chart-1))",
          },
        }}
        className="h-[300px]"
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={featureData} layout="vertical" margin={{ top: 5, right: 30, left: 120, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" horizontal={false} />
            <XAxis
              type="number"
              domain={[0, 0.5]}
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
            />
            <YAxis type="category" dataKey="feature" tick={{ fontSize: 12 }} width={110} />
            <ChartTooltip
              content={<ChartTooltipContent />}
              formatter={(value: number) => [`${(value * 100).toFixed(1)}%`, "Importância"]}
            />
            <Bar dataKey="importance" radius={[0, 8, 8, 0]}>
              {featureData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>

      <div className="mt-6 space-y-3">
        {featureData.map((item, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="text-sm font-medium">{item.feature}</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${item.importance * 100}%`,
                    backgroundColor: item.color,
                  }}
                />
              </div>
              <span className="text-sm font-mono font-semibold w-12 text-right" style={{ color: item.color }}>
                {(item.importance * 100).toFixed(0)}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
