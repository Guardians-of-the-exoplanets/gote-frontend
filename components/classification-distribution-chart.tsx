"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip } from "@/components/ui/chart"
import { Pie, PieChart, Cell, ResponsiveContainer, Legend } from "recharts"
import { usePlanetData } from "@/lib/planet-data-context"

export function ClassificationDistributionChart() {
  const { streamPredictions } = usePlanetData()
  const norm = (v: any) => String(v ?? "").toLowerCase().normalize("NFD").replace(/[^a-z ]/g, "").trim()
  const label = (row: any) => {
    const raw = norm(row?.classificacao ?? row?.classification)
    if (raw.includes("confirm")) return "confirmed"
    if (raw.includes("candidate") || raw.includes("candidat")) return "candidate"
    if (raw.includes("false") || raw.includes("falso") || raw.includes("fp")) return "false_positive"
    return "unknown"
  }
  const confirmed = (streamPredictions || []).filter((r: any) => label(r) === "confirmed").length
  const candidate = (streamPredictions || []).filter((r: any) => label(r) === "candidate").length
  const falsePositive = (streamPredictions || []).filter((r: any) => label(r) === "false_positive").length
  const distributionData = [
    { name: "Confirmado", value: confirmed, color: "hsl(142, 76%, 36%)" },
    { name: "Candidato", value: candidate, color: "hsl(38, 92%, 50%)" },
    { name: "Falso Positivo", value: falsePositive, color: "hsl(0, 84%, 60%)" },
  ]
  const total = distributionData.reduce((sum, item) => sum + item.value, 0)

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <CardTitle className="text-lg">Distribuição de Classificações</CardTitle>
        <CardDescription className="text-xs">Total de {total} objetos classificados</CardDescription>
      </CardHeader>
      <CardContent className="overflow-hidden">
        <ChartContainer
          config={{
            confirmed: {
              label: "Confirmado",
              color: "hsl(142, 76%, 36%)",
            },
            candidate: {
              label: "Candidato",
              color: "hsl(217, 91%, 60%)",
            },
            falsePositive: {
              label: "Falso Positivo",
              color: "hsl(0, 84%, 60%)",
            },
          }}
          className="h-[350px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={distributionData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {distributionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <ChartTooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload
                    return (
                      <div className="rounded-lg border bg-background p-3 shadow-md">
                        <div className="grid gap-2">
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full" style={{ backgroundColor: data.color }} />
                            <span className="text-xs font-semibold">{data.name}</span>
                          </div>
                          <div className="text-xs text-muted-foreground">Quantidade: {data.value}</div>
                          <div className="text-xs text-muted-foreground">
                            Percentual: {((data.value / total) * 100).toFixed(1)}%
                          </div>
                        </div>
                      </div>
                    )
                  }
                  return null
                }}
              />
              <Legend
                verticalAlign="bottom"
                wrapperStyle={{
                  fontSize: "11px",
                  paddingTop: "10px",
                  maxWidth: "100%",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
                iconType="circle"
                iconSize={8}
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>

        <div className="mt-6 grid grid-cols-3 gap-4">
          {distributionData.map((item) => (
            <div key={item.name} className="p-3 bg-card border border-border rounded-lg text-center overflow-hidden">
              <div className="text-2xl font-bold font-mono" style={{ color: item.color }}>
                {item.value}
              </div>
              <div className="text-xs text-muted-foreground mt-1 truncate">{item.name}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
