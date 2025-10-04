"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileUpload } from "@/components/file-upload"
import { ManualDataForm } from "@/components/manual-data-form"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Info, Telescope } from "lucide-react"
import { Upload, Edit3, Database, FileText, Rocket, ArrowLeft, ArrowRight } from "lucide-react"
import { useMode } from "@/lib/mode-context"
import { usePlanetData } from "@/lib/planet-data-context"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { motion, AnimatePresence } from "framer-motion"

export function DataInputSection() {
  const [uploadedData, setUploadedData] = useState<any>(null)
  const [manualRaw, setManualRaw] = useState<any>(null)
  const [dataset, setDataset] = useState<"kepler" | "k2" | "tess">("kepler")
  const [activeStep, setActiveStep] = useState<"dataset" | "input" | "config">("dataset")
  const [inputTab, setInputTab] = useState<"manual" | "upload">("manual")
  const [configNumTrees, setConfigNumTrees] = useState([100])
  const [configLearningRate, setConfigLearningRate] = useState([0.01])
  const [configEpochs, setConfigEpochs] = useState([50])
  const { mode } = useMode()
  const { setIsProcessing } = usePlanetData()

  const handleStartBatchClassification = () => {
    const inputs = inputTab === "upload" ? uploadedData : manualRaw
    if (!inputs) return
    const payload = {
      mode,
      dataset,
      inputs: inputTab === "upload" ? (typeof inputs === "string" ? { csv: inputs } : inputs) : inputs,
    }
    // eslint-disable-next-line no-console
    console.log("CLASSIFY_JSON", payload)
    setIsProcessing(true)
  }

  const handlePrimaryAction = () => {
    if (activeStep === "dataset") {
      setActiveStep("input")
      return
    }
    if (inputTab === "manual") {
      const targetFormId = mode === "explorer" ? "explorer-data-form" : "researcher-data-form"
      const form = document.getElementById(targetFormId) as HTMLFormElement | null
      form?.requestSubmit()
    } else {
      handleStartBatchClassification()
    }
  }

  const missionCopy: Record<"kepler" | "k2" | "tess", { title: string; summary: string; bullets: string[] }> = {
    kepler: {
      title: "Kepler",
      summary:
        "Lançado em 2009, o Kepler mudou a história ao mostrar que planetas são comuns na Via Láctea. Observando uma mesma região por anos e usando o método de trânsito, confirmou milhares de mundos e estabeleceu a estatística de que há mais planetas do que estrelas.",
      bullets: [
        "Técnica: fotometria de trânsitos (quedas minúsculas de brilho)",
        "Região observada: próximo a Cisne e Lira",
        "Legado: > 2.600 exoplanetas confirmados",
      ],
    },
    k2: {
      title: "K2 (Fase Estendida do Kepler)",
      summary:
        "Após a falha de rodas de reação, o Kepler foi reconfigurado como K2, observando campos ao longo da eclíptica com a pressão da luz solar auxiliando no apontamento. A K2 adicionou centenas de planetas e ampliou o escopo científico.",
      bullets: [
        "Campanhas sucessivas por campo ao longo da eclíptica",
        "Alvos: estrelas jovens, aglomerados, até objetos do Sistema Solar",
        "Centenas de descobertas adicionais",
      ],
    },
    tess: {
      title: "TESS",
      summary:
        "Desde 2018, a missão TESS faz um levantamento quase total do céu para encontrar planetas em trânsito ao redor das estrelas mais brilhantes e próximas — ideais para estudos detalhados com o JWST e grandes telescópios.",
      bullets: [
        "Cobertura: ~85% do céu em setores",
        "Alvos: > 200 mil estrelas próximas",
        "Muitos candidatos (TOIs) e centenas de confirmações",
      ],
    },
  }

  const isResearcher = mode === "researcher"

  const stepList = isResearcher
    ? [
        { id: "dataset" as const, label: "1. Selecionar Dataset" },
        { id: "input" as const, label: "2. Inserir Dados" },
        { id: "config" as const, label: "3. Configurar Modelo" },
      ]
    : [
        { id: "dataset" as const, label: "1. Selecionar Dataset" },
        { id: "input" as const, label: "2. Inserir Dados" },
      ]

  const getHeader = () => {
    if (activeStep === "dataset") {
      return {
        title: "Selecione o Dataset",
        description: "Escolha entre Kepler, K2 ou TESS para adequar os campos e o processamento ao catálogo.",
      }
    }
    if (activeStep === "input") {
      return {
        title: "Entrada de Dados",
        description:
          mode === "explorer"
            ? "Insira os dados do seu candidato a exoplaneta para descobrir se é real"
            : "Insira dados de TCEs/KOIs via CSV ou manualmente. Suporte a pipelines Kepler/K2/TESS.",
      }
    }
    return {
      title: "Configuração do Modelo",
      description:
        "Ajuste hiperparâmetros e estratégias do pipeline. A seção de configuração está ao lado direito.",
    }
  }

  const { title, description } = getHeader()

  const goNext = () => {
    const idx = stepList.findIndex((s) => s.id === activeStep)
    const next = stepList[idx + 1]
    if (next) setActiveStep(next.id)
  }

  const goPrev = () => {
    const idx = stepList.findIndex((s) => s.id === activeStep)
    const prev = stepList[idx - 1]
    if (prev) setActiveStep(prev.id)
  }

  return (
    <section id="data" className="scroll-mt-20">
      <Card className="gradient-border bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-2xl md:text-3xl">{title}</CardTitle>
          <CardDescription className="text-sm md:text-base">{description}</CardDescription>
        </CardHeader>

        {/* Footer controls, right under the header (like Tutorial footer style) */}
        <div className="relative border-t border-border/50 bg-gradient-to-r from-primary/5 via-accent/5 to-secondary/5 px-5 md:px-6 py-3">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={goPrev}
              disabled={activeStep === stepList[0].id}
              className="gap-2 border-primary/30 bg-transparent"
            >
              <ArrowLeft className="h-4 w-4" />
              Anterior
            </Button>

            <div className="flex items-center gap-2">
              {stepList.map((s) => (
                <div
                  key={s.id}
                  className={`h-2 rounded-full transition-all ${activeStep === s.id ? "w-8 bg-primary" : "w-2 bg-border"}`}
                />
              ))}
            </div>

            <Button
              onClick={goNext}
              disabled={activeStep === stepList[stepList.length - 1].id}
              className="gap-2 bg-gradient-to-r from-primary via-accent to-secondary hover:opacity-90 disabled:opacity-60"
            >
              Próximo
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <CardContent>


          <AnimatePresence mode="wait">
            {activeStep === "dataset" && (
              <motion.div key="step-dataset" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="mb-6">
                  <Tabs value={dataset} onValueChange={(v) => setDataset(v as any)} className="w-full">
                    <TabsList className="grid w-full max-w-xl mx-auto grid-cols-3 h-auto gap-2 bg-transparent p-0">
                      <TabsTrigger
                        value="kepler"
                        className="group relative flex items-center gap-2 py-2 px-3 rounded-lg border bg-card/60 hover:bg-card/80 transition-all shadow-sm data-[state=active]:border-primary/50 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary/20 data-[state=active]:to-accent/20 data-[state=active]:shadow-md"
                      >
                        <Image src="/telescope/kepler.png" alt="Kepler" width={16} height={16} className="h-4 w-4 object-contain" />
                        <span className="hidden sm:inline">Kepler</span>
                      </TabsTrigger>
                      <TabsTrigger
                        value="k2"
                        className="group relative flex items-center gap-2 py-2 px-3 rounded-lg border bg-card/60 hover:bg-card/80 transition-all shadow-sm data-[state=active]:border-primary/50 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary/20 data-[state=active]:to-accent/20 data-[state=active]:shadow-md"
                      >
                        <Image src="/telescope/kepler.png" alt="K2" width={16} height={16} className="h-4 w-4 object-contain" />
                        <span className="hidden sm:inline">K2</span>
                      </TabsTrigger>
                      <TabsTrigger
                        value="tess"
                        className="group relative flex items-center gap-2 py-2 px-3 rounded-lg border bg-card/60 hover:bg-card/80 transition-all shadow-sm data-[state=active]:border-primary/50 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary/20 data-[state=active]:to-accent/20 data-[state=active]:shadow-md"
                      >
                        <Image src="/telescope/tess.png" alt="TESS" width={16} height={16} className="h-4 w-4 object-contain" />
                        <span className="hidden sm:inline">TESS</span>
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>

                <Card className="mb-6 p-4 md:p-5 bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-md bg-primary/15 text-primary">
                      <Telescope className="h-5 w-5" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <h4 className="text-base md:text-lg font-semibold">{missionCopy[dataset].title}</h4>
                        <Badge variant="outline" className="hidden sm:inline">Dataset: {dataset.toUpperCase()}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">{missionCopy[dataset].summary}</p>
                      <ul className="text-xs md:text-sm text-muted-foreground grid grid-cols-1 sm:grid-cols-3 gap-2">
                        {missionCopy[dataset].bullets.map((b) => (
                          <li key={b} className="p-2 rounded-md border bg-card/60">{b}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </Card>

                <div className="mt-4" />
              </motion.div>
            )}

            {activeStep === "input" && (
              <motion.div key="step-input" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="mb-4" />
          
                <Tabs value={inputTab} onValueChange={(v) => setInputTab(v as any)} className="w-full">
                  <TabsList
                    className="grid w-full max-w-md mx-auto grid-cols-2"
                  >
                    <TabsTrigger value="manual" className="flex items-center gap-2 text-xs md:text-sm">
                      <Edit3 className="h-4 w-4" />
                      <span className="hidden sm:inline">Manual</span>
                    </TabsTrigger>
                    <TabsTrigger value="upload" className="flex items-center gap-2 text-xs md:text-sm">
                      <Upload className="h-4 w-4" />
                      <span className="hidden sm:inline">Upload</span>
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="manual" className="mt-6">
                    <ManualDataForm
                      showSubmit={mode === "explorer"}
                      formId={mode === "explorer" ? "explorer-data-form" : "researcher-data-form"}
                      dataset={dataset}
                      onChangeRaw={setManualRaw}
                    />
                  </TabsContent>

                  <TabsContent value="upload" className="mt-6">
                    <FileUpload onDataUploaded={setUploadedData} dataset={dataset} />
                    {mode === "explorer" && (
                      <div className="flex justify-center pt-4">
                        <Button type="button" size="lg" className="gap-2 glow-effect" onClick={handleStartBatchClassification} disabled={!uploadedData}>
                          Classificar Candidatos
                        </Button>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>

                <div className="mt-4" />
              </motion.div>
            )}

            {isResearcher && activeStep === "config" && (
              <motion.div key="step-config" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="mb-4" />
                {/* Inline Model Config content for the final step (reuse same UI) */}
                <div className="space-y-6">
                  <Tabs defaultValue="architecture" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="architecture" className="flex items-center gap-2">
                        Arquitetura
                      </TabsTrigger>
                      <TabsTrigger value="hyperparams" className="flex items-center gap-2">
                        Hiperparâmetros
                      </TabsTrigger>
                    </TabsList>
                    <TabsContent value="architecture" className="mt-4 space-y-6">
                      <div className="grid grid-cols-1 gap-3">
                        <div className="p-3 border border-primary/30 rounded-lg bg-primary/5">
                          <h4 className="font-semibold mb-2">Transformer 1D</h4>
                          <p className="text-xs text-muted-foreground leading-relaxed">Análise temporal de light curves com attention mechanism</p>
                        </div>
                        <div className="p-3 border border-accent/30 rounded-lg bg-accent/5">
                          <h4 className="font-semibold mb-2">CNN 2D</h4>
                          <p className="text-xs text-muted-foreground leading-relaxed">Extração de features espaciais de phase-folded views</p>
                        </div>
                        <div className="p-3 border border-secondary/30 rounded-lg bg-secondary/5">
                          <h4 className="font-semibold mb-2">MLP Fusion</h4>
                          <p className="text-xs text-muted-foreground leading-relaxed">Combinação de features + metadados estelares</p>
                        </div>
                      </div>
                      <div className="mt-4 p-4 bg-muted/50 rounded-lg border border-border">
                        <h4 className="text-sm font-medium mb-3">Resumo da Configuração</h4>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Árvores:</span>{" "}
                            <span className="font-mono font-medium">{configNumTrees[0]}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Taxa:</span>{" "}
                            <span className="font-mono font-medium">{configLearningRate[0].toFixed(3)}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Épocas:</span>{" "}
                            <span className="font-mono font-medium">{configEpochs[0]}</span>
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                    <TabsContent value="hyperparams" className="mt-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="numTreesCfg" className="text-sm font-medium">Número de Árvores</Label>
                            <span className="text-sm font-mono text-primary">{configNumTrees[0]}</span>
                          </div>
                          <Slider id="numTreesCfg" min={10} max={500} step={10} value={configNumTrees} onValueChange={setConfigNumTrees} className="w-full" />
                          <div className="flex justify-between text-xs text-muted-foreground"><span>10</span><span>500</span></div>
                        </div>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="lrCfg" className="text-sm font-medium">Taxa de Aprendizado</Label>
                            <span className="text-sm font-mono text-primary">{configLearningRate[0].toFixed(3)}</span>
                          </div>
                          <Slider id="lrCfg" min={0.001} max={0.1} step={0.001} value={configLearningRate} onValueChange={setConfigLearningRate} className="w-full" />
                          <div className="flex justify-between text-xs text-muted-foreground"><span>0.001</span><span>0.1</span></div>
                        </div>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="epochsCfg" className="text-sm font-medium">Épocas de Treinamento</Label>
                            <span className="text-sm font-mono text-primary">{configEpochs[0]}</span>
                          </div>
                          <Slider id="epochsCfg" min={10} max={100} step={5} value={configEpochs} onValueChange={setConfigEpochs} className="w-full" />
                          <div className="flex justify-between text-xs text-muted-foreground"><span>10</span><span>100</span></div>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
                <div className="flex justify-center pt-6">
                  <Button
                    type="button"
                    size="lg"
                    className="gap-2 glow-effect"
                    onClick={handleStartBatchClassification}
                    disabled={!(inputTab === "upload" ? uploadedData : manualRaw)}
                  >
                    Iniciar Classificação
                  </Button>
                </div>
                <div className="mt-4" />
              </motion.div>
            )}
          </AnimatePresence>

        </CardContent>
      </Card>
    </section>
  )
}
