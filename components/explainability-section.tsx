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
            <CardTitle className="text-2xl">Model Explainability</CardTitle>
          </div>
          <CardDescription>
            {mode === "explorer"
              ? "Understand which variables most influenced the classification model's decisions"
              : "SHAP values, attention weights, and physics-informed constraints for complete interpretability"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert className="border-primary/30 bg-primary/5">
            <Lightbulb className="h-4 w-4 text-primary" />
            <AlertDescription className="text-sm text-foreground">
              {mode === "explorer"
                ? "Feature importance indicates the relative weight of each variable in the model's predictions. Higher values ​​mean greater influence on the classification."
                : "Multi-layer analysis: SHAP for global importance, attention maps for temporal context, and physical validation for astronomical consistency."}
            </AlertDescription>
          </Alert>

          <FeatureImportance />

          {mode === "researcher" && (
            <div className="mt-6 p-6 border border-border rounded-xl space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Layers className="h-5 w-5 text-accent" />
                <h3 className="font-semibold text-lg">Advanced Analysis</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-medium mb-2 text-sm">Attention Weights</h4>
                  <p className="text-xs text-muted-foreground">
                    Visualization of the most relevant time points identified by the Transformer during the analysis of the light curve.
                  </p>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-medium mb-2 text-sm">Physics Constraints</h4>
                  <p className="text-xs text-muted-foreground">
                    Automatic validation against Kepler's laws, planetary density limits, and stellar compatibility.
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
