"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip } from "@/components/ui/chart"
import { Scatter, ScatterChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Legend } from "recharts"

// Mock exoplanet data for visualization
const generateExoplanetData = () => {
  const confirmed = Array.from({ length: 50 }, () => ({
    orbitalPeriod: Math.random() * 400 + 10,
    planetRadius: Math.random() * 3 + 0.5,
    type: "Confirmado",
  }))

  const candidates = Array.from({ length: 30 }, () => ({
    orbitalPeriod: Math.random() * 400 + 10,
    planetRadius: Math.random() * 4 + 0.5,
    type: "Candidato",
  }))

  const falsePositives = Array.from({ length: 20 }, () => ({
    orbitalPeriod: Math.random() * 400 + 10,
    planetRadius: Math.random() * 5 + 0.5,
    type: "Falso Positivo",
  }))

  return { confirmed, candidates, falsePositives }
}

export function ExoplanetDistributionChart() {
  const data = generateExoplanetData()

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <CardTitle className="text-lg">Distribuição de Exoplanetas</CardTitle>
        <CardDescription className="text-xs">Período Orbital vs Raio Planetário por Classificação</CardDescription>
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
          className="h-[400px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 20, bottom: 80, left: 60 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                type="number"
                dataKey="orbitalPeriod"
                name="Período Orbital"
                unit=" dias"
                label={{
                  value: "Período Orbital (dias)",
                  position: "insideBottom",
                  offset: -10,
                  style: { fontSize: 12 },
                }}
                tick={{ fontSize: 10 }}
              />
              <YAxis
                type="number"
                dataKey="planetRadius"
                name="Raio Planetário"
                unit=" R⊕"
                label={{
                  value: "Raio Planetário (R⊕)",
                  angle: -90,
                  position: "insideLeft",
                  style: { fontSize: 12 },
                }}
                tick={{ fontSize: 10 }}
              />
              <ChartTooltip
                cursor={{ strokeDasharray: "3 3" }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="rounded-lg border bg-background p-3 shadow-md">
                        <div className="grid gap-2">
                          <div className="flex items-center gap-2">
                            <div
                              className="h-2 w-2 rounded-full"
                              style={{
                                backgroundColor:
                                  payload[0].payload.type === "Confirmado"
                                    ? "hsl(142, 76%, 36%)"
                                    : payload[0].payload.type === "Candidato"
                                      ? "hsl(217, 91%, 60%)"
                                      : "hsl(0, 84%, 60%)",
                              }}
                            />
                            <span className="text-xs font-semibold">{payload[0].payload.type}</span>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Período: {payload[0].value?.toFixed(1)} dias
                          </div>
                          <div className="text-xs text-muted-foreground">Raio: {payload[1].value?.toFixed(2)} R⊕</div>
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
              <Scatter name="Confirmado" data={data.confirmed} fill="hsl(142, 76%, 36%)" />
              <Scatter name="Candidato" data={data.candidates} fill="hsl(217, 91%, 60%)" />
              <Scatter name="Falso Positivo" data={data.falsePositives} fill="hsl(0, 84%, 60%)" />
            </ScatterChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
