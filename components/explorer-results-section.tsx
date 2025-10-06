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
                Analysis Result
              </CardTitle>
              <CardDescription className="text-base">
                See what we discovered about your exoplanet candidate
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
                          ? "The data strongly indicates the presence of a planet" : "The data suggests it is not a real planet"}
                      </p>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-5xl font-bold gradient-text">{confidence.toFixed(1)}%</div>
                    <div className="text-sm text-muted-foreground mt-1">Trust</div>
                  </div>
                </div>
              </div>

              {/* Confidence Meter */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Trust Level</span>
                  <span className="text-sm text-muted-foreground">{confidence.toFixed(1)}%</span>
                </div>
                <Progress value={confidence} className="h-3" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Unlikely</span>
                  <span>Possible</span>
                  <span>Probable</span>
                  <span>Very Likely</span>
                </div>
              </div>

              {/* Educational Explanation */}
              <Alert className="border-primary/30 bg-gradient-to-r from-primary/10 to-accent/10">
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <strong>How we interpret this:</strong> The model analyzed the patterns in the data you provided
                  (such as orbital period, planet size, and star characteristics) and compared it to thousands of
                  known exoplanets and false positives. A confidence level above 50% indicates that it's more likely
                  to be a real planet than a false alarm!
                </AlertDescription>
              </Alert>

              {/* Key Factors */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-card border border-border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    <h4 className="font-semibold text-sm">Traffic Sign</h4>
                  </div>
                  <div className="text-2xl font-bold text-green-500">Strong</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    The pattern of dimming light is consistent with a planet
                  </p>
                </div>

                <div className="p-4 bg-card border border-border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="h-4 w-4 text-accent" />
                    <h4 className="font-semibold text-sm">Features</h4>
                  </div>
                  <div className="text-2xl font-bold text-blue-500">Typical</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Size and orbit consistent with known exoplanets
                  </p>
                </div>

                <div className="p-4 bg-card border border-border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <HelpCircle className="h-4 w-4 text-secondary" />
                    <h4 className="font-semibold text-sm">False Positives</h4>
                  </div>
                  <div className="text-2xl font-bold text-yellow-500">Low</div>
                  <p className="text-xs text-muted-foreground mt-1">
                   Few features of binary systems or noise
                  </p>
                </div>
              </div>

              {/* Next Steps */}
              <div className="p-6 bg-muted/50 rounded-xl border border-border">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  First Steps
                </h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>
                      <strong>See the 3D view</strong> in the "View" tab to understand what the planet might look like.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>
                      <strong>Export your results</strong> in the "Export" tab to save or share
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>
                      <strong>Test with other data</strong> to see how different parameters affect ranking
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
