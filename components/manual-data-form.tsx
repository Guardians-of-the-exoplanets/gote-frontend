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

interface PredictionResult {
  classification: "Confirmado" | "Candidato" | "Falso Positivo"
  probability: number
  confidence: "Alta" | "Média" | "Baixa"
}

export function ManualDataForm({ showSubmit = true, formId = "data-input-form", dataset = "kepler", onChangeRaw }: { showSubmit?: boolean; formId?: string; dataset?: "kepler" | "k2" | "tess"; onChangeRaw?: (raw: any) => void }) {
  const { mode } = useMode()
  const { planetData, setPlanetData, prediction, setPrediction, setIsProcessing } = usePlanetData()

  const [formData, setFormData] = useState({
    orbitalPeriod: "",
    planetRadius: "",
    equilibriumTemp: "",
    stellarMagnitude: "",
    transitDepth: "",
    transitDuration: "",
    signalToNoise: "",
  })

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (planetData.orbitalPeriod) {
      setFormData({
        orbitalPeriod: planetData.orbitalPeriod?.toString() || "",
        planetRadius: planetData.planetRadius?.toString() || "",
        equilibriumTemp: planetData.equilibriumTemp?.toString() || "",
        stellarMagnitude: planetData.stellarMagnitude?.toString() || "",
        transitDepth: planetData.transitDepth?.toString() || "",
        transitDuration: planetData.transitDuration?.toString() || "",
        signalToNoise: planetData.signalToNoise?.toString() || "",
      })
    }
  }, [])

  const loadExampleData = () => {
    setFormData({
      orbitalPeriod: "10.5",
      planetRadius: "1.2",
      equilibriumTemp: "500",
      stellarMagnitude: "12.0",
      transitDepth: "0.01",
      transitDuration: "3.5",
      signalToNoise: "15.0",
    })
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
    setIsProcessing(true)
    // scroll to pipeline section smoothly if present
    try {
      document.querySelector('#pipeline')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    } catch {}
    setError(null)

    try {
      const numericData = {
        orbitalPeriod: Number.parseFloat(formData.orbitalPeriod) || undefined,
        planetRadius: Number.parseFloat(formData.planetRadius) || undefined,
        equilibriumTemp: Number.parseFloat(formData.equilibriumTemp) || undefined,
        stellarMagnitude: Number.parseFloat(formData.stellarMagnitude) || undefined,
        transitDepth: Number.parseFloat(formData.transitDepth) || undefined,
        transitDuration: Number.parseFloat(formData.transitDuration) || undefined,
        signalToNoise: Number.parseFloat(formData.signalToNoise) || undefined,
        mass: Number.parseFloat(formData.planetRadius)
          ? Math.pow(Number.parseFloat(formData.planetRadius), 2.06)
          : undefined,
        density: Number.parseFloat(formData.planetRadius) ? 5.5 / Number.parseFloat(formData.planetRadius) : undefined,
        stellarFlux: Number.parseFloat(formData.equilibriumTemp)
          ? Math.pow(Number.parseFloat(formData.equilibriumTemp) / 255, 4)
          : undefined,
      }
      setPlanetData(numericData)

      // Console payload for integration
      const consolePayload = {
        mode, // "explorer" | "researcher"
        dataset,
        inputs: numericData,
      }
      // eslint-disable-next-line no-console
      console.log("CLASSIFY_JSON", consolePayload)

      const response = await fetch("/api/classify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Classification failed")
      }

      setPrediction(data.prediction)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsLoading(false)
      setIsProcessing(false)
    }
  }

  const getClassificationColor = (classification: string) => {
    switch (classification) {
      case "Confirmado":
        return "bg-green-500/10 text-green-500 border-green-500/20"
      case "Candidato":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20"
      case "Falso Positivo":
        return "bg-red-500/10 text-red-500 border-red-500/20"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case "Alta":
        return "text-green-500"
      case "Média":
        return "text-blue-500"
      case "Baixa":
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
        {[
          {
            id: "orbitalPeriod",
            label: "Orbital Period",
            required: true,
            unit: "days",
            placeholder: "10.5",
            tooltip:
              mode === "explorer"
                ? "Time the planet takes to complete one orbit around its star (Earth year is 365 days)"
                : "Time the planet takes to complete an orbit",
          },
          {
            id: "planetRadius",
            label: "Planet Radius",
            required: true,
            unit: "R⊕",
            placeholder: "1.2",
            tooltip:
              mode === "explorer"
                ? "Planet size compared to Earth. 1.0 = same as Earth, 2.0 = twice as large"
                : "Planet radius relative to Earth",
          },
          {
            id: "transitDuration",
            label: "Transit Duration",
            required: true,
            unit: "hours",
            placeholder: "3.5",
            tooltip:
              mode === "explorer"
                ? "How long the planet takes to pass in front of the star, blocking part of its light"
                : "Time the planet takes to cross the stellar disk",
          },
          {
            id: "equilibriumTemp",
            label: "Equilibrium Temperature",
            required: false,
            unit: "K",
            placeholder: "500",
            tooltip:
              mode === "explorer"
                ? "Estimated temperature at the planet surface (Earth ~288K or 15°C)"
                : "Estimated surface temperature of the planet",
          },
          {
            id: "stellarMagnitude",
            label: "Stellar Magnitude",
            required: false,
            unit: "",
            placeholder: "12.0",
            tooltip:
              mode === "explorer"
                ? "How bright the star appears from Earth. Lower numbers = brighter"
                : "Apparent brightness of the host star",
          },
          {
            id: "transitDepth",
            label: "Transit Depth",
            required: false,
            unit: "%",
            placeholder: "0.01",
            tooltip:
              mode === "explorer"
                ? "How much the star light drops when the planet transits"
                : "Percent reduction in brightness during transit",
          },
          {
            id: "signalToNoise",
            label: "Signal-to-Noise Ratio",
            required: false,
            unit: "",
            placeholder: "10.0",
            tooltip:
              mode === "explorer"
                ? "Detection quality. Higher values = clearer and more reliable signal"
                : "Detection quality of the transit signal",
          },
        ].map((field, index) => (
          <motion.div
            key={field.id}
            initial={mode === "explorer" ? { opacity: 0, y: 20 } : false}
            animate={mode === "explorer" ? { opacity: 1, y: 0 } : false}
            transition={mode === "explorer" ? { delay: 0.1 + index * 0.05 } : undefined}
            className="space-y-2"
          >
            <div className="flex items-center gap-2">
              <Label htmlFor={field.id} className="text-sm font-medium">
                {field.label} {field.required && "*"}
              </Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-3.5 w-3.5 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs text-xs">{field.tooltip}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div className="relative">
              <Input
                id={field.id}
                type="number"
                step={field.id === "transitDepth" ? "0.001" : field.id === "stellarMagnitude" ? "0.1" : "0.01"}
                placeholder={field.placeholder}
                value={formData[field.id as keyof typeof formData]}
                onChange={(e) => handleChange(field.id, e.target.value)}
                required={field.required}
                className={field.unit ? "pr-16" : ""}
              />
              {field.unit && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                  {field.unit}
                </span>
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
