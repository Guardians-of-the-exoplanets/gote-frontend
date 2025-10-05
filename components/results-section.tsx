"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart3, TrendingUp, AlertCircle } from "lucide-react"
import { ClassificationTable } from "@/components/classification-table"
// import { ConfusionMatrix } from "@/components/confusion-matrix"
import { RocCurve } from "@/components/roc-curve"
import { useMode } from "@/lib/mode-context"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function ResultsSection() {
  const { mode } = useMode()

  if (mode !== "researcher") return null

  return (
    <section id="results" className="scroll-mt-20">
      <Card className="border-primary/20">
        <CardHeader>
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            <CardTitle className="text-2xl">Classification Results</CardTitle>
          </div>
          <CardDescription>
            Métricas avançadas: PR/ROC curves, injection-recovery, uncertainty quantification
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <ClassificationTable />
        </CardContent>
      </Card>
    </section>
  )
}
