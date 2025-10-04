"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

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

interface PlanetDataContextType {
  planetData: PlanetData
  setPlanetData: (data: PlanetData) => void
  prediction: PredictionResult | null
  setPrediction: (prediction: PredictionResult | null) => void
  isProcessing: boolean
  setIsProcessing: (isProcessing: boolean) => void
}

const PlanetDataContext = createContext<PlanetDataContextType | undefined>(undefined)

export function PlanetDataProvider({ children }: { children: ReactNode }) {
  const [planetData, setPlanetData] = useState<PlanetData>({})
  const [prediction, setPrediction] = useState<PredictionResult | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  return (
    <PlanetDataContext.Provider
      value={{ planetData, setPlanetData, prediction, setPrediction, isProcessing, setIsProcessing }}
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
