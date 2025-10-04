"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Brain, Lightbulb, Layers } from "lucide-react"
import { FeatureImportance } from "@/components/feature-importance"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useMode } from "@/lib/mode-context"

export function ExplainabilitySection() {
  const { mode } = useMode()

  return (
    <section className="scroll-mt-20">
      <Card className="border-primary/20">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            <CardTitle className="text-2xl">Explicabilidade do Modelo</CardTitle>
          </div>
          <CardDescription>
            {mode === "explorer"
              ? "Entenda quais variáveis mais influenciaram as decisões do modelo de classificação"
              : "SHAP values, attention weights, e physics-informed constraints para interpretabilidade completa"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert className="border-primary/30 bg-primary/5">
            <Lightbulb className="h-4 w-4 text-primary" />
            <AlertDescription className="text-sm text-foreground">
              {mode === "explorer"
                ? "A importância das features indica o peso relativo de cada variável nas predições do modelo. Valores mais altos significam maior influência na classificação."
                : "Análise multi-camada: SHAP para importância global, attention maps para contexto temporal, e validação física para consistência astronômica."}
            </AlertDescription>
          </Alert>

          <FeatureImportance />

          {mode === "researcher" && (
            <div className="mt-6 p-6 border border-border rounded-xl space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Layers className="h-5 w-5 text-accent" />
                <h3 className="font-semibold text-lg">Análise Avançada</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-medium mb-2 text-sm">Attention Weights</h4>
                  <p className="text-xs text-muted-foreground">
                    Visualização dos pontos temporais mais relevantes identificados pelo Transformer durante a análise
                    da light curve.
                  </p>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-medium mb-2 text-sm">Physics Constraints</h4>
                  <p className="text-xs text-muted-foreground">
                    Validação automática contra leis de Kepler, limites de densidade planetária, e compatibilidade
                    estelar.
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  )
}
