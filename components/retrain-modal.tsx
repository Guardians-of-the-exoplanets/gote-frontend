"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle2, Download, RefreshCw, TrendingUp, Activity, Target, AlertCircle } from "lucide-react"
import { useState, useEffect } from "react"

interface RetrainStep {
  step: number
  status: string
  metrics?: any
  url_for_download?: string
}

interface RetrainModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  dataset: "kepler" | "k2" | "tess"
  file: File | null
  hyperparameters?: any
}

export function RetrainModal({ open, onOpenChange, dataset, file, hyperparameters }: RetrainModalProps) {
  const [isRetraining, setIsRetraining] = useState(false)
  const [steps, setSteps] = useState<RetrainStep[]>([])
  const [currentStep, setCurrentStep] = useState(0)
  const [downloadUrl, setDownloadUrl] = useState<string>("")
  const [error, setError] = useState<string>("")
  const [elapsedTime, setElapsedTime] = useState(0)

  useEffect(() => {
    if (open && file) {
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
              const data = JSON.parse(line) as RetrainStep
              setSteps(prev => [...prev, data])
              setCurrentStep(data.step)
              
              if (data.url_for_download) {
                setDownloadUrl(data.url_for_download)
              }
              
              // eslint-disable-next-line no-console
              console.log('[Retrain]', data)
            } catch (e) {
              // eslint-disable-next-line no-console
              console.error('[Retrain] Parse error:', e)
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
    }
  }

  const latestStep = steps[steps.length - 1]
  const progress = ((currentStep + 1) / 19) * 100
  const isComplete = currentStep >= 17

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
            <div className="text-xs font-medium text-muted-foreground uppercase">{key}</div>
            {Object.entries(value).map(([k, v]) => (
              <div key={k} className="flex justify-between text-xs">
                <span>{k}:</span>
                <span className="font-mono font-semibold">{typeof v === 'string' ? v : String(v)}</span>
              </div>
            ))}
          </div>
        )
      }
      return (
        <div key={key} className="flex justify-between text-xs">
          <span>{key}:</span>
          <span className="font-mono font-semibold">{typeof value === 'string' ? value : String(value)}</span>
        </div>
      )
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RefreshCw className={`h-5 w-5 ${isRetraining ? 'animate-spin text-primary' : 'text-emerald-500'}`} />
            Model Retraining - {dataset.toUpperCase()}
          </DialogTitle>
          <DialogDescription>
            Treinando novo modelo com seus dados personalizados
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progresso</span>
              <span className="font-mono font-semibold">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Step {currentStep + 1}/19</span>
              <span className="font-mono">{elapsedTime.toFixed(1)}s</span>
            </div>
          </div>

          {/* Current Status */}
          {latestStep && (
            <Card className="border-primary/30 bg-primary/5">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${isComplete ? 'bg-emerald-500/20' : 'bg-primary/20'}`}>
                    {isComplete ? <CheckCircle2 className="h-5 w-5 text-emerald-500" /> : getStepIcon(latestStep.step)}
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="font-mono">Step {latestStep.step}</Badge>
                      <span className="text-sm font-medium">{latestStep.status}</span>
                    </div>
                    {latestStep.metrics && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3 bg-card rounded-lg border">
                        {formatMetrics(latestStep.metrics)}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Steps List */}
          <div className="space-y-2 max-h-60 overflow-y-auto pr-2 scrollbar-thin">
            {steps.slice().reverse().map((step, idx) => (
              <div
                key={step.step}
                className={`flex items-center gap-2 p-2 rounded text-xs ${
                  idx === 0 ? 'bg-primary/10 border border-primary/20' : 'bg-muted/30'
                }`}
              >
                <Badge variant="outline" className="font-mono text-[10px] min-w-[60px]">
                  Step {step.step}
                </Badge>
                <span className="flex-1 truncate">{step.status}</span>
                {step.metrics && (
                  <TrendingUp className="h-3 w-3 text-accent flex-shrink-0" />
                )}
              </div>
            ))}
          </div>

          {/* Error Alert */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Download Button */}
          {isComplete && downloadUrl && (
            <Alert className="border-emerald-500/50 bg-emerald-500/10">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              <AlertDescription>
                <div className="flex items-center justify-between">
                  <div>
                    <strong className="text-emerald-500">Retreino concluído!</strong>
                    <p className="text-xs text-muted-foreground mt-1">
                      Seu modelo personalizado está pronto para download
                    </p>
                  </div>
                  <Button
                    onClick={() => window.open(downloadUrl, '_blank')}
                    className="bg-emerald-500 hover:bg-emerald-600"
                  >
                    <Download className="h-4 w-4 mr-2" />
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

