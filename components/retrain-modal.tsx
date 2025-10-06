"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle2, Download, RefreshCw, TrendingUp, Activity, Target, AlertCircle, ChevronDown, ChevronRight, FileText } from "lucide-react"
import { useState, useEffect } from "react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

interface RetrainStep {
  step: number
  status: string
  metrics?: any
  url_for_download?: string
}

export interface RetrainSessionData {
  steps: RetrainStep[]
  downloadUrl: string
  dataset: "kepler" | "k2" | "tess"
  fileName: string
  completedAt: string
  elapsedTime: number
}

interface RetrainModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  dataset: "kepler" | "k2" | "tess"
  file: File | null
  hyperparameters?: any
  existingSession?: RetrainSessionData | null
  onSessionComplete?: (session: RetrainSessionData) => void
}

export function RetrainModal({ open, onOpenChange, dataset, file, hyperparameters, existingSession, onSessionComplete }: RetrainModalProps) {
  const [isRetraining, setIsRetraining] = useState(false)
  const [steps, setSteps] = useState<RetrainStep[]>(existingSession?.steps || [])
  const [currentStep, setCurrentStep] = useState(existingSession?.steps.length ? existingSession.steps.length - 1 : 0)
  const [downloadUrl, setDownloadUrl] = useState<string>(existingSession?.downloadUrl || "")
  const [error, setError] = useState<string>("")
  const [elapsedTime, setElapsedTime] = useState(existingSession?.elapsedTime || 0)
  const [expandedSteps, setExpandedSteps] = useState<Set<number>>(new Set())
  const [finalSession, setFinalSession] = useState<RetrainSessionData | null>(null)

  useEffect(() => {
    if (existingSession) {
      setSteps(existingSession.steps)
      setCurrentStep(existingSession.steps.length - 1)
      setDownloadUrl(existingSession.downloadUrl)
      setElapsedTime(existingSession.elapsedTime)
    }
  }, [existingSession])

  useEffect(() => {
    if (open && file && !existingSession) {
      startRetraining()
    }
  }, [open, file])

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isRetraining) {
      interval = setInterval(() => {
        setElapsedTime(prev => prev + 0.1)
      }, 100)
    }
    return () => clearInterval(interval)
  }, [isRetraining])

  const startRetraining = async () => {
    if (!file) return
    
    setIsRetraining(true)
    setSteps([])
    setCurrentStep(0)
    setError("")
    setDownloadUrl("")
    setElapsedTime(0)

    try {
      const formData = new FormData()
      formData.append("file", file, file.name)
      formData.append("mode", "researcher")
      formData.append("dataset", dataset)
      
      if (hyperparameters) {
        formData.append("hyperparameters", JSON.stringify(hyperparameters))
      }

      const response = await fetch("https://gote-backend.onrender.com/upload/model", {
        method: "POST",
        body: formData,
      })

      if (!response.ok || !response.body) {
        throw new Error("Erro na resposta do servidor")
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ""

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split("\n")
        buffer = lines.pop() || ""

        for (const line of lines) {
          if (line.trim()) {
            try {
              // Remove "data: " prefix from SSE format
              let jsonString = line.trim()
              if (jsonString.startsWith('data: ')) {
                jsonString = jsonString.substring(6)
              }
              
              // Skip empty lines or SSE comments
              if (!jsonString || jsonString.startsWith(':')) {
                continue
              }
              
              const data = JSON.parse(jsonString) as RetrainStep
              setSteps(prev => {
                const newSteps = [...prev, data]
                
                // Update final session when steps change
                if (file) {
                  setFinalSession({
                    steps: newSteps,
                    downloadUrl: data.url_for_download || downloadUrl,
                    dataset,
                    fileName: file.name,
                    completedAt: new Date().toISOString(),
                    elapsedTime: 0 // Will be updated in finally
                  })
                }
                
                return newSteps
              })
              setCurrentStep(data.step)
              
              if (data.url_for_download) {
                setDownloadUrl(data.url_for_download)
              }
              
              // eslint-disable-next-line no-console
              console.log('[Retrain]', data)
            } catch (e) {
              // eslint-disable-next-line no-console
              console.error('[Retrain] Parse error:', e, 'Line:', line)
            }
          }
        }
      }
    } catch (err: any) {
      setError(err.message || "Erro ao retreinar modelo")
      // eslint-disable-next-line no-console
      console.error('[Retrain] Error:', err)
    } finally {
      setIsRetraining(false)
      
      // Save session data when complete
      if (onSessionComplete && finalSession) {
        const sessionData: RetrainSessionData = {
          ...finalSession,
          elapsedTime
        }
        onSessionComplete(sessionData)
      }
    }
  }

  const toggleStepExpansion = (stepNumber: number) => {
    setExpandedSteps(prev => {
      const newSet = new Set(prev)
      if (newSet.has(stepNumber)) {
        newSet.delete(stepNumber)
      } else {
        newSet.add(stepNumber)
      }
      return newSet
    })
  }

  const latestStep = steps[steps.length - 1]
  const progress = ((currentStep + 1) / 19) * 100
  const isComplete = currentStep >= 17 || !!existingSession
  const isViewingMode = !!existingSession

  const getStepIcon = (step: number) => {
    if (step <= 2) return <Download className="h-4 w-4" />
    if (step >= 3 && step <= 14) return <Activity className="h-4 w-4" />
    if (step >= 15) return <Target className="h-4 w-4" />
    return <RefreshCw className="h-4 w-4" />
  }

  const formatMetrics = (metrics: any) => {
    if (!metrics) return null
    
    return Object.entries(metrics).map(([key, value]: [string, any]) => {
      if (typeof value === 'object') {
        return (
          <div key={key} className="space-y-1">
            <div className="text-[10px] sm:text-xs font-medium text-muted-foreground uppercase">{key}</div>
            {Object.entries(value).map(([k, v]) => (
              <div key={k} className="flex justify-between text-[10px] sm:text-xs gap-2">
                <span className="truncate">{k}:</span>
                <span className="font-mono font-semibold flex-shrink-0">{typeof v === 'string' ? v : String(v)}</span>
              </div>
            ))}
          </div>
        )
      }
      return (
        <div key={key} className="flex justify-between text-[10px] sm:text-xs gap-2">
          <span className="truncate">{key}:</span>
          <span className="font-mono font-semibold flex-shrink-0">{typeof value === 'string' ? value : String(value)}</span>
        </div>
      )
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] sm:max-h-[80vh] overflow-hidden flex flex-col w-[95vw] sm:w-full p-4 sm:p-6">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
            {isViewingMode ? (
              <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            ) : (
              <RefreshCw className={`h-4 w-4 sm:h-5 sm:w-5 ${isRetraining ? 'animate-spin text-primary' : 'text-emerald-500'}`} />
            )}
            <span className="truncate">
              {isViewingMode ? 'Training Logs' : 'Model Retraining'} - {dataset.toUpperCase()}
            </span>
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            {isViewingMode 
              ? `Concluído em ${existingSession ? new Date(existingSession.completedAt).toLocaleString() : ''}`
              : 'Treinando novo modelo com seus dados personalizados'
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 sm:space-y-4 overflow-y-auto flex-1 pr-1">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs sm:text-sm">
              <span className="text-muted-foreground">Progresso</span>
              <span className="font-mono font-semibold">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-1.5 sm:h-2" />
            <div className="flex items-center justify-between text-[10px] sm:text-xs text-muted-foreground">
              <span>Step {currentStep + 1}/19</span>
              <span className="font-mono">{elapsedTime.toFixed(1)}s</span>
            </div>
          </div>

          {/* Current Status */}
          {latestStep && (
            <Card className="border-primary/30 bg-primary/5">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-start gap-2 sm:gap-3">
                  <div className={`p-1.5 sm:p-2 rounded-lg flex-shrink-0 ${isComplete ? 'bg-emerald-500/20' : 'bg-primary/20'}`}>
                    {isComplete ? <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-500" /> : getStepIcon(latestStep.step)}
                  </div>
                  <div className="flex-1 space-y-2 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="outline" className="font-mono text-[10px] sm:text-xs">Step {latestStep.step}</Badge>
                      <span className="text-xs sm:text-sm font-medium break-words">{latestStep.status}</span>
                    </div>
                    {latestStep.metrics && (
                      <div className="grid grid-cols-1 gap-2 sm:gap-3 p-2 sm:p-3 bg-card rounded-lg border">
                        {formatMetrics(latestStep.metrics)}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Steps List */}
          <div className="space-y-1.5 sm:space-y-2 max-h-40 sm:max-h-60 overflow-y-auto pr-1 sm:pr-2 scrollbar-thin">
            {steps.slice().reverse().map((step, idx) => {
              const isExpanded = expandedSteps.has(step.step)
              const hasDetails = step.metrics || step.url_for_download
              
              return (
                <Collapsible key={step.step} open={isExpanded} onOpenChange={() => hasDetails && toggleStepExpansion(step.step)}>
                  <div
                    className={`rounded ${
                      idx === 0 ? 'bg-primary/10 border border-primary/20' : 'bg-muted/30'
                    }`}
                  >
                    <CollapsibleTrigger 
                      className={`w-full flex items-center gap-1.5 sm:gap-2 p-1.5 sm:p-2 text-[10px] sm:text-xs ${
                        hasDetails ? 'cursor-pointer hover:bg-muted/50' : 'cursor-default'
                      }`}
                      disabled={!hasDetails}
                    >
                      {hasDetails && (
                        isExpanded ? 
                          <ChevronDown className="h-3 w-3 flex-shrink-0 text-primary" /> : 
                          <ChevronRight className="h-3 w-3 flex-shrink-0 text-muted-foreground" />
                      )}
                      <Badge variant="outline" className={`font-mono text-[9px] sm:text-[10px] min-w-[50px] sm:min-w-[60px] py-0 px-1 sm:px-2 ${!hasDetails ? 'ml-6' : ''}`}>
                        Step {step.step}
                      </Badge>
                      <span className="flex-1 truncate text-[10px] sm:text-xs text-left">{step.status}</span>
                      {step.metrics && (
                        <TrendingUp className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-accent flex-shrink-0" />
                      )}
                    </CollapsibleTrigger>
                    
                    <CollapsibleContent>
                      <div className="px-2 sm:px-3 pb-2 pt-1">
                        {step.metrics && (
                          <div className="p-2 rounded bg-card border border-border">
                            <div className="text-[9px] sm:text-[10px] font-medium text-muted-foreground mb-1.5">Metrics</div>
                            <div className="space-y-1">
                              {formatMetrics(step.metrics)}
                            </div>
                          </div>
                        )}
                        {step.url_for_download && (
                          <div className="mt-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => window.open(step.url_for_download, '_blank')}
                              className="w-full text-[10px] sm:text-xs h-7"
                            >
                              <Download className="h-3 w-3 mr-1" />
                              Download Model
                            </Button>
                          </div>
                        )}
                      </div>
                    </CollapsibleContent>
                  </div>
                </Collapsible>
              )
            })}
          </div>

          {/* Error Alert */}
          {error && (
            <Alert variant="destructive" className="text-xs sm:text-sm">
              <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4" />
              <AlertDescription className="text-xs sm:text-sm">{error}</AlertDescription>
            </Alert>
          )}

          {/* Download Button */}
          {isComplete && downloadUrl && (
            <Alert className="border-emerald-500/50 bg-emerald-500/10 p-3 sm:p-4">
              <CheckCircle2 className="h-3 w-3 sm:h-4 sm:w-4 text-emerald-500" />
              <AlertDescription>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:justify-between">
                  <div className="flex-1">
                    <strong className="text-emerald-500 text-xs sm:text-sm">Retreino concluído!</strong>
                    <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">
                      Seu modelo personalizado está pronto para download
                    </p>
                  </div>
                  <Button
                    onClick={() => window.open(downloadUrl, '_blank')}
                    className="bg-emerald-500 hover:bg-emerald-600 w-full sm:w-auto text-xs sm:text-sm h-8 sm:h-10"
                  >
                    <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                    Download
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

