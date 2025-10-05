"use client"

import { createContext, useContext, useState, type ReactNode, type Dispatch, type SetStateAction } from "react"

export interface PlanetData {
  orbitalPeriod?: number
  planetRadius?: number
  equilibriumTemp?: number
  stellarMagnitude?: number
  transitDepth?: number
  transitDuration?: number
  signalToNoise?: number
  mass?: number
  density?: number
  stellarFlux?: number
}

export interface PredictionResult {
  classification: "Confirmado" | "Candidato" | "Falso Positivo"
  probability: number
  confidence: "Alta" | "Média" | "Baixa"
}

export interface StreamStep {
  step: number
  status: string
  startedAt: number
  finishedAt?: number
  durationMs?: number
}

export interface StreamPredictionRow {
  id: string
  classificacao: string
  probabilidade: number
}

interface PlanetDataContextType {
  planetData: PlanetData
  setPlanetData: Dispatch<SetStateAction<PlanetData>>
  prediction: PredictionResult | null
  setPrediction: Dispatch<SetStateAction<PredictionResult | null>>
  isProcessing: boolean
  setIsProcessing: Dispatch<SetStateAction<boolean>>
  // streaming
  streamSteps: StreamStep[]
  setStreamSteps: Dispatch<SetStateAction<StreamStep[]>>
  streamPredictions: StreamPredictionRow[]
  setStreamPredictions: Dispatch<SetStateAction<StreamPredictionRow[]>>
}

const PlanetDataContext = createContext<PlanetDataContextType | undefined>(undefined)

export function PlanetDataProvider({ children }: { children: ReactNode }) {
  const [planetData, setPlanetData] = useState<PlanetData>({})
  const [prediction, setPrediction] = useState<PredictionResult | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [streamSteps, setStreamSteps] = useState<StreamStep[]>([])
  const [streamPredictions, setStreamPredictions] = useState<StreamPredictionRow[]>([])

  return (
    <PlanetDataContext.Provider
      value={{ planetData, setPlanetData, prediction, setPrediction, isProcessing, setIsProcessing, streamSteps, setStreamSteps, streamPredictions, setStreamPredictions }}
    >
      {children}
    </PlanetDataContext.Provider>
  )
}

export function usePlanetData() {
  const context = useContext(PlanetDataContext)
  if (context === undefined) {
    throw new Error("usePlanetData must be used within a PlanetDataProvider")
  }
  return context
}
