"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Sparkles, CheckCircle2, XCircle, HelpCircle, TrendingUp, Info } from "lucide-react"
import { useMode } from "@/lib/mode-context"
import { usePlanetData } from "@/lib/planet-data-context"
import { motion } from "framer-motion"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"

export function ExplorerResultsSection() {
  const { mode } = useMode()
  const { prediction } = usePlanetData()

  if (mode !== "explorer") return null
  if (!prediction) return null

  const confidence = prediction.probability
  const isExoplanet = prediction.classification === "Confirmado" || prediction.classification === "Candidato"

  return (
    <section id="results" className="scroll-mt-20">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="space-y-6">
          <Card className="gradient-border bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-3xl flex items-center gap-2">
                <Sparkles className="h-8 w-8 text-primary" />
                Resultado da Análise
              </CardTitle>
              <CardDescription className="text-base">
                Veja o que descobrimos sobre seu candidato a exoplaneta
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Main Result Card */}
              <div
                className={`p-8 rounded-2xl border-2 ${isExoplanet ? "bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/30" : "bg-gradient-to-br from-red-500/10 to-orange-500/10 border-red-500/30"}`}
              >
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="flex items-center gap-4">
                    {isExoplanet ? (
                      <div className="p-4 bg-green-500 rounded-full">
                        <CheckCircle2 className="h-12 w-12 text-white" />
                      </div>
                    ) : (
                      <div className="p-4 bg-red-500 rounded-full">
                        <XCircle className="h-12 w-12 text-white" />
                      </div>
                    )}
                    <div>
                      <h3 className="text-2xl md:text-3xl font-bold mb-1">{prediction.classification}!</h3>
                      <p className="text-muted-foreground">
                        {isExoplanet
                          ? "Os dados indicam fortemente a presença de um planeta"
                          : "Os dados sugerem que não é um planeta real"}
                      </p>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-5xl font-bold gradient-text">{confidence.toFixed(1)}%</div>
                    <div className="text-sm text-muted-foreground mt-1">Confiança</div>
                  </div>
                </div>
              </div>

              {/* Confidence Meter */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Nível de Confiança</span>
                  <span className="text-sm text-muted-foreground">{confidence.toFixed(1)}%</span>
                </div>
                <Progress value={confidence} className="h-3" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Improvável</span>
                  <span>Possível</span>
                  <span>Provável</span>
                  <span>Muito Provável</span>
                </div>
              </div>

              {/* Educational Explanation */}
              <Alert className="border-primary/30 bg-gradient-to-r from-primary/10 to-accent/10">
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <strong>Como interpretamos isso:</strong> O modelo analisou os padrões nos dados que você forneceu
                  (como o período orbital, tamanho do planeta e características da estrela) e comparou com milhares de
                  exoplanetas conhecidos e falsos positivos. Uma confiança acima de 50% indica que é mais provável ser
                  um planeta real do que um falso alarme!
                </AlertDescription>
              </Alert>

              {/* Key Factors */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-card border border-border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    <h4 className="font-semibold text-sm">Sinal de Trânsito</h4>
                  </div>
                  <div className="text-2xl font-bold text-green-500">Forte</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    O padrão de diminuição de luz é consistente com um planeta
                  </p>
                </div>

                <div className="p-4 bg-card border border-border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="h-4 w-4 text-accent" />
                    <h4 className="font-semibold text-sm">Características</h4>
                  </div>
                  <div className="text-2xl font-bold text-blue-500">Típicas</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Tamanho e órbita compatíveis com exoplanetas conhecidos
                  </p>
                </div>

                <div className="p-4 bg-card border border-border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <HelpCircle className="h-4 w-4 text-secondary" />
                    <h4 className="font-semibold text-sm">Falsos Positivos</h4>
                  </div>
                  <div className="text-2xl font-bold text-yellow-500">Baixo</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Poucas características de sistemas binários ou ruído
                  </p>
                </div>
              </div>

              {/* Next Steps */}
              <div className="p-6 bg-muted/50 rounded-xl border border-border">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  Próximos Passos
                </h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>
                      <strong>Veja a visualização 3D</strong> na aba "Visualização" para entender como o planeta pode
                      parecer
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>
                      <strong>Exporte seus resultados</strong> na aba "Exportação" para salvar ou compartilhar
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>
                      <strong>Teste com outros dados</strong> para ver como diferentes parâmetros afetam a classificação
                    </span>
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </section>
  )
}
