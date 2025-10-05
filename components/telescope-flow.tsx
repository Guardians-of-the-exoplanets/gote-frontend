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

export function TelescopeFlow({ focus }: { focus?: 'kepler' | 'tess' }) {
  const { mode } = useMode()
  const [keplerDataset, setKeplerDataset] = useState<"kepler" | "k2">("kepler")

  if (mode !== "example") return null

  return (
    <div className="space-y-16">
      {/* ---------- KEPLER/K2---------- */}
      {(focus === undefined || focus === 'kepler') && (
      <div className="space-y-8">
        <div className="relative w-full overflow-hidden rounded-xl border border-border bg-black/20">
          <Image
            src="/telescope/keplerWallpaper.jpg"
            alt="Banner Kepler"
            width={1600}
            height={480}
            priority
            className="w-full h-40 sm:h-56 md:h-72 lg:h-80 object-cover"
          />
          <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/60 to-transparent">
            <div className="flex items-end justify-between">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white drop-shadow">Kepler</h2>
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
            <Card className="p-6 bg-card/50 space-y-6">
              <div className="space-y-2">
                <h3 className="text-xl font-semibold">Kepler: the telescope that revealed a galaxy full of worlds</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Operando de 2009 a 2018, o Kepler transformou a busca por exoplanetas...
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
            </Card>
          </TabsContent>

          <TabsContent value="classifications" className="mt-6 space-y-4">
            <Alert className="border-muted-foreground/30">
              <Info className="h-4 w-4" />
              <AlertDescription>
                The table below lists exoplanet candidates and their classifications, produced by our machine learning model on Kepler data.
              </AlertDescription>
            </Alert>
            <KeplerClassificationTable dataset={keplerDataset} />
          </TabsContent>

          <TabsContent value="report" className="mt-6 space-y-6">
            <Card className="p-6 bg-card/50">
              <h3 className="text-xl font-semibold">Model Run Report (Kepler)</h3>
              <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
                <RocCurve />
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      )}

      {/* ---------- TESS ---------- */}
      {(focus === undefined || focus === 'tess') && (
      <div className="space-y-8">
        <div className="relative w-full overflow-hidden rounded-xl border border-border bg-black/20">
          <Image
            src="/telescope/tessWallpaper.jpeg"
            alt="Banner TESS"
            width={1600}
            height={480}
            className="w-full h-40 sm:h-56 md:h-72 lg:h-80 object-cover"
          />
          <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/60 to-transparent">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white drop-shadow">TESS</h2>
          </div>
        </div>

        <Tabs defaultValue="classifications" className="w-full">
          <TabsList className="grid w-full grid-cols-3 h-auto">
            <TabsTrigger value="about">About</TabsTrigger>
            <TabsTrigger value="classifications">Classifications</TabsTrigger>
            <TabsTrigger value="report">Report</TabsTrigger>
          </TabsList>

          <TabsContent value="about" className="mt-6 space-y-6">
            <Card className="p-6 bg-card/50 space-y-6">
              <h3 className="text-xl font-semibold">TESS: an all-sky survey for nearby worlds</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Launched in 2018, <span className="font-medium">TESS</span> surveys nearly the entire sky for transiting planets around bright, nearby stars...
              </p>
            </Card>
          </TabsContent>

          <TabsContent value="classifications" className="mt-6 space-y-4">
            <Alert className="border-muted-foreground/30">
              <Info className="h-4 w-4" />
              <AlertDescription>
                The table below lists exoplanet candidates and their classifications, produced by our model on TESS data.
              </AlertDescription>
            </Alert>
            <TessClassificationTable />
          </TabsContent>

          <TabsContent value="report" className="mt-6 space-y-6">
            <Card className="p-6 bg-card/50">
              <h3 className="text-xl font-semibold">Model Run Report (TESS)</h3>
              <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
                <RocCurve />
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      )}
    </div>
  )
}



