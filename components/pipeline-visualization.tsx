"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, Loader2 } from "lucide-react"
import { motion } from "framer-motion"
import { useState } from "react"

interface PipelineStep {
  id: string
  name: string
  description: string
  status: "pending" | "processing" | "completed"
  duration?: string
}

export function PipelineVisualization() {
  const [steps] = useState<PipelineStep[]>([
    {
      id: "ingestion",
      name: "Ingestão de Dados",
      description: "Leitura de CSV/TFRecords/FITS",
      status: "completed",
      duration: "0.8s",
    },
    {
      id: "detection",
      name: "Detecção de Eventos",
      description: "Box Least Squares (BLS)",
      status: "completed",
      duration: "2.3s",
    },
    {
      id: "normalization",
      name: "Normalização",
      description: "Detrending + Sigma clipping",
      status: "processing",
      duration: "1.2s",
    },
    {
      id: "noise",
      name: "Remoção de Ruído",
      description: "Wavelet filtering",
      status: "pending",
    },
    {
      id: "classification",
      name: "Classificação ML",
      description: "Multi-branch inference",
      status: "pending",
    },
  ])

  return (
    <Card className="border-primary/20 h-full">
      <CardHeader>
        <CardTitle className="text-2xl">Pipeline de Processamento</CardTitle>
        <CardDescription className="line-clamp-2">
          Visualização em tempo real do fluxo de dados através do sistema
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          {steps.map((step, index) => (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`p-3 rounded-lg border transition-all overflow-hidden ${
                step.status === "completed"
                  ? "border-primary/30 bg-primary/5"
                  : step.status === "processing"
                    ? "border-accent/30 bg-accent/5 shadow-lg shadow-accent/20"
                    : "border-border bg-card"
              }`}
            >
              <div className="flex items-center justify-between gap-3 min-w-0">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="flex-shrink-0">
                    {step.status === "completed" && <CheckCircle2 className="h-5 w-5 text-primary" />}
                    {step.status === "processing" && <Loader2 className="h-5 w-5 text-accent animate-spin" />}
                    {step.status === "pending" && (
                      <div className="h-5 w-5 rounded-full border-2 border-muted-foreground/30" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-semibold text-sm truncate">{step.name}</h4>
                    <p className="text-xs text-muted-foreground truncate">{step.description}</p>
                  </div>
                </div>
                {step.duration && (
                  <div className="text-xs font-mono text-muted-foreground flex-shrink-0">{step.duration}</div>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        <div className="p-3 bg-muted/50 rounded-lg border border-border">
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <div className="text-lg font-bold text-primary">2/5</div>
              <div className="text-[10px] text-muted-foreground mt-0.5 truncate">Completas</div>
            </div>
            <div>
              <div className="text-lg font-bold text-accent">4.3s</div>
              <div className="text-[10px] text-muted-foreground mt-0.5 truncate">Decorrido</div>
            </div>
            <div>
              <div className="text-lg font-bold text-secondary">~2.5s</div>
              <div className="text-[10px] text-muted-foreground mt-0.5 truncate">Restante</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
