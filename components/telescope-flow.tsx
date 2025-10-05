"use client"

import { useMode } from "@/lib/mode-context"
import Image from "next/image"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { KeplerClassificationTable } from "@/components/kepler-classification-table"
import { TessClassificationTable } from "@/components/tess-classification-table"
// import { ConfusionMatrix } from "@/components/confusion-matrix"
import { RocCurve } from "@/components/roc-curve"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Info } from "lucide-react"
import { useState } from "react"

export function TelescopeFlow() {
  const { mode } = useMode()

  if (mode !== "kepler" && mode !== "tess") return null

  const isKepler = mode === "kepler"
  const bannerSrc = isKepler ? "/telescope/keplerWallpaper.jpg" : "/telescope/tessWallpaper.jpeg"
  const title = isKepler ? "Kepler" : "TESS"
  const [keplerDataset, setKeplerDataset] = useState<"kepler" | "k2">("kepler")

  return (
    <div className="space-y-8">
      {/* Banner full-width inside container */}
      <div className="relative w-full overflow-hidden rounded-xl border border-border bg-black/20">
        <Image
          src={bannerSrc}
          alt={`Banner ${title}`}
          width={1600}
          height={480}
          priority
          className="w-full h-40 sm:h-56 md:h-72 lg:h-80 object-cover"
        />
        <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/60 to-transparent">
          <div className="flex items-end justify-between">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white drop-shadow">{title}</h2>
            {isKepler && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setKeplerDataset("kepler")}
                  className={`px-3 py-1.5 rounded-md text-xs sm:text-sm transition-colors border ${
                    keplerDataset === "kepler" ? "bg-white/90 text-black" : "bg-black/40 text-white border-white/30"
                  }`}
                >
                  Kepler
                </button>
                <button
                  onClick={() => setKeplerDataset("k2")}
                  className={`px-3 py-1.5 rounded-md text-xs sm:text-sm transition-colors border ${
                    keplerDataset === "k2" ? "bg-white/90 text-black" : "bg-black/40 text-white border-white/30"
                  }`}
                >
                  K2
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <Tabs defaultValue="classifications" className="w-full">
        <TabsList className="grid w-full grid-cols-3 h-auto">
          <TabsTrigger value="about">About</TabsTrigger>
          <TabsTrigger value="classifications">Classifications</TabsTrigger>
          <TabsTrigger value="report">Report</TabsTrigger>
        </TabsList>

        <TabsContent value="about" className="mt-6 space-y-6">
          {isKepler ? (
            <Card className="p-6 bg-card/50 space-y-6">
              <div className="space-y-2">
                <h3 className="text-xl font-semibold">Kepler: the telescope that revealed a galaxy full of worlds</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Operando de 2009 a 2018, o Kepler transformou a busca por exoplanetas. Ao monitorar continuamente uma
                  única região próxima às constelações de Cisne e Lira, o observatório identificou quedas minúsculas de
                  brilho em mais de cem mil estrelas — a assinatura de planetas passando diante de suas estrelas. Ao fim
                  da missão principal, somava-se um legado notável: {""}
                  <span className="font-medium text-foreground">mais de 2.600 planetas confirmados</span> e a certeza
                  estatística de que ({""}
                  <span className="font-medium text-foreground">há mais planetas do que estrelas</span>) na Via Láctea.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg bg-gradient-to-br from-primary/5 to-accent/5">
                  <div className="text-xs text-muted-foreground mb-1">Launch</div>
                  <div className="text-lg font-semibold">2009</div>
                </div>
                <div className="p-4 border rounded-lg bg-gradient-to-br from-primary/5 to-accent/5">
                  <div className="text-xs text-muted-foreground mb-1">Technique</div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-semibold">Trânsitos</span>
                    <Badge variant="outline">High-precision photometry</Badge>
                  </div>
                </div>
                <div className="p-4 border rounded-lg bg-gradient-to-br from-primary/5 to-accent/5">
                  <div className="text-xs text-muted-foreground mb-1">Discoveries</div>
                  <div className="text-lg font-semibold">2.662 planetas</div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold">From idea to mission</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  A proposta — liderada por William Borucki — enfrentou ceticismo por décadas. Em 2001, após um
                  experimento simples que simulou um planeta transitando uma estrela e provou a viabilidade técnica,
                  a missão recebeu aprovação. Diferente do Hubble, o Kepler foi colocado em uma órbita heliocêntrica
                  que lhe permitiu observar a mesma região do céu sem interrupção.
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold">K2: Kepler reinvented</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Em 2013, a perda de rodas de reação comprometeu o apontamento fino. A equipe então reconfigurou o
                  telescópio para usar a pressão da luz solar como estabilizador e passou a observar campos ao longo do
                  plano da eclíptica em campanhas sucessivas. A fase {""}
                  <span className="font-medium text-foreground">K2</span> acrescentou centenas de mundos e expandiu o
                  escopo científico para estrelas jovens, aglomerados e até objetos do Sistema Solar.
                </p>
                <div className="p-4 border rounded-lg bg-muted/30">
                  <p className="text-xs text-muted-foreground">Use the banner switch to toggle between <span className="font-medium">Kepler</span> and <span className="font-medium">K2</span> tables.</p>
                </div>
              </div>
            </Card>
          ) : (
            <Card className="p-6 bg-card/50 space-y-6">
              <div className="space-y-2">
                <h3 className="text-xl font-semibold">TESS: an all-sky survey for nearby worlds</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Launched in 2018, <span className="font-medium">TESS</span> surveys nearly the entire sky for transiting planets around bright, nearby stars. It monitors over <span className="font-medium text-foreground">200k target stars</span> and has produced thousands of TOIs with hundreds of confirmations — ideal targets for detailed characterization with JWST and ground-based facilities.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg bg-gradient-to-br from-secondary/5 to-accent/5">
                  <div className="text-xs text-muted-foreground mb-1">Launch</div>
                  <div className="text-lg font-semibold">2018 (Falcon 9)</div>
                </div>
                <div className="p-4 border rounded-lg bg-gradient-to-br from-secondary/5 to-accent/5">
                  <div className="text-xs text-muted-foreground mb-1">Coverage</div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-semibold">85% of the sky</span>
                    <Badge variant="outline">Successive sectors</Badge>
                  </div>
                </div>
                <div className="p-4 border rounded-lg bg-gradient-to-br from-secondary/5 to-accent/5">
                  <div className="text-xs text-muted-foreground mb-1">Science focus</div>
                  <div className="text-lg font-semibold">Nearby, bright worlds</div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold">Early results and milestones</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  First light revealed the Magellanic Clouds and dense stellar fields. Early finds include Pi Mensae c and compact systems like TOI‑270. The mission also captured rare events, such as a tidal disruption by a distant black hole.
                </p>
              </div>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="classifications" className="mt-6 space-y-4">
          <Alert className="border-muted-foreground/30">
            <Info className="h-4 w-4" />
            <AlertDescription>
              The table below lists exoplanet candidates and their classifications, produced by our machine learning model on {title} data.
            </AlertDescription>
          </Alert>
          {isKepler ? (
            <KeplerClassificationTable dataset={keplerDataset} />
          ) : (
            <TessClassificationTable />
          )}
        </TabsContent>

        <TabsContent value="report" className="mt-6 space-y-6">
          <Card className="p-6 bg-card/50">
            <div className="space-y-2">
              <h3 className="text-xl font-semibold">Model Run Report ({title})</h3>
              <p className="text-sm text-muted-foreground">Summary of metrics and visualizations that support the classifications shown in the "Classifications" tab.</p>
            </div>
            <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* <ConfusionMatrix /> */}
              <RocCurve />
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}


