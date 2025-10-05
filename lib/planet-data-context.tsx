"use client"

import { createContext, useContext, useState, type ReactNode, type Dispatch, type SetStateAction } from "react"
import { useMode } from "@/lib/mode-context"

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
  testPrecision?: number
  testRecall?: number
  blindTestAccuracy?: number
  blindTestF1?: number
  blindPrecision?: number
  blindRecall?: number
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

// Debug event for capturing raw/parsed stream items per mode
export interface DebugEvent {
  ts: number
  from: 'manual' | 'upload'
  raw: string
  json?: any
  step?: number
  status?: string
}

// Facade type returned by usePlanetData (kept stable for callers)
interface PlanetDataFacadeType {
  planetData: PlanetData
  setPlanetData: Dispatch<SetStateAction<PlanetData>>
  prediction: PredictionResult | null
  setPrediction: Dispatch<SetStateAction<PredictionResult | null>>
  isProcessing: boolean
  setIsProcessing: Dispatch<SetStateAction<boolean>>
  streamSteps: StreamStep[]
  setStreamSteps: Dispatch<SetStateAction<StreamStep[]>>
  streamPredictions: StreamPredictionRow[]
  setStreamPredictions: Dispatch<SetStateAction<StreamPredictionRow[]>>
  runMeta: RunMeta | null
  setRunMeta: Dispatch<SetStateAction<RunMeta | null>>
  researchMetrics: ResearchMetrics
  setResearchMetrics: Dispatch<SetStateAction<ResearchMetrics>>
  useHyperparams: boolean
  setUseHyperparams: Dispatch<SetStateAction<boolean>>
}

// Internal raw context with per-mode storage
interface PlanetDataContextRaw {
  planetData: PlanetData
  setPlanetData: Dispatch<SetStateAction<PlanetData>>
  explorer: {
    prediction: PredictionResult | null
    setPrediction: Dispatch<SetStateAction<PredictionResult | null>>
    isProcessing: boolean
    setIsProcessing: Dispatch<SetStateAction<boolean>>
    streamSteps: StreamStep[]
    setStreamSteps: Dispatch<SetStateAction<StreamStep[]>>
    streamPredictions: StreamPredictionRow[]
    setStreamPredictions: Dispatch<SetStateAction<StreamPredictionRow[]>>
    runMeta: RunMeta | null
    setRunMeta: Dispatch<SetStateAction<RunMeta | null>>
    debugEvents: DebugEvent[]
    setDebugEvents: Dispatch<SetStateAction<DebugEvent[]>>
  }
  researcher: {
    prediction: PredictionResult | null
    setPrediction: Dispatch<SetStateAction<PredictionResult | null>>
    isProcessing: boolean
    setIsProcessing: Dispatch<SetStateAction<boolean>>
    streamSteps: StreamStep[]
    setStreamSteps: Dispatch<SetStateAction<StreamStep[]>>
    streamPredictions: StreamPredictionRow[]
    setStreamPredictions: Dispatch<SetStateAction<StreamPredictionRow[]>>
    runMeta: RunMeta | null
    setRunMeta: Dispatch<SetStateAction<RunMeta | null>>
    researchMetrics: ResearchMetrics
    setResearchMetrics: Dispatch<SetStateAction<ResearchMetrics>>
    debugEvents: DebugEvent[]
    setDebugEvents: Dispatch<SetStateAction<DebugEvent[]>>
  }
  useHyperparams: boolean
  setUseHyperparams: Dispatch<SetStateAction<boolean>>
}

const PlanetDataContext = createContext<PlanetDataContextRaw | undefined>(undefined)

