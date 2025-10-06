"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Sparkles, Loader2, CheckCircle2, AlertCircle, Info, Zap } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useMode } from "@/lib/mode-context"
import { usePlanetData } from "@/lib/planet-data-context"
import { motion } from "framer-motion"
import { getDatasetFields, type DatasetKey } from "@/lib/dataset-fields"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface PredictionResult {
  classification: "Confirmado" | "Candidato" | "Falso Positivo"
  probability: number
  confidence: "Alta" | "Média" | "Baixa"
}

export function ManualDataForm({ showSubmit = true, formId = "data-input-form", dataset = "kepler", onChangeRaw, hyperparameters }: { showSubmit?: boolean; formId?: string; dataset?: "kepler" | "k2" | "tess"; onChangeRaw?: (raw: any) => void; hyperparameters?: any }) {
  const { mode } = useMode()
  const { planetData, setPlanetData, prediction, setPrediction, setIsProcessing, setStreamSteps, setStreamPredictions, setRunMeta, useHyperparams, setResearchMetrics } = usePlanetData()
  const { pushDebugEvent } = usePlanetData() as any

  const [formData, setFormData] = useState<Record<string, string>>({})

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    // Prefill required defaults (e.g., K2 soltype)
    const defs = getDatasetFields(dataset as DatasetKey)
    const initial: Record<string, string> = {}
    defs.forEach((d) => {
      if (d.defaultValue !== undefined) initial[d.key] = String(d.defaultValue)
    })
    setFormData(initial)
  }, [dataset])

  const loadExampleData = () => {
    const defs = getDatasetFields(dataset as DatasetKey)
    const sample: Record<string, string > = {}
    defs.forEach((d) => {
      if (d.exampleValue) sample[d.key] = d.exampleValue
    })
    setFormData(sample)
  }

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (prediction) setPrediction(null)
    if (onChangeRaw) {
      onChangeRaw({ ...formData, [field]: value })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setRunMeta({ inputKind: 'manual', hasHyperparams: mode === 'researcher' })
    setIsProcessing(true)
    // scroll to pipeline section smoothly if present

    try {
      const defs = getDatasetFields(dataset as DatasetKey)
      const payloadData: Record<string, number | string> = {}
      const errors: string[] = []
      const perField: Record<string, string> = {}

      const coerceInt = (v: string) => Number.parseInt(v, 10)

      defs.forEach((d) => {
        const raw = formData[d.key]
        const valueToUse = (raw === undefined || raw === "") && d.defaultValue !== undefined ? String(d.defaultValue) : raw

        console.log("fields", d)
        // Required validation ("" invalid, but 0 is valid)
        if (d.required && (
            valueToUse === null ||
            valueToUse === undefined ||
            valueToUse === '' ||
            valueToUse.length === 0)) {
          errors.push(`${d.name} (${d.key}) is mandatory`)
          perField[d.key] = "Mandatory"
          return
        }

        if (d.min && (Number(d.min) > Number(valueToUse)) || d.max && (Number(d.max) < Number(valueToUse))) {
          errors.push(`${d.name} (${d.key}) value must be between ${d.min} and ${d.max}`)
          perField[d.key] = `value must be between ${d.min} and ${d.max}`
          return
        }

        if (valueToUse === undefined || valueToUse === "") return

        if (d.type === "int") {
          const n = coerceInt(valueToUse)
          if (!Number.isFinite(n) || !Number.isInteger(n)) {
            errors.push(`${d.name} must be integer`)
            perField[d.key] = "Invalid integer"
            return
          }
          payloadData[d.key] = n
        } else {
          // string
          if (dataset === "k2" && d.key === "soltype") {
            const allowed = ["Published Confirmed", "Published Candidate", "TESS Project Candidate"]
            if (!allowed.includes(String(valueToUse))) {
              errors.push(`${d.name} has invalid value`)
              perField[d.key] = "Invalid value"
              return
            }
          }
          payloadData[d.key] = String(valueToUse)
        }
      })

      if (errors.length > 0) {
        setError(errors.join("; "))
        setFieldErrors(perField)
        setIsLoading(false)
        setIsProcessing(false)
        return
      }
      setFieldErrors({})
      setPlanetData({})

      const consolePayload = {
        mode,
        dataset,
        data: payloadData,
      }
      // eslint-disable-next-line no-console
      console.log("CLASSIFY_JSON", consolePayload)

      // Include hyperparameters ONLY in researcher mode
      const defaultHyper = {
        eval_metric: "mlogloss",
        objective: "multi:softprob",
        colsample_bytree: 0.8,
        learning_rate: 0.1,
        max_depth: 4,
        n_estimators: 300,
        subsample: 0.8,
      }
      const finalHyper = { ...defaultHyper, ...(hyperparameters || {}) }
      const requestBody = (mode === "researcher" && useHyperparams)
        ? { ...consolePayload, hyperparameters: finalHyper }
        : consolePayload
      // eslint-disable-next-line no-console
      console.log("STREAM_REQUEST_BODY", requestBody)

      // Prepare streaming state like upload flow
      const stepStart: Record<number, number> = {}
      let lastStep = 0
      setStreamSteps([])
      setStreamPredictions([])
      // Seed Step 1 immediately for better feedback
      stepStart[1] = Date.now()
      setStreamSteps([{ step: 1, status: 'Validating input', startedAt: stepStart[1] }])
      lastStep = 1

      const response = await fetch("https://gote-backend.onrender.com/stream/exoplanet", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "text/event-stream" },
        body: JSON.stringify(requestBody),
      })

      if (!response.ok || !response.body) {
        throw new Error("Streaming request failed")
      }
      // Handle SSE-like streamed progress (reuse pattern from upload path)
      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ""
      let jsonBuffer = "" // Buffer for incomplete JSON objects
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

      // Track last activity timestamp to detect timeouts
      let lastActivityTime = Date.now()
      const timeoutWarningMs = 30000 // Warn if no activity for 30s
      
      while (true) {
        document.querySelector(`#pipeline-${mode}`)?.scrollIntoView({ behavior: 'smooth'})
        const { done, value } = await reader.read()
        
        const now = Date.now()
        const timeSinceLastActivity = now - lastActivityTime
        
        // eslint-disable-next-line no-console
        console.log('[manual-data-form] Stream chunk received, done:', done, 'bytes:', value?.length ?? 0, 'idle:', (timeSinceLastActivity / 1000).toFixed(1) + 's')
        
        if (value && value.length > 0) {
          lastActivityTime = now
        }
        
        if (done) {
          // eslint-disable-next-line no-console
          console.log('[manual-data-form] ✅ Stream completed normally')
          break
        }
        
        // Warn if stream seems stuck
        if (timeSinceLastActivity > timeoutWarningMs) {
          // eslint-disable-next-line no-console
          console.warn('[manual-data-form] ⚠️ Stream idle for', (timeSinceLastActivity / 1000).toFixed(0) + 's', '- server may be processing or timed out')
        }
        
        buffer += decoder.decode(value, { stream: true })
        const parts = buffer.split("\n\n")
        buffer = parts.pop() || ""
        
        // eslint-disable-next-line no-console
        console.log('[manual-data-form] Processing', parts.length, 'SSE events')
        
        for (const raw of parts) {
          if (!raw.trim()) continue
          
          // Skip "end of stream" marker
          if (raw.trim() === 'end of stream') {
            // eslint-disable-next-line no-console
            console.log('[manual-data-form] Received end of stream marker')
            continue
          }
          
          // Extract all data: lines from this SSE event
          const lines = raw.split("\n").filter(l => l.trim().startsWith("data:"))
          if (lines.length === 0) continue
          
          // Concatenate all data lines to form payload (may be incomplete JSON)
          const payload = lines.map(l => l.replace(/^data:\s*/, "").trim()).join("")
          
          if (!payload) continue
          
          // Accumulate in jsonBuffer
          jsonBuffer += payload
          
          // Try to parse the accumulated JSON
          try {
            const json = JSON.parse(jsonBuffer)
            // Successfully parsed! Clear buffer and process
            // eslint-disable-next-line no-console
            console.log("STREAM_MANUAL [parsed]:", json)
            
            // Clear buffer after successful parse
            jsonBuffer = ""
            
            pushDebugEvent?.({ ts: Date.now(), from: 'manual', raw: payload, json, step: json.step, status: json.status })
            
            // Process step info
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
            
            // Process details (training metrics)
            if (json.details) {
              try {
                const d = Array.isArray(json.details) ? json.details[0] : json.details
                const toNum = (v:any) => {
                  const n = typeof v === 'number' ? v : Number(v)
                  return Number.isFinite(n) ? n : undefined
                }
                
                // Parse k-fold metrics
                const kfold = Array.isArray(d?.fold_metrics) ? d.fold_metrics.map((m:any)=>({
                  fold: Number(m.fold) || 0,
                  accuracy: toNum(m.accuracy),
                  precision: toNum(m.precision),
                  recall: toNum(m.recall),
                  f1: toNum(m.f1_score ?? m.f1)
                })) : []
                
                // Parse confusion matrix from object to array format
                const parseConfusionMatrix = (cm: any) => {
                  if (!cm) return undefined
                  const labels = ['CANDIDATE', 'CONFIRMED', 'FALSE POSITIVE']
                  return labels.map(label => 
                    labels.map(predictedLabel => cm[label]?.[predictedLabel] ?? 0)
                  )
                }
                
                // Extract test metrics
                const testMetrics = d?.test_metrics
                const blindMetrics = d?.blind_metrics
                
                // Log raw values for debugging
                // eslint-disable-next-line no-console
                console.log('[manual-data-form] 🔍 Raw values:', {
                  Training_Test_Total_Time: d?.Training_Test_Total_Time,
                  blindMetrics_accuracy: blindMetrics?.accuracy,
                  blindMetrics_f1: blindMetrics?.f1_score,
                  blindMetrics_precision: blindMetrics?.precision,
                  blindMetrics_recall: blindMetrics?.recall
                })
                
                // Process training time (comes in seconds, convert to ms)
                const trainingTimeS = toNum(d?.Training_Test_Total_Time)
                const trainingTimeMs = trainingTimeS ? trainingTimeS * 1000 : undefined
                
                const newMetrics = {
                  ...prev,
                  numFeatures: toNum(d?.n_features) ?? prev.numFeatures,
                  totalTrainingTimeMs: trainingTimeMs ?? prev.totalTrainingTimeMs,
                  kFoldMetrics: kfold.length ? kfold : prev.kFoldMetrics,
                  
                  // Test metrics
                  testAccuracy: toNum(testMetrics?.accuracy) ?? prev.testAccuracy,
                  testF1: toNum(testMetrics?.f1_score) ?? prev.testF1,
                  testPrecision: toNum(testMetrics?.precision) ?? prev.testPrecision,
                  testRecall: toNum(testMetrics?.recall) ?? prev.testRecall,
                  testConfusionMatrix: parseConfusionMatrix(testMetrics?.confusion_matrix) ?? prev.testConfusionMatrix,
                  
                  // Blind test metrics - must match dashboard field names exactly
                  blindTestAccuracy: toNum(blindMetrics?.accuracy) ?? prev.blindTestAccuracy,
                  blindTestF1: toNum(blindMetrics?.f1_score) ?? prev.blindTestF1,
                  blindPrecision: toNum(blindMetrics?.precision) ?? prev.blindPrecision,
                  blindRecall: toNum(blindMetrics?.recall) ?? prev.blindRecall,
                  blindTestConfusionMatrix: parseConfusionMatrix(blindMetrics?.confusion_matrix) ?? prev.blindTestConfusionMatrix,
                  
                  // Labels
                  labels: ['Candidate', 'Confirmed', 'False Positive']
                }
                
                // eslint-disable-next-line no-console
                console.log('[manual-data-form] 📊 Parsed research metrics:', newMetrics)
                // eslint-disable-next-line no-console
                console.log('[manual-data-form] ✅ Key metrics extracted:', {
                  totalTrainingTimeMs: newMetrics.totalTrainingTimeMs,
                  blindTestAccuracy: newMetrics.blindTestAccuracy,
                  blindTestF1: newMetrics.blindTestF1,
                  blindPrecision: newMetrics.blindPrecision,
                  blindRecall: newMetrics.blindRecall
                })
                
                setResearchMetrics(newMetrics)
              } catch (err) {
                // eslint-disable-next-line no-console
                console.warn('[manual-data-form] Failed to parse details:', err)
              }
            }
            
            // Process predictions
            if (Array.isArray(json.predictions)) {
              const preds:any[] = Array.isArray(json.predictions[0]) ? (json.predictions as any[]).flat() : (json.predictions as any[])
              setStreamPredictions(preds)
            }
            if (json.prediction) {
              setPrediction(json.prediction as any)
            }
          } catch (parseError) {
            // JSON is incomplete, keep accumulating in jsonBuffer
            // Only log if buffer is getting suspiciously large
            if (jsonBuffer.length > 10000) {
              // eslint-disable-next-line no-console
              console.warn('[manual-data-form] JSON buffer very large:', jsonBuffer.length, 'bytes - may indicate parsing issue')
            }
          }
          
          await new Promise((r) => setTimeout(r, 0))
        }
      }
      
      // eslint-disable-next-line no-console
      console.log('[manual-data-form] 🏁 Stream loop finished, lastStep:', lastStep)
      
      if (lastStep > 0) {
        maybeFinishStep(lastStep, Date.now())
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('[manual-data-form] ❌ Error during stream processing:', err)
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      // eslint-disable-next-line no-console
      console.log('[manual-data-form] 🔚 Cleanup: isLoading=false, isProcessing=false')
      setIsLoading(false)
      setIsProcessing(false)
    }
  }

  const getClassificationColor = (classification: string) => {
    switch (classification) {
      case "Confirmed":
        return "bg-green-500/10 text-green-500 border-green-500/20"
      case "Candidate":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20"
      case "False Positive":
        return "bg-red-500/10 text-red-500 border-red-500/20"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case "High":
        return "text-green-500"
      case "Medium":
        return "text-blue-500"
      case "Low":
        return "text-red-500"
      default:
        return "text-muted-foreground"
    }
  }

  return (
    <form id={formId} onSubmit={handleSubmit} className="space-y-6">
      {mode === "explorer" && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Alert className="border-primary/30 bg-primary/5">
            <Info className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>
                <strong>How it works:</strong> Enter the observed parameters of the candidate. Our model analyzes these
                data to determine whether it is a real exoplanet or a false positive.
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={loadExampleData}
                className="ml-4 shrink-0 bg-transparent"
              >
                <Zap className="h-3 w-3 mr-1" />
                Example
              </Button>
            </AlertDescription>
          </Alert>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {getDatasetFields(dataset as DatasetKey).map((def, index) => (
          <motion.div
            key={def.key}
            initial={mode === "explorer" ? { opacity: 0, y: 20 } : false}
            animate={mode === "explorer" ? { opacity: 1, y: 0 } : false}
            transition={mode === "explorer" ? { delay: 0.1 + index * 0.05 } : undefined}
            className="space-y-2"
          >
            <div className="flex items-center gap-2">
              <Label htmlFor={def.key} className="text-sm font-medium">
                {def.name} {def.required && "*"}
              </Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-3.5 w-3.5 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs text-xs">{def.description}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div className="relative">
              {def.type === "string" ? (
                dataset === "k2" && def.key === "soltype" ? (
                  <Select value={formData[def.key] || undefined} onValueChange={(v) => handleChange(def.key, v)}>
                    <SelectTrigger id={def.key}>
                      <SelectValue placeholder={def.placeholder || "Select"} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Published Confirmed">Published Confirmed</SelectItem>
                      <SelectItem value="Published Candidate">Published Candidate</SelectItem>
                      <SelectItem value="TESS Project Candidate">TESS Project Candidate</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    id={def.key}
                    type="text"
                    placeholder={def.placeholder}
                    value={formData[def.key] || ""}
                    onChange={(e) => handleChange(def.key, e.target.value)}
                    required={def.required}
                  />
                )
              ) : (
                <Input
                  id={def.key}
                  type="number"
                  step={def.type === "int" ? "1" : "0.01"}
                  placeholder={def.placeholder}
                  value={formData[def.key] || ""}
                  onChange={(e) => handleChange(def.key, e.target.value)}
                  required={def.required}
                />
              )}
              {fieldErrors[def.key] && (
                <div className="absolute -bottom-4 left-0 text-[10px] text-destructive">{fieldErrors[def.key]}</div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {showSubmit && (
        <div className="flex justify-center pt-4">
          <Button type="submit" size="lg" className="gap-2 glow-effect" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Classifying...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                {mode === "explorer" ? "Discover if it's an Exoplanet" : "Classify Exoplanet"}
              </>
            )}
          </Button>
        </div>
      )}

      {/*
      {prediction && (
        <div className="mt-8 p-6 border border-primary/30 rounded-xl bg-primary/5 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle2 className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">Resultado da Classificação</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-card border border-border rounded-lg">
              <div className="text-sm text-muted-foreground mb-2">Classificação</div>
              <Badge
                variant="outline"
                className={`text-base px-3 py-1 ${getClassificationColor(prediction.classification)}`}
              >
                {prediction.classification}
              </Badge>
            </div>

            <div className="p-4 bg-card border border-border rounded-lg">
              <div className="text-sm text-muted-foreground mb-2">Probabilidade</div>
              <div className="text-2xl font-bold font-mono text-primary">{prediction.probability.toFixed(1)}%</div>
            </div>

            <div className="p-4 bg-card border border-border rounded-lg">
              <div className="text-sm text-muted-foreground mb-2">Confiança</div>
              <div className={`text-2xl font-bold ${getConfidenceColor(prediction.confidence)}`}>
                {prediction.confidence}
              </div>
            </div>
          </div>

          <Alert className="border-primary/30 bg-primary/5">
            <Info className="h-4 w-4" />
            <AlertDescription>
              {prediction.classification === "Confirmado" &&
                (mode === "explorer"
                  ? "Parabéns! Este objeto tem características muito consistentes com um exoplaneta real. Ele passou em todos os testes do nosso modelo de IA."
                  : "Este objeto apresenta características consistentes com um exoplaneta confirmado. Recomenda-se observações de acompanhamento.")}
              {prediction.classification === "Candidato" &&
                (mode === "explorer"
                  ? "Interessante! Este objeto pode ser um exoplaneta, mas precisamos de mais dados para ter certeza. É um candidato promissor."
                  : "Este objeto é um candidato promissor, mas requer validação adicional através de vetting manual ou observações complementares.")}
              {prediction.classification === "Falso Positivo" &&
                (mode === "explorer"
                  ? "Este objeto provavelmente não é um exoplaneta. Pode ser outra coisa, como duas estrelas orbitando uma à outra ou um erro de medição."
                  : "Este objeto provavelmente não é um exoplaneta. Pode ser um eclipse binário, variabilidade estelar ou artefato instrumental.")}
            </AlertDescription>
          </Alert>
        </div>
      )}
      */}
    </form>
  )
}
