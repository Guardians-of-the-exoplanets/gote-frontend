"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { useMode } from "@/lib/mode-context"
import { Upload, FileJson, FileSpreadsheet, CheckCircle2, AlertCircle, RefreshCw, Brain, Rocket, Zap, Database, TrendingUp, FileText } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { RetrainModal, RetrainSessionData } from "@/components/retrain-modal"
import { usePlanetData } from "@/lib/planet-data-context"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { motion, AnimatePresence } from "framer-motion"

interface FileUploadProps {
  onDataUploaded: (data: any) => void
  dataset?: "kepler" | "k2" | "tess"
  hyperparameters?: any
}

export function FileUpload({ onDataUploaded, dataset = "kepler", hyperparameters }: FileUploadProps) {
  const { mode } = useMode()
  const { useHyperparams } = usePlanetData()
  const [isDragging, setIsDragging] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [uploadStatus, setUploadStatus] = useState<"idle" | "success" | "error">("idle")
  const [retrainModalOpen, setRetrainModalOpen] = useState(false)
  const [retrainSession, setRetrainSession] = useState<RetrainSessionData | null>(null)
  const [viewingLogs, setViewingLogs] = useState(false)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const files = Array.from(e.dataTransfer.files)
    const file = files[0]

    if (file && (file.name.endsWith(".csv") || file.name.endsWith(".json"))) {
      processFile(file)
    } else {
      setUploadStatus("error")
    }
  }, [])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      processFile(file)
    }
  }, [])

  const processFile = (file: File) => {
    setUploadedFile(file)
    setUploadStatus("success")
    setRetrainSession(null) // Reset session when new file is uploaded

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string
        const data = file.name.endsWith(".json") ? JSON.parse(content) : content
        onDataUploaded({ file, text: file.name.endsWith(".csv") ? content : undefined, json: file.name.endsWith(".json") ? data : undefined })
      } catch (error) {
        setUploadStatus("error")
      }
    }
    reader.readAsText(file)
  }

  const handleSessionComplete = (session: RetrainSessionData) => {
    setRetrainSession(session)
  }

  const handleViewLogs = () => {
    setViewingLogs(true)
  }

  return (
    <div className="space-y-4">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative border-2 border-dashed rounded-lg p-12 text-center transition-all
          ${isDragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}
        `}
      >
        <input
          type="file"
          accept=".csv,.json"
          onChange={handleFileSelect}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />

        <div className="flex flex-col items-center gap-4">
          <div className="p-4 bg-primary/10 rounded-full">
            <Upload className="h-8 w-8 text-primary" />
          </div>

          <div className="space-y-2">
            <p className="text-lg font-medium">Drag and drop your file here</p>
            <p className="text-sm text-muted-foreground">or click to select</p>
          </div>

          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <FileSpreadsheet className="h-4 w-4" />
              CSV
            </div>
            <div className="flex items-center gap-1">
              <FileJson className="h-4 w-4" />
              JSON
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
      {uploadStatus === "success" && uploadedFile && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            {mode === "researcher" ? (
              // Researcher Mode - Enhanced Retrain Banner
              <Card className="relative overflow-hidden border border-primary/20 bg-card shadow-md">

                <div className="relative p-4 sm:p-6">
                  {/* Success Badge Header */}
                  <div className="flex items-center gap-2 sm:gap-3 mb-4">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-base sm:text-lg font-bold">
                        File successfully uploaded!
                      </h3>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        <span className="font-mono font-medium">{uploadedFile.name}</span> • {(uploadedFile.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </div>

                  {/* Info Cards Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mb-4">
                    <div className="p-2 sm:p-3 rounded-lg bg-muted/50 border border-border">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Database className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-muted-foreground" />
                        <span className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wide">Dataset</span>
                      </div>
                      <p className="text-xs sm:text-sm font-semibold">{dataset.toUpperCase()}</p>
                    </div>
                    
                    <div className="p-2 sm:p-3 rounded-lg bg-muted/50 border border-border">
                      <div className="flex items-center gap-1.5 mb-1">
                        <FileSpreadsheet className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-muted-foreground" />
                        <span className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wide">Format</span>
                      </div>
                      <p className="text-xs sm:text-sm font-semibold">{uploadedFile.name.split('.').pop()?.toUpperCase()}</p>
                    </div>
                    
                    <div className="p-2 sm:p-3 rounded-lg bg-muted/50 border border-border">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Brain className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-muted-foreground" />
                        <span className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wide">Model</span>
                      </div>
                      <p className="text-xs sm:text-sm font-semibold">{useHyperparams ? 'Tuned' : 'Baseline'}</p>
                    </div>
                    
                    <div className="p-2 sm:p-3 rounded-lg bg-muted/50 border border-border">
                      <div className="flex items-center gap-1.5 mb-1">
                        <TrendingUp className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-muted-foreground" />
                        <span className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wide">Status</span>
                      </div>
                      <p className="text-xs sm:text-sm font-semibold text-primary">Ready</p>
                    </div>
                  </div>

                  {/* Retrain CTA Section */}
                  <div className="p-3 sm:p-4 rounded-lg bg-primary/5 border border-primary/20">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                      <div className="flex-shrink-0">
                        <div className="p-2 sm:p-3 rounded-lg bg-primary/10">
                          <RefreshCw className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                        </div>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm sm:text-base font-semibold mb-1">Retrain Custom Model</h4>
                        <p className="text-[10px] sm:text-xs text-muted-foreground leading-relaxed mb-2">
                            Use your data to train a customized model with StratifiedKFold CV and comprehensive evaluation metrics.
                        </p>
                        <div className="flex flex-wrap items-center gap-1.5">
                          <Badge variant="outline" className="text-[9px] sm:text-[10px] px-1.5 py-0">
                            <Zap className="h-2.5 w-2.5 mr-1" />
                            XGBoost
                          </Badge>
                          <Badge variant="outline" className="text-[9px] sm:text-[10px] px-1.5 py-0">
                            <TrendingUp className="h-2.5 w-2.5 mr-1" />
                            K-Fold CV
                          </Badge>
                          <Badge variant="outline" className="text-[9px] sm:text-[10px] px-1.5 py-0">
                            <Rocket className="h-2.5 w-2.5 mr-1" />
                            Download .model
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                  <Button
                    onClick={() => setRetrainModalOpen(true)}
                          size="lg"
                          className="gap-2"
                        >
                          <RefreshCw className="h-4 w-4" />
                          Retrain Now
                        </Button>
                        
                        {retrainSession && (
                          <Button
                            onClick={handleViewLogs}
                            size="lg"
                    variant="outline"
                            className="gap-2"
                  >
                            <FileText className="h-4 w-4" />
                            View Logs
                  </Button>
                )}
              </div>
                    </div>
                  </div>

                  {/* Bottom Info */}
                  <div className="mt-3 pt-3 border-t border-border">
                    <div className="flex items-center justify-between text-[10px] sm:text-xs text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="h-3 w-3 text-primary" />
                        <span>File validated and ready for use</span>
                      </div>
                      <span className="font-mono">{new Date().toLocaleTimeString()}</span>
                    </div>
                  </div>
                </div>
              </Card>
            ) : (
              // Explorer Mode - Simple Success Banner
              <Alert className="border-primary/30 bg-primary/5">
                <CheckCircle2 className="h-4 w-4 text-primary" />
            <AlertDescription>
                  Arquivo <strong>{uploadedFile.name}</strong> Successfully loaded!
            </AlertDescription>
          </Alert>
            )}

          {/* Retrain Modal */}
          {mode === "researcher" && (
              <>
            <RetrainModal
              open={retrainModalOpen}
              onOpenChange={setRetrainModalOpen}
              dataset={dataset}
              file={uploadedFile}
              hyperparameters={useHyperparams ? hyperparameters : undefined}
                  onSessionComplete={handleSessionComplete}
                />
                
                {/* Logs Viewer Modal */}
                {retrainSession && (
                  <RetrainModal
                    open={viewingLogs}
                    onOpenChange={setViewingLogs}
                    dataset={retrainSession.dataset}
                    file={null}
                    existingSession={retrainSession}
            />
          )}
        </>
      )}
          </motion.div>
        )}
      </AnimatePresence>

      {uploadStatus === "error" && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Error processing file. Please ensure it is a valid CSV or JSON file.
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
