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
import { Upload, Edit3, Database, FileText, Rocket, ArrowLeft, ArrowRight, RotateCcw, Sparkles } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { useMode } from "@/lib/mode-context"
import { usePlanetData } from "@/lib/planet-data-context"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
import { motion, AnimatePresence } from "framer-motion"

export function DataInputSection() {
  const [uploadedData, setUploadedData] = useState<any>(null)
  const [manualRaw, setManualRaw] = useState<any>(null)
  const [dataset, setDataset] = useState<"kepler" | "k2" | "tess">("kepler")
  const [activeStep, setActiveStep] = useState<"dataset" | "input" | "config">("dataset")
  const [inputTab, setInputTab] = useState<"manual" | "upload">("manual")
  
  // Expose upload state for retraining feature
  const hasUploadedFile = uploadedData !== null
  const [hyperparams, setHyperparams] = useState({
    eval_metric: "mlogloss",
    objective: "multi:softprob",
    colsample_bytree: 0.8,
    learning_rate: 0.1,
    max_depth: 4,
    n_estimators: 300,
    subsample: 0.8,
  })
  const { mode } = useMode()
          const { 
            setIsProcessing, 
            setStreamSteps, 
            setStreamPredictions, 
            setRunMeta, 
            useHyperparams, 
            setUseHyperparams, 
            setResearchMetrics,
            isProcessing,
            prediction,
            streamPredictions,
            setPrediction
          } = usePlanetData()
          const { pushDebugEvent } = usePlanetData() as any

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
          if (mode === "researcher" && useHyperparams) {
            // Attach hyperparameters as JSON string
            formData.append("hyperparameters", JSON.stringify(hyperparams))
          }

          // Log a readable preview of the request
          // eslint-disable-next-line no-console
          console.log("UPLOAD_REQUEST", {
            mode: modelName,
            dataset,
            file: { name: fileObj.name, size: fileObj.size, type: fileObj.type },
            ...(mode === "researcher" && useHyperparams ? { hyperparameters: hyperparams } : {}),
          })

          const response = await fetch("https://gote-backend.onrender.com/upload/exoplanet", {
            method: "POST",
            body: formData,
          })

          if (!response.ok || !response.body) {
            // eslint-disable-next-line no-console
            console.error("Upload error: invalid response")
            return
          }

          setRunMeta({ inputKind: 'upload', hasHyperparams: mode === 'researcher' })
          setIsProcessing(true)
          try { if (mode === 'researcher') setResearchMetrics({} as any) } catch {}
     
          const reader = response.body.getReader()
          const decoder = new TextDecoder()
          const stepStart: Record<number, number> = {}
          let lastStep = 0
          let buffer = ""
          let incompleteJson = "" // Buffer for incomplete JSON across chunks
          setStreamSteps([])
          setStreamPredictions([])
          // seed step 1: Upload received / validating
          stepStart[1] = Date.now()
          setStreamSteps([{ step: 1, status: 'Uploading file & validating', startedAt: stepStart[1] }])
          lastStep = 1

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
            document.querySelector(`#pipeline-${mode}`)?.scrollIntoView({ behavior: 'smooth'})
            const { done, value } = await reader.read()
            if (done) break
            buffer += decoder.decode(value, { stream: true })
            const parts = buffer.split("\n\n")
            buffer = parts.pop() || ""
            for (const raw of parts) {
              const line = raw.trim()
              if (!line.startsWith("data:")) continue
              const payload = line.replace("data:", "").trim()
              // eslint-disable-next-line no-console
              console.log("STREAM:", payload.substring(0, 100) + (payload.length > 100 ? '...' : ''))
              
              // Split payload by newlines - backend may send multiple JSONs in one SSE message
              const jsonLines = payload.split(/\n+/).map(s => s.trim()).filter(Boolean)
              
              for (const jsonStr of jsonLines) {
                // Try to complete incomplete JSON from previous chunk
                const completeStr = incompleteJson + jsonStr
                
                try {
                  const json = JSON.parse(completeStr)
                  // eslint-disable-next-line no-console
                  console.log(`[UPLOAD] ✅ Step ${json.step ?? '?'} parsed:`, json)
                  pushDebugEvent?.({ ts: Date.now(), from: 'upload', raw: completeStr, json, step: json.step, status: json.status })
                  // Success! Clear incomplete buffer
                  incompleteJson = ""
                
                if (typeof json.step === "number" && typeof json.status === "string") {
                  const now = Date.now()
                  if (lastStep > 0 && json.step > lastStep) {
                    maybeFinishStep(lastStep, now)
                  }
                  if (!stepStart[json.step]) stepStart[json.step] = now
                  lastStep = Math.max(lastStep, json.step)
                  const doneHints = ["done", "completed", "finished"]
                  const lower = String(json.status).toLowerCase()
                  const isExplicitDone = Boolean(json.finished) || doneHints.some((h) => lower.includes(h))
                  setStreamSteps((prev) => [
                    ...prev.filter((s) => s.step !== json.step),
                    { step: json.step, status: json.status, startedAt: stepStart[json.step] },
                  ])
                  if (isExplicitDone) {
                    maybeFinishStep(json.step, now)
                  }
                }
                if (json.details) {
                  // eslint-disable-next-line no-console
                  console.log('[UPLOAD] 📊 Processing details (step 5 metrics):', json.details)
                  try {
                    const d = Array.isArray(json.details) ? json.details[0] : json.details
                    const toNum = (v:any) => {
                      const n = typeof v === 'number' ? v : Number(v)
                      return Number.isFinite(n) ? n : undefined
                    }
                    const kfold = Array.isArray(d?.fold_metrics) ? d.fold_metrics.map((m:any)=>({
                      fold: Number(m.fold) || 0,
                      accuracy: toNum(m.accuracy),
                      precision: toNum(m.precision),
                      recall: toNum(m.recall),
                      f1: toNum(m.f1_score ?? m.f1)
                    })) : []
                    // Parse confusion matrices (test and blind)
                    const parseCM = (cm:any) => {
                      if (!cm) return undefined
                      const order = ["CONFIRMED","CANDIDATE","FALSE POSITIVE"]
                      const mat = order.map((r)=> order.map((c)=> Number(cm?.[r]?.[c]) || 0))
                      return mat
                    }
                    const testAcc = toNum(d?.test_metrics?.accuracy)
                    const blindAcc = toNum(d?.blind_metrics?.accuracy)
                    const testF1 = toNum(d?.test_metrics?.f1_score ?? d?.test_metrics?.f1)
                    const blindF1 = toNum(d?.blind_metrics?.f1_score ?? d?.blind_metrics?.f1)
                    const testPrecision = toNum(d?.test_metrics?.precision)
                    const testRecall = toNum(d?.test_metrics?.recall)
                    const blindPrecision = toNum(d?.blind_metrics?.precision)
                    const blindRecall = toNum(d?.blind_metrics?.recall)
                    const testCM = parseCM(d?.test_metrics?.confusion_matrix)
                    const blindCM = parseCM(d?.blind_metrics?.confusion_matrix)
                    const trainingTimeSec = toNum(d?.Training_Test_Total_Time)
                    // eslint-disable-next-line no-console
                    console.log('[UPLOAD] 📊 Parsed metrics:', {
                      n_features: d?.n_features,
                      Training_Test_Total_Time: trainingTimeSec,
                      testAcc, blindAcc, testF1, blindF1,
                      testPrecision, testRecall, blindPrecision, blindRecall,
                      kFoldCount: kfold.length,
                      testCM: testCM?.length, blindCM: blindCM?.length
                    })
                    setResearchMetrics((prev)=>({
                      ...prev,
                      numFeatures: toNum(d?.n_features) ?? prev.numFeatures,
                      totalTrainingTimeMs: trainingTimeSec ? trainingTimeSec * 1000 : prev.totalTrainingTimeMs,
                      kFoldMetrics: kfold.length ? kfold : prev.kFoldMetrics,
                      testAccuracy: testAcc ?? prev.testAccuracy,
                      blindTestAccuracy: blindAcc ?? prev.blindTestAccuracy,
                      testF1: testF1 ?? prev.testF1,
                      blindTestF1: blindF1 ?? prev.blindTestF1,
                      testPrecision: testPrecision ?? prev.testPrecision,
                      testRecall: testRecall ?? prev.testRecall,
                      blindPrecision: blindPrecision ?? prev.blindPrecision,
                      blindRecall: blindRecall ?? prev.blindRecall,
                      testConfusionMatrix: testCM ?? prev.testConfusionMatrix,
                      blindTestConfusionMatrix: blindCM ?? prev.blindTestConfusionMatrix,
                      labels: ["Confirmado","Candidato","Falso Positivo"],
                    }))
                  } catch (err) {
                    // eslint-disable-next-line no-console
                    console.error('[UPLOAD] ❌ Error parsing metrics:', err)
                  }
                }
                if (Array.isArray(json.predictions)) {
                  // eslint-disable-next-line no-console
                  console.log('[UPLOAD] ✅ Received predictions array:', json.predictions.length, 'items')
                  // eslint-disable-next-line no-console
                  console.log('[UPLOAD] First prediction pair:', json.predictions[0])
                  // eslint-disable-next-line no-console
                  console.log('[UPLOAD] Setting streamPredictions with array of length:', json.predictions.length)
                  // Store the raw predictions array directly (don't flatten yet)
                  setStreamPredictions(json.predictions as any[])
                  // eslint-disable-next-line no-console
                  console.log('[UPLOAD] ✅ streamPredictions has been set!')
                  setIsProcessing(false)
                  // finalize the last seen step to keep pipeline summary consistent
                  try { if (lastStep > 0) maybeFinishStep(lastStep, Date.now()) } catch {}
                }
                } catch (e: any) {
                  // Check if it's an incomplete JSON (will be completed in next chunk)
                  if (e.message?.includes('Unexpected end of JSON') || e.message?.includes('Unterminated string')) {
                    // eslint-disable-next-line no-console
                    console.log('[UPLOAD] 📦 Incomplete JSON detected, buffering...', completeStr.substring(0, 80))
                    incompleteJson = completeStr
                  } else {
                    // Real parse error - ignore fragment
                    // eslint-disable-next-line no-console
                    console.warn('[UPLOAD] ⚠️ Skipping invalid fragment:', e.message, completeStr.substring(0, 50))
                    incompleteJson = "" // Reset on real errors
                  }
                }
              } // end for jsonLines
              await new Promise((r) => setTimeout(r, 0))
            } // end for parts
          } // end while
          // finalize last step
          if (lastStep > 0) {
            maybeFinishStep(lastStep, Date.now())
          }
          // eslint-disable-next-line no-console
          console.log("Streaming finished")
          if(lastStep === 2) {
            console.log("Finish in 2 - Invalid file format")
            setStreamSteps((prev) => [
                    ...prev,
                    { step: 400, status: "CSV file may not be valid for this model", startedAt: Date.now(), durationMs: 0}
                  ])
            setIsProcessing(false)
            return
           }
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

  // Detect if there are results (either prediction or streamPredictions)
  const hasResults = prediction !== null || (streamPredictions && streamPredictions.length > 0)
  
  // Handle new classification - reset all states
  const handleNewClassification = () => {
    // Reset local states
    setUploadedData(null)
    setManualRaw(null)
    setActiveStep("dataset")
    setInputTab("manual")
    
    // Reset global states
    setIsProcessing(false)
    setPrediction(null)
    setStreamSteps([])
    setStreamPredictions([])
    setRunMeta(null)
    setResearchMetrics({
      testAccuracy: 0,
      testF1: 0,
      testPrecision: 0,
      testRecall: 0,
      blindTestAccuracy: 0,
      blindTestF1: 0,
      blindPrecision: 0,
      blindRecall: 0,
      totalTrainingTimeMs: 0,
      numFeatures: 0,
      kFoldMetrics: [],
      testConfusionMatrix: undefined,
      blindTestConfusionMatrix: undefined,
      labels: []
    })
    
    // Reset form if it exists
    const targetFormId = mode === "explorer" ? "explorer-data-form" : "researcher-data-form"
    const form = document.getElementById(targetFormId) as HTMLFormElement | null
    form?.reset()
  }

  return (
    <section id="data" className="scroll-mt-20">
      <Card className="gradient-border bg-card/50 backdrop-blur-sm relative">
        {/* Overlay with blur when results exist */}
        {hasResults && !isProcessing && (
          <div className="absolute inset-0 z-10 bg-background/80 backdrop-blur-md rounded-xl flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-6 p-8 max-w-md mx-auto"
            >
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 border-2 border-primary/30 shadow-lg">
                <Sparkles className="h-10 w-10 text-primary animate-pulse" />
              </div>
              
              <div className="space-y-2">
                <h3 className="text-2xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                  Classification Complete!
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Your results are ready below. Start a new classification to analyze more data.
                </p>
              </div>

              <Button
                size="lg"
                onClick={handleNewClassification}
                className="gap-2 bg-gradient-to-r from-primary via-accent to-secondary hover:opacity-90 shadow-lg glow-effect"
              >
                <RotateCcw className="h-5 w-5" />
                New Classification
              </Button>

              <p className="text-xs text-muted-foreground">
                This will reset all inputs and clear current results
              </p>
            </motion.div>
          </div>
        )}

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
                      hyperparameters={hyperparams}
                      onChangeRaw={setManualRaw}
              />
            </TabsContent>

            <TabsContent value="upload" className="mt-6">
                    <FileUpload 
                      onDataUploaded={setUploadedData} 
                      dataset={dataset} 
                      hyperparameters={hyperparams}
                    />
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
                  {/* Toggle banner controlling hyperparams usage */}
                  <div className="flex items-center justify-between p-3 border rounded-xl bg-card/60">
                    <div className="text-sm">
                      <div className="font-medium">Include hyperparameters in requests</div>
                      <div className="text-muted-foreground text-xs">When disabled, the hyperparameters tab becomes unavailable and is not sent to the backend.</div>
                    </div>
                    <Switch checked={useHyperparams} onCheckedChange={setUseHyperparams as any} />
                  </div>

                  <Tabs defaultValue="architecture" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="architecture" className="flex items-center gap-2">
                        Architecture
                      </TabsTrigger>
                      <TabsTrigger value="hyperparams" className="flex items-center gap-2" disabled={!useHyperparams}>
                        Hiperparâmetros
                      </TabsTrigger>
                    </TabsList>
                    <TabsContent value="architecture" className="mt-4 space-y-3">
                      <div className="grid grid-cols-1 gap-3">
                        {/* Dataset Splitting */}
                        <div className="p-3 border border-blue-500/30 rounded-lg bg-blue-500/5">
                          <h4 className="font-semibold mb-2 flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                            Dataset Splitting: 70% / 20% / 10%
                          </h4>
                          <p className="text-xs text-muted-foreground leading-relaxed mb-2">
                            <span className="font-medium text-foreground">Training (70%):</span> Model learning phase • 
                            <span className="font-medium text-foreground"> Test (20%):</span> Performance evaluation • 
                            <span className="font-medium text-foreground"> Blind Validation (10%):</span> Unbiased generalization test
                          </p>
                          <p className="text-xs text-emerald-600 dark:text-emerald-400 leading-relaxed">
                            ✓ Prevents data leakage • Ensures robust evaluation • Industry standard for scientific ML
                          </p>
                        </div>

                        {/* Overfitting Prevention */}
                        <div className="p-3 border border-purple-500/30 rounded-lg bg-purple-500/5">
                          <h4 className="font-semibold mb-2 flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-purple-500"></div>
                            StratifiedKFold Cross-Validation (K=5)
                          </h4>
                          <p className="text-xs text-muted-foreground leading-relaxed mb-2">
                            5-fold cross-validation with stratified sampling to maintain class distribution across all folds. Test partition evaluated separately from training folds.
                          </p>
                          <p className="text-xs text-emerald-600 dark:text-emerald-400 leading-relaxed">
                            ✓ Detects overfitting early • Validates model stability • Maximizes training data usage • Preserves class balance
                          </p>
                        </div>

                        {/* XGBoost Models */}
                        <div className="p-3 border border-amber-500/30 rounded-lg bg-amber-500/5">
                          <h4 className="font-semibold mb-2 flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-amber-500"></div>
                            XGBoost Ensemble Models
                          </h4>
                          <div className="space-y-2 text-xs text-muted-foreground leading-relaxed">
                            <div>
                              <span className="font-medium text-foreground">Version 1 (Baseline):</span>
                              <code className="ml-1 text-[10px] bg-muted px-1 py-0.5 rounded">XGBClassifier(eval_metric='mlogloss', objective='multi:softprob')</code>
                            </div>
                            <div>
                              <span className="font-medium text-foreground">Version 2 (Tuned):</span>
                              <code className="ml-1 text-[10px] bg-muted px-1 py-0.5 rounded">colsample_bytree=0.8, learning_rate=0.1, max_depth=6, n_estimators=100, subsample=0.8</code>
                            </div>
                          </div>
                          <p className="text-xs text-emerald-600 dark:text-emerald-400 leading-relaxed mt-2">
                            ✓ Gradient boosting handles non-linear patterns • Robust to outliers • Fast inference • Proven for tabular astronomical data
                          </p>
                        </div>

                        {/* Feature Selection */}
                        <div className="p-3 border border-cyan-500/30 rounded-lg bg-cyan-500/5">
                          <h4 className="font-semibold mb-2 flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-cyan-500"></div>
                            Intelligent Feature Selection
                          </h4>
                          <p className="text-xs text-muted-foreground leading-relaxed mb-2">
                            Analysis identifies the <span className="font-medium text-foreground">top 10 most important features</span> during training. Model performance compared at <span className="font-medium text-foreground">90%, 95%, and 99%</span> feature thresholds using test and blind validation metrics.
                          </p>
                          <p className="text-xs text-emerald-600 dark:text-emerald-400 leading-relaxed">
                            ✓ Reduces dimensionality • Prevents curse of dimensionality • Improves interpretability • Faster inference
                          </p>
                        </div>

                        {/* Comprehensive Evaluation */}
                        <div className="p-3 border border-rose-500/30 rounded-lg bg-rose-500/5">
                          <h4 className="font-semibold mb-2 flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-rose-500"></div>
                            Multi-Metric Evaluation Framework
                          </h4>
                          <p className="text-xs text-muted-foreground leading-relaxed mb-2">
                            Classification Report includes: <span className="font-medium text-foreground">Accuracy, Precision, Recall, F1-Score, Macro-Avg, Weighted-Avg</span>. Evaluated on both test partition and blind validation set.
                          </p>
                          <p className="text-xs text-emerald-600 dark:text-emerald-400 leading-relaxed">
                            ✓ Balanced view of performance • Detects class imbalance issues • Standard for scientific publication • Enables fair model comparison
                          </p>
                        </div>

                        {/* Grid Search Optimization */}
                        <div className="p-3 border border-emerald-500/30 rounded-lg bg-emerald-500/5">
                          <h4 className="font-semibold mb-2 flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
                            Hyperparameter Optimization via Grid Search CV
                          </h4>
                          <p className="text-xs text-muted-foreground leading-relaxed mb-2">
                            Systematic exploration of hyperparameter space using cross-validation. Applied when appropriate to identify optimal configuration for <span className="font-medium text-foreground">colsample_bytree, learning_rate, max_depth, n_estimators, subsample</span>.
                          </p>
                          <p className="text-xs text-emerald-600 dark:text-emerald-400 leading-relaxed">
                            ✓ Data-driven optimization • Avoids manual tuning bias • Reproducible methodology • Maximizes predictive performance
                          </p>
                        </div>
                      </div>

                      {/* Why This Architecture Is Effective */}
                      <div className="mt-4 p-4 border-2 border-primary/20 rounded-lg bg-gradient-to-br from-primary/5 to-accent/5">
                        <h4 className="font-semibold mb-3 flex items-center gap-2 text-primary">
                          <Rocket className="h-4 w-4" />
                          Why This Architecture Is Effective
                        </h4>
                        <div className="space-y-2 text-xs text-muted-foreground leading-relaxed">
                          <p>
                            <span className="font-medium text-foreground">🔬 Scientific Rigor:</span> Blind validation ensures unbiased performance estimates, critical for publishable research and real-world deployment confidence.
                          </p>
                          <p>
                            <span className="font-medium text-foreground">⚖️ Class Balance Preservation:</span> StratifiedKFold maintains the proportion of confirmed/candidate/false-positive across folds, preventing model bias toward majority classes.
                          </p>
                          <p>
                            <span className="font-medium text-foreground">🎯 Exoplanet Domain Fit:</span> XGBoost excels at capturing non-linear interactions in tabular astronomical features (orbital periods, stellar parameters, transit depths) without requiring massive datasets.
                          </p>
                          <p>
                            <span className="font-medium text-foreground">🚀 Computational Efficiency:</span> Feature selection (top 10) and optimized hyperparameters enable real-time inference while maintaining 92%+ accuracy, crucial for large-scale survey processing.
                          </p>
                          <p>
                            <span className="font-medium text-foreground">🔁 Reproducibility:</span> Explicit train/test/blind splits + Grid Search CV + version-controlled models ensure experiments can be replicated by other researchers.
                          </p>
                        </div>
                      </div>

                      {/* Configuration Summary */}
                      <div className="mt-4 p-4 bg-muted/50 rounded-lg border border-border">
                        <h4 className="text-sm font-medium mb-3">Current Hyperparameters Configuration</h4>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                          <div><span className="text-muted-foreground">Eval metric:</span> <span className="font-mono font-medium">{hyperparams.eval_metric}</span></div>
                          <div><span className="text-muted-foreground">Objective:</span> <span className="font-mono font-medium">{hyperparams.objective}</span></div>
                          <div><span className="text-muted-foreground">Trees:</span> <span className="font-mono font-medium">{hyperparams.n_estimators}</span></div>
                          <div><span className="text-muted-foreground">Max depth:</span> <span className="font-mono font-medium">{hyperparams.max_depth}</span></div>
                          <div><span className="text-muted-foreground">LR:</span> <span className="font-mono font-medium">{hyperparams.learning_rate}</span></div>
                          <div><span className="text-muted-foreground">Subsample:</span> <span className="font-mono font-medium">{hyperparams.subsample}</span></div>
                        </div>
                      </div>
                    </TabsContent>
                    <TabsContent value="hyperparams" className="mt-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6">
                        <div className="space-y-3">
                          <Label htmlFor="eval_metric" className="text-sm font-medium">Evaluation Metric</Label>
                          <Input id="eval_metric" value={hyperparams.eval_metric} onChange={(e) => setHyperparams((p) => ({ ...p, eval_metric: e.target.value }))} />
                        </div>
                        <div className="space-y-3">
                          <Label htmlFor="objective" className="text-sm font-medium">Model Objective</Label>
                          <Input id="objective" value={hyperparams.objective} onChange={(e) => setHyperparams((p) => ({ ...p, objective: e.target.value }))} />
                        </div>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="colsample_bytree" className="text-sm font-medium">Column Sample by Tree</Label>
                            <span className="text-sm font-mono text-primary">{hyperparams.colsample_bytree.toFixed(2)}</span>
                          </div>
                          <Slider id="colsample_bytree" min={0.1} max={1} step={0.05} value={[hyperparams.colsample_bytree]} onValueChange={(v) => setHyperparams((p) => ({ ...p, colsample_bytree: v[0] }))} className="w-full" />
                          <div className="flex justify-between text-xs text-muted-foreground"><span>0.1</span><span>1.0</span></div>
                        </div>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="learning_rate" className="text-sm font-medium">Learning Rate</Label>
                            <span className="text-sm font-mono text-primary">{hyperparams.learning_rate.toFixed(3)}</span>
                          </div>
                          <Slider id="learning_rate" min={0.01} max={0.5} step={0.01} value={[hyperparams.learning_rate]} onValueChange={(v) => setHyperparams((p) => ({ ...p, learning_rate: v[0] }))} className="w-full" />
                          <div className="flex justify-between text-xs text-muted-foreground"><span>0.01</span><span>0.5</span></div>
                        </div>
                        <div className="space-y-3">
                          <Label htmlFor="max_depth" className="text-sm font-medium">Maximum Depth</Label>
                          <Input id="max_depth" type="number" min={1} max={32} step={1} value={hyperparams.max_depth} onChange={(e) => setHyperparams((p) => ({ ...p, max_depth: Number(e.target.value) }))} />
                        </div>
                        <div className="space-y-3">
                          <Label htmlFor="n_estimators" className="text-sm font-medium">Number of Trees</Label>
                          <Input id="n_estimators" type="number" min={10} max={2000} step={10} value={hyperparams.n_estimators} onChange={(e) => setHyperparams((p) => ({ ...p, n_estimators: Number(e.target.value) }))} />
                        </div>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="subsample" className="text-sm font-medium">Sample Ratio per Tree</Label>
                            <span className="text-sm font-mono text-primary">{hyperparams.subsample.toFixed(2)}</span>
                          </div>
                          <Slider id="subsample" min={0.1} max={1} step={0.05} value={[hyperparams.subsample]} onValueChange={(v) => setHyperparams((p) => ({ ...p, subsample: v[0] }))} className="w-full" />
                          <div className="flex justify-between text-xs text-muted-foreground"><span>0.1</span><span>1.0</span></div>
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
