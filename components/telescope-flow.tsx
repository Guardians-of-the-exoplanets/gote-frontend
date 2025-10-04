"use client"

import { useMode } from "@/lib/mode-context"
import Image from "next/image"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { KeplerClassificationTable } from "@/components/kepler-classification-table"
import { TessClassificationTable } from "@/components/tess-classification-table"
import { ConfusionMatrix } from "@/components/confusion-matrix"
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
          <TabsTrigger value="about">Sobre</TabsTrigger>
          <TabsTrigger value="classifications">Classificações</TabsTrigger>
          <TabsTrigger value="report">Relatório</TabsTrigger>
        </TabsList>

        <TabsContent value="about" className="mt-6 space-y-6">
          {isKepler ? (
            <Card className="p-6 bg-card/50 space-y-6">
              <div className="space-y-2">
                <h3 className="text-xl font-semibold">Kepler: o telescópio que revelou uma galáxia repleta de mundos</h3>
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
                  <div className="text-xs text-muted-foreground mb-1">Lançamento</div>
                  <div className="text-lg font-semibold">2009</div>
                </div>
                <div className="p-4 border rounded-lg bg-gradient-to-br from-primary/5 to-accent/5">
                  <div className="text-xs text-muted-foreground mb-1">Técnica</div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-semibold">Trânsitos</span>
                    <Badge variant="outline">Fotometria de alta precisão</Badge>
                  </div>
                </div>
                <div className="p-4 border rounded-lg bg-gradient-to-br from-primary/5 to-accent/5">
                  <div className="text-xs text-muted-foreground mb-1">Descobertas</div>
                  <div className="text-lg font-semibold">2.662 planetas</div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold">Da ideia à missão</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  A proposta — liderada por William Borucki — enfrentou ceticismo por décadas. Em 2001, após um
                  experimento simples que simulou um planeta transitando uma estrela e provou a viabilidade técnica,
                  a missão recebeu aprovação. Diferente do Hubble, o Kepler foi colocado em uma órbita heliocêntrica
                  que lhe permitiu observar a mesma região do céu sem interrupção.
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold">K2: a reinvenção do Kepler</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Em 2013, a perda de rodas de reação comprometeu o apontamento fino. A equipe então reconfigurou o
                  telescópio para usar a pressão da luz solar como estabilizador e passou a observar campos ao longo do
                  plano da eclíptica em campanhas sucessivas. A fase {""}
                  <span className="font-medium text-foreground">K2</span> acrescentou centenas de mundos e expandiu o
                  escopo científico para estrelas jovens, aglomerados e até objetos do Sistema Solar.
                </p>
                <div className="p-4 border rounded-lg bg-muted/30">
                  <p className="text-xs text-muted-foreground">
                    Use o seletor no banner para alternar entre as tabelas {""}
                    <span className="font-medium">Kepler</span> e <span className="font-medium">K2</span>.
                  </p>
                </div>
              </div>
            </Card>
          ) : (
            <Card className="p-6 bg-card/50 space-y-6">
              <div className="space-y-2">
                <h3 className="text-xl font-semibold">TESS: o levantamento de todo o céu em busca de mundos próximos</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Lançada em 2018, a missão <span className="font-medium">TESS</span>, liderada pelo MIT no programa
                  Explorer da NASA, examina quase todo o céu em busca de planetas em trânsito ao redor das estrelas mais
                  brilhantes e próximas. Em seu levantamento, monitora mais de {""}
                  <span className="font-medium text-foreground">200 mil estrelas-alvo</span> e já gerou milhares de
                  candidatos (TOIs), com centenas de confirmações — alvos ideais para caracterização detalhada com o
                  Telescópio Espacial James Webb e observatórios terrestres.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg bg-gradient-to-br from-secondary/5 to-accent/5">
                  <div className="text-xs text-muted-foreground mb-1">Lançamento</div>
                  <div className="text-lg font-semibold">2018 (Falcon 9)</div>
                </div>
                <div className="p-4 border rounded-lg bg-gradient-to-br from-secondary/5 to-accent/5">
                  <div className="text-xs text-muted-foreground mb-1">Cobertura</div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-semibold">85% do céu</span>
                    <Badge variant="outline">Setores sucessivos</Badge>
                  </div>
                </div>
                <div className="p-4 border rounded-lg bg-gradient-to-br from-secondary/5 to-accent/5">
                  <div className="text-xs text-muted-foreground mb-1">Foco científico</div>
                  <div className="text-lg font-semibold">Mundos próximos e brilhantes</div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold">Primeiros resultados e marcos</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  A primeira luz revelou as Nuvens de Magalhães e campos densos em estrelas. Entre os achados iniciais
                  estão Pi Mensae c e sistemas compactos como o TOI‑270. A missão também registrou fenômenos raros, como
                  um evento de ruptura por maré causado por um buraco negro distante.
                </p>
              </div>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="classifications" className="mt-6 space-y-4">
          <Alert className="border-muted-foreground/30">
            <Info className="h-4 w-4" />
            <AlertDescription>
              A tabela abaixo apresenta candidatos a exoplanetas e suas respectivas classificações,
              produzidas pela execução do nosso modelo de machine learning sobre os dados do {title}.
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
              <h3 className="text-xl font-semibold">Relatório de Execução do Modelo ({title})</h3>
              <p className="text-sm text-muted-foreground">
                Sumário das métricas e visualizações que suportam as classificações apresentadas na aba
                "Classificações".
              </p>
            </div>
            <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ConfusionMatrix />
              <RocCurve />
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}


