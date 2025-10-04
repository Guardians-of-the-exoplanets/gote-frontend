"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { CheckCircle2, XCircle, AlertCircle, MessageSquare, ChevronLeft, ChevronRight } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Progress } from "@/components/ui/progress"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Line, LineChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, ReferenceLine, Area } from "recharts"

interface Candidate {
  id: string
  name: string
  prediction: "PC" | "FP" | "NTP"
  confidence: number
  period: number
  depth: number
  snr: number
  status: "pending" | "approved" | "rejected" | "flagged"
}

const generateCandidateLightCurve = (period: number, depth: number) => {
  const data = []
  const points = 100
  const transitCenter = 50
  const transitWidth = Math.max(3, period * 0.5)

  for (let i = 0; i < points; i++) {
    const time = i
    let flux = 1.0 + (Math.random() - 0.5) * 0.003 // noise

    // Add transit dip based on candidate parameters
    if (Math.abs(i - transitCenter) < transitWidth) {
      const distance = Math.abs(i - transitCenter) / transitWidth
      flux -= depth * (1 - distance)
    }

    data.push({ time, flux })
  }
  return data
}

export function VettingInterface() {
  const [candidates] = useState<Candidate[]>([
    {
      id: "TIC-001",
      name: "TIC 123456789",
      prediction: "PC",
      confidence: 0.87,
      period: 3.45,
      depth: 0.012,
      snr: 12.3,
      status: "pending",
    },
    {
      id: "TIC-002",
      name: "TIC 987654321",
      prediction: "PC",
      confidence: 0.65,
      period: 8.92,
      depth: 0.008,
      snr: 8.7,
      status: "pending",
    },
    {
      id: "TIC-003",
      name: "TIC 456789123",
      prediction: "FP",
      confidence: 0.92,
      period: 1.23,
      depth: 0.025,
      snr: 15.2,
      status: "pending",
    },
  ])

  const [currentIndex, setCurrentIndex] = useState(0)
  const [vettedCandidates, setVettedCandidates] = useState<Record<string, Candidate>>(
    Object.fromEntries(candidates.map((c) => [c.id, c])),
  )
  const [notes, setNotes] = useState("")

  const currentCandidate = candidates[currentIndex]
  const progress = ((currentIndex + 1) / candidates.length) * 100

  const lightCurveData = useMemo(
    () => generateCandidateLightCurve(currentCandidate.period, currentCandidate.depth),
    [currentCandidate.period, currentCandidate.depth],
  )

  const handleVetting = (decision: "approved" | "rejected" | "flagged") => {
    setVettedCandidates((prev) => ({
      ...prev,
      [currentCandidate.id]: { ...currentCandidate, status: decision },
    }))

    if (currentIndex < candidates.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setNotes("")
    }
  }

  const getPredictionColor = (pred: string) => {
    switch (pred) {
      case "PC":
        return "bg-primary/10 text-primary border-primary/30"
      case "FP":
        return "bg-destructive/10 text-destructive border-destructive/30"
      case "NTP":
        return "bg-secondary/10 text-secondary border-secondary/30"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl">Vetting Manual</CardTitle>
            <CardDescription>Revisão humana de candidatos com baixa confiança</CardDescription>
          </div>
          <div className="text-right">
            <div className="text-sm text-muted-foreground">Progresso</div>
            <div className="text-2xl font-bold">
              {currentIndex + 1}/{candidates.length}
            </div>
          </div>
        </div>
        <Progress value={progress} className="mt-4" />
      </CardHeader>
      <CardContent className="space-y-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentCandidate.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Candidate Info */}
            <div className="p-6 border border-border rounded-xl bg-card/50 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold">{currentCandidate.name}</h3>
                  <p className="text-sm text-muted-foreground">ID: {currentCandidate.id}</p>
                </div>
                <Badge className={getPredictionColor(currentCandidate.prediction)}>{currentCandidate.prediction}</Badge>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-3 bg-muted/50 rounded-lg">
                  <div className="text-xs text-muted-foreground mb-1">Confiança</div>
                  <div className="text-lg font-bold">{(currentCandidate.confidence * 100).toFixed(1)}%</div>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <div className="text-xs text-muted-foreground mb-1">Período</div>
                  <div className="text-lg font-bold">{currentCandidate.period.toFixed(2)}d</div>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <div className="text-xs text-muted-foreground mb-1">Profundidade</div>
                  <div className="text-lg font-bold">{(currentCandidate.depth * 100).toFixed(2)}%</div>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <div className="text-xs text-muted-foreground mb-1">SNR</div>
                  <div className="text-lg font-bold">{currentCandidate.snr.toFixed(1)}</div>
                </div>
              </div>
            </div>

            {/* Light Curve Visualization */}
            <div className="p-6 border border-border rounded-xl bg-card/50">
              <div className="text-sm font-medium mb-4 flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                Light Curve Visualization
              </div>
              <ChartContainer
                config={{
                  flux: {
                    label: "Fluxo Normalizado",
                    color: "hsl(var(--primary))",
                  },
                }}
                className="h-[300px] w-full"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={lightCurveData} margin={{ top: 10, right: 30, left: 10, bottom: 30 }}>
                    <defs>
                      <linearGradient id="vettingFluxGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted/50" />
                    <XAxis
                      dataKey="time"
                      label={{ value: "Tempo (dias)", position: "insideBottom", offset: -10, fontSize: 12 }}
                      tick={{ fontSize: 10 }}
                      interval="preserveStartEnd"
                      minTickGap={30}
                    />
                    <YAxis
                      label={{ value: "Fluxo", angle: -90, position: "insideLeft", fontSize: 12 }}
                      domain={["auto", "auto"]}
                      tick={{ fontSize: 10 }}
                      width={50}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <ReferenceLine
                      x={50}
                      stroke="hsl(var(--accent))"
                      strokeDasharray="3 3"
                      label={{ value: "Trânsito", fontSize: 11, position: "top" }}
                    />
                    <Area type="monotone" dataKey="flux" stroke="none" fill="url(#vettingFluxGradient)" />
                    <Line type="monotone" dataKey="flux" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Notas de Vetting
              </label>
              <Textarea
                placeholder="Adicione observações sobre este candidato..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="min-h-[100px]"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between gap-4 pt-4">
              <Button
                variant="outline"
                size="lg"
                onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
                disabled={currentIndex === 0}
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Anterior
              </Button>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => handleVetting("rejected")}
                  className="border-destructive/30 hover:bg-destructive/10"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Rejeitar
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => handleVetting("flagged")}
                  className="border-accent/30 hover:bg-accent/10"
                >
                  <AlertCircle className="h-4 w-4 mr-2" />
                  Sinalizar
                </Button>
                <Button
                  size="lg"
                  onClick={() => handleVetting("approved")}
                  className="bg-gradient-to-r from-primary to-accent"
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Aprovar
                </Button>
              </div>

              <Button
                variant="outline"
                size="lg"
                onClick={() => setCurrentIndex(Math.min(candidates.length - 1, currentIndex + 1))}
                disabled={currentIndex === candidates.length - 1}
              >
                Próximo
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Summary */}
        <div className="pt-6 border-t border-border">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
              <div className="text-2xl font-bold text-primary">
                {Object.values(vettedCandidates).filter((c) => c.status === "approved").length}
              </div>
              <div className="text-xs text-muted-foreground mt-1">Aprovados</div>
            </div>
            <div className="p-4 bg-accent/5 border border-accent/20 rounded-lg">
              <div className="text-2xl font-bold text-accent">
                {Object.values(vettedCandidates).filter((c) => c.status === "flagged").length}
              </div>
              <div className="text-xs text-muted-foreground mt-1">Sinalizados</div>
            </div>
            <div className="p-4 bg-destructive/5 border border-destructive/20 rounded-lg">
              <div className="text-2xl font-bold text-destructive">
                {Object.values(vettedCandidates).filter((c) => c.status === "rejected").length}
              </div>
              <div className="text-xs text-muted-foreground mt-1">Rejeitados</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
