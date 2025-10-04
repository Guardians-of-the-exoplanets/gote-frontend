"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart3, TrendingUp, AlertCircle } from "lucide-react"
import { ClassificationTable } from "@/components/classification-table"
import { ConfusionMatrix } from "@/components/confusion-matrix"
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
            <CardTitle className="text-2xl">Resultados da Classificação</CardTitle>
          </div>
          <CardDescription>
            Métricas avançadas: PR/ROC curves, injection-recovery, uncertainty quantification
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <Tabs defaultValue="predictions" className="w-full">
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 max-w-3xl mx-auto gap-2">
              <TabsTrigger value="predictions">Predições</TabsTrigger>
              <TabsTrigger value="metrics">Métricas</TabsTrigger>
              <TabsTrigger value="uncertainty">Incerteza</TabsTrigger>
              <TabsTrigger value="sensitivity">Sensibilidade</TabsTrigger>
            </TabsList>

            <TabsContent value="predictions" className="mt-6">
              <ClassificationTable />
            </TabsContent>

            <TabsContent value="metrics" className="mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ConfusionMatrix />
                <RocCurve />
              </div>
            </TabsContent>

            <TabsContent value="uncertainty" className="mt-6">
              <div className="p-8 border border-dashed border-border rounded-xl text-center space-y-4">
                <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground" />
                <div>
                  <h3 className="font-semibold text-lg mb-2">Quantificação de Incerteza</h3>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto">
                    Análise bayesiana com intervalos de confiança para cada predição. Identifica casos ambíguos que
                    requerem vetting manual.
                  </p>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-w-2xl mx-auto pt-4">
                  <div className="p-4 bg-card border border-border rounded-lg">
                    <div className="text-2xl font-bold text-primary">94.2%</div>
                    <div className="text-xs text-muted-foreground mt-1">Alta Confiança</div>
                  </div>
                  <div className="p-4 bg-card border border-border rounded-lg">
                    <div className="text-2xl font-bold text-accent">4.8%</div>
                    <div className="text-xs text-muted-foreground mt-1">Média Confiança</div>
                  </div>
                  <div className="p-4 bg-card border border-border rounded-lg">
                    <div className="text-2xl font-bold text-secondary">1.0%</div>
                    <div className="text-xs text-muted-foreground mt-1">Baixa Confiança</div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="sensitivity" className="mt-6">
              <div className="p-8 border border-dashed border-border rounded-xl text-center space-y-4">
                <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground" />
                <div>
                  <h3 className="font-semibold text-lg mb-2">Mapa de Sensibilidade</h3>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto">
                    Injection-recovery tests mostram a capacidade de detecção em função do período orbital e
                    profundidade do trânsito.
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </section>
  )
}