export function PlanetDataProvider({ children }: { children: ReactNode }) {
  const [planetData, setPlanetData] = useState<PlanetData>({})

  // Explorer state
  const [explorerPrediction, setExplorerPrediction] = useState<PredictionResult | null>(null)
  const [explorerIsProcessing, setExplorerIsProcessing] = useState(false)
  const [explorerStreamSteps, setExplorerStreamSteps] = useState<StreamStep[]>([])
  const [explorerStreamPredictions, setExplorerStreamPredictions] = useState<StreamPredictionRow[]>([])
  const [explorerRunMeta, setExplorerRunMeta] = useState<RunMeta | null>(null)
  const [explorerDebugEvents, setExplorerDebugEvents] = useState<DebugEvent[]>([])

  // Researcher state
  const [researcherPrediction, setResearcherPrediction] = useState<PredictionResult | null>(null)
  const [researcherIsProcessing, setResearcherIsProcessing] = useState(false)
  const [researcherStreamSteps, setResearcherStreamSteps] = useState<StreamStep[]>([])
  const [researcherStreamPredictions, setResearcherStreamPredictions] = useState<StreamPredictionRow[]>([])
  const [researcherRunMeta, setResearcherRunMeta] = useState<RunMeta | null>(null)
  const [researcherMetrics, setResearcherMetrics] = useState<ResearchMetrics>({})
  const [researcherDebugEvents, setResearcherDebugEvents] = useState<DebugEvent[]>([])

  const [useHyperparams, setUseHyperparams] = useState<boolean>(true)

  return (
    <PlanetDataContext.Provider
      value={{
        planetData,
        setPlanetData,
        explorer: {
          prediction: explorerPrediction,
          setPrediction: setExplorerPrediction,
          isProcessing: explorerIsProcessing,
          setIsProcessing: setExplorerIsProcessing,
          streamSteps: explorerStreamSteps,
          setStreamSteps: setExplorerStreamSteps,
          streamPredictions: explorerStreamPredictions,
          setStreamPredictions: setExplorerStreamPredictions,
          runMeta: explorerRunMeta,
          setRunMeta: setExplorerRunMeta,
          debugEvents: explorerDebugEvents,
          setDebugEvents: setExplorerDebugEvents,
        },
        researcher: {
          prediction: researcherPrediction,
          setPrediction: setResearcherPrediction,
          isProcessing: researcherIsProcessing,
          setIsProcessing: setResearcherIsProcessing,
          streamSteps: researcherStreamSteps,
          setStreamSteps: setResearcherStreamSteps,
          streamPredictions: researcherStreamPredictions,
          setStreamPredictions: setResearcherStreamPredictions,
          runMeta: researcherRunMeta,
          setRunMeta: setResearcherRunMeta,
          researchMetrics: researcherMetrics,
          setResearchMetrics: setResearcherMetrics,
          debugEvents: researcherDebugEvents,
          setDebugEvents: setResearcherDebugEvents,
        },
        useHyperparams,
        setUseHyperparams,
      }}
    >
      {children}
    </PlanetDataContext.Provider>
  )
}

export function usePlanetData(): PlanetDataFacadeType {
  const context = useContext(PlanetDataContext)
  if (context === undefined) {
    throw new Error("usePlanetData must be used within a PlanetDataProvider")
  }
  const { mode } = useMode()

  const isExplorer = mode === "explorer"
  const slice = isExplorer ? context.explorer : context.researcher

  // For explorer mode, research metrics are not applicable; provide empty object and noop setter
  const researchMetrics = isExplorer ? {} as ResearchMetrics : context.researcher.researchMetrics
  const setResearchMetrics: Dispatch<SetStateAction<ResearchMetrics>> = isExplorer
    ? (() => {}) as unknown as Dispatch<SetStateAction<ResearchMetrics>>
    : context.researcher.setResearchMetrics

  // Debug: expose events and a helper to push/clamp
  const pushDebugEvent = (evt: DebugEvent) => {
    const setter = isExplorer ? context.explorer.setDebugEvents : context.researcher.setDebugEvents
    setter((prev) => {
      const next = [...prev, evt]
      const max = 200
      if (next.length > max) next.splice(0, next.length - max)
      return next
    })
  }

  return {
    planetData: context.planetData,
    setPlanetData: context.setPlanetData,
    prediction: slice.prediction,
    setPrediction: slice.setPrediction,
    isProcessing: slice.isProcessing,
    setIsProcessing: slice.setIsProcessing,
    streamSteps: slice.streamSteps,
    setStreamSteps: slice.setStreamSteps,
    streamPredictions: slice.streamPredictions,
    setStreamPredictions: slice.setStreamPredictions,
    runMeta: slice.runMeta,
    setRunMeta: slice.setRunMeta,
    researchMetrics,
    setResearchMetrics,
    useHyperparams: context.useHyperparams,
    setUseHyperparams: context.setUseHyperparams,
    // Cast to any to expose debug helpers without widening public types
    ...( { debugEvents: (slice as any).debugEvents, pushDebugEvent } as any ),
  }
}
