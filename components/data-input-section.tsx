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
  const { setIsProcessing, setStreamSteps, setStreamPredictions } = usePlanetData()

  const handleStartBatchClassification = () => {
    const inputs = inputTab === "upload" ? uploadedData : manualRaw
    if (!inputs) return

    if (inputTab === "upload") {
      const modelName = mode === "researcher" ? "researcher" : "explorer"
      const fileObj = (inputs as any)?.file as File | undefined
      if (!fileObj) return

      ;(async () => {
        try {
          const formData = new FormData()
          formData.append("file", fileObj, fileObj.name)
          formData.append("mode", modelName)
          formData.append("dataset", dataset)

          const response = await fetch("https://gote-backend.onrender.com/upload/exoplanet", {
            method: "POST",
            body: formData,
          })

          if (!response.ok || !response.body) {
            // eslint-disable-next-line no-console
            console.error("Upload error: invalid response")
            return
          }

          setIsProcessing(true)
          // scroll to pipeline section smoothly if present
          try {
            document.querySelector('#pipeline')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
          } catch {}
          const reader = response.body.getReader()
          const decoder = new TextDecoder()
          const stepStart: Record<number, number> = {}
          let lastStep = 0
          let buffer = ""
          setStreamSteps([])
          setStreamPredictions([])

          const maybeFinishStep = (stepNum: number, nowTs: number) => {
            if (stepStart[stepNum]) {
              const startedAt = stepStart[stepNum]
              const durationMs = nowTs - startedAt
              setStreamSteps((prev) => {
                const others = prev.filter((s) => s.step !== stepNum)
                const prevStatus = prev.find((s) => s.step === stepNum)?.status || `Step ${stepNum}`
                return [...others, { step: stepNum, status: prevStatus, startedAt, finishedAt: nowTs, durationMs }]
              })
            }
          }

          while (true) {
            const { done, value } = await reader.read()
            if (done) break
            buffer += decoder.decode(value, { stream: true })
            const parts = buffer.split("\n\n")
            buffer = parts.pop() || ""
            for (const raw of parts) {
              const line = raw.trim()
              if (!line.startsWith("data:")) continue
              const data = line.replace("data:", "").trim()
              // eslint-disable-next-line no-console
              console.log("STREAM:", data)
              try {
                const json = JSON.parse(data)
                if (typeof json.step === "number" && typeof json.status === "string") {
                  const now = Date.now()
                  // finalize previous step if we moved forward
                  if (lastStep > 0 && json.step > lastStep) {
                    maybeFinishStep(lastStep, now)
                  }

                  // mark step start if first time seen
                  if (!stepStart[json.step]) stepStart[json.step] = now
                  lastStep = Math.max(lastStep, json.step)

                  // if backend indicates completion in status/flag, finalize same step
                  const doneHints = ["done", "completed", "finished"]
                  const lower = json.status.toLowerCase()
                  const isExplicitDone = Boolean(json.finished) || doneHints.some((h) => lower.includes(h))
                  setStreamSteps((prev) => [
                    ...prev.filter((s) => s.step !== json.step),
                    { step: json.step, status: json.status, startedAt: stepStart[json.step] },
                  ])
                  if (isExplicitDone) {
                    maybeFinishStep(json.step, now)
                  }
                }
                if (Array.isArray(json.predictions)) {
                  setStreamPredictions(json.predictions as any)
                }
              } catch {
                // ignore malformed chunks; buffer logic will reassemble
              }
            }
          }
          // finalize last step
          if (lastStep > 0) {
            maybeFinishStep(lastStep, Date.now())
          }
          // eslint-disable-next-line no-console
          console.log("Streaming finished")
          setIsProcessing(false)
        } catch (err) {
          // eslint-disable-next-line no-console
          console.error("Streaming error:", err)
        }
      })()
      return
    }

    // Manual path: log payload only for now
    const payload = { mode, dataset, inputs }
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
        "Launched in 2009, Kepler showed that planets are common in the Milky Way. By monitoring one region for years and using the transit method, it confirmed thousands of worlds and revealed there are more planets than stars.",
      bullets: [
        "Technique: transit photometry (tiny brightness drops)",
        "Observed region: near Cygnus and Lyra",
        "Legacy: > 2,600 confirmed exoplanets",
      ],
    },
    k2: {
      title: "K2 (Kepler Extended Mission)",
      summary:
        "After reaction wheel failures, Kepler was reconfigured as K2, observing fields along the ecliptic with solar pressure assisting pointing. K2 added hundreds of planets and expanded science targets.",
      bullets: [
        "Successive campaigns along the ecliptic",
        "Targets: young stars, clusters, even Solar System objects",
        "Hundreds of additional discoveries",
      ],
    },
    tess: {
      title: "TESS",
      summary:
        "Since 2018, TESS has surveyed nearly the entire sky for transiting planets around bright, nearby stars — ideal for detailed study with JWST and large observatories.",
      bullets: [
        "Coverage: ~85% of the sky",
        "Targets: > 200k nearby stars",
        "Thousands of TOIs and hundreds of confirmations",
      ],
    },
  }

  const isResearcher = mode === "researcher"

  const stepList = isResearcher
    ? [
        { id: "dataset" as const, label: "1. Select Dataset" },
        { id: "config" as const, label: "2. Configure Model" },
        { id: "input" as const, label: "3. Enter Data" },
      ]
    : [
        { id: "dataset" as const, label: "1. Select Dataset" },
        { id: "input" as const, label: "2. Enter Data" },
      ]

  const getHeader = () => {
    if (activeStep === "dataset") {
      return {
        title: "Select Dataset",
        description: "Choose Kepler, K2 or TESS to tailor fields and processing to the catalog.",
      }
    }
    if (activeStep === "input") {
      return {
        title: "Data Entry",
        description:
          mode === "explorer"
            ? "Enter your candidate data to discover if it is a real exoplanet"
            : "Enter TCE/KOI data via CSV or manually. Supports Kepler/K2/TESS pipelines.",
      }
    }
    return {
      title: "Model Configuration",
      description:
        "Adjust hyperparameters and pipeline strategies. The configuration section is on the right.",
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
              Previous
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
              Next
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
                      showSubmit={true}
                formId={mode === "explorer" ? "explorer-data-form" : "researcher-data-form"}
                      dataset={dataset}
                      onChangeRaw={setManualRaw}
              />
            </TabsContent>

            <TabsContent value="upload" className="mt-6">
                    <FileUpload onDataUploaded={setUploadedData} dataset={dataset} />
                    <div className="flex justify-center pt-4">
                      <Button type="button" size="lg" className="gap-2 glow-effect" onClick={handleStartBatchClassification} disabled={!uploadedData}>
                        Classificar Candidatos
                      </Button>
                    </div>
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
                        <h4 className="text-sm font-medium mb-3">Configuration Summary</h4>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Trees:</span>{" "}
                            <span className="font-mono font-medium">{configNumTrees[0]}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Learning rate:</span>{" "}
                            <span className="font-mono font-medium">{configLearningRate[0].toFixed(3)}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Epochs:</span>{" "}
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
                <div className="mt-4" />
              </motion.div>
            )}
          </AnimatePresence>

        </CardContent>
      </Card>
    </section>
  )
}
