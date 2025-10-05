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
  // Optional metadata when coming from uploads
  pubdate?: string
  publication_date?: string
  published_at?: string
}

export interface ResearchMetrics {
  numFeatures?: number
  testAccuracy?: number
  testF1?: number
  blindTestAccuracy?: number
  blindTestF1?: number
  totalTrainingTimeMs?: number
  testConfusionMatrix?: number[][]
  blindTestConfusionMatrix?: number[][]
  labels?: string[]
  kFoldMetrics?: Array<{
    fold: number
    accuracy?: number
    precision?: number
    recall?: number
    f1?: number
  }>
}

export type RunMeta = {
  inputKind: 'manual' | 'upload'
  hasHyperparams: boolean
}

export interface ComparisonResult {
  oldClassification: string
  oldProbability: number
  newClassification: string
  newProbability: number
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
  runMeta: RunMeta | null
  setRunMeta: Dispatch<SetStateAction<RunMeta | null>>
  // research metrics (to be filled by backend/colleague)
  researchMetrics: ResearchMetrics
  setResearchMetrics: Dispatch<SetStateAction<ResearchMetrics>>
  // researcher-only: user toggle to include hyperparameters in requests
  useHyperparams: boolean
  setUseHyperparams: Dispatch<SetStateAction<boolean>>
}

const PlanetDataContext = createContext<PlanetDataContextType | undefined>(undefined)

export function PlanetDataProvider({ children }: { children: ReactNode }) {
  const [planetData, setPlanetData] = useState<PlanetData>({})
  const [prediction, setPrediction] = useState<PredictionResult | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [streamSteps, setStreamSteps] = useState<StreamStep[]>([])
  const [streamPredictions, setStreamPredictions] = useState<StreamPredictionRow[]>([])
  const [researchMetrics, setResearchMetrics] = useState<ResearchMetrics>({})
  const [runMeta, setRunMeta] = useState<RunMeta | null>(null)
  const [useHyperparams, setUseHyperparams] = useState<boolean>(true)

  return (
    <PlanetDataContext.Provider
      value={{ planetData, setPlanetData, prediction, setPrediction, isProcessing, setIsProcessing, streamSteps, setStreamSteps, streamPredictions, setStreamPredictions, researchMetrics, setResearchMetrics, runMeta, setRunMeta, useHyperparams, setUseHyperparams }}
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
