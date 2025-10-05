"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { useMode } from "@/lib/mode-context"
import { Upload, FileJson, FileSpreadsheet, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { RetrainModal } from "@/components/retrain-modal"
import { usePlanetData } from "@/lib/planet-data-context"

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
            <p className="text-lg font-medium">Arraste e solte seu arquivo aqui</p>
            <p className="text-sm text-muted-foreground">ou clique para selecionar</p>
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

      {uploadStatus === "success" && uploadedFile && (
        <>
          <Alert className="border-green-500/50 bg-green-500/10">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <AlertDescription>
              <div className="flex items-center justify-between gap-4">
                <span className="text-green-500">
                  Arquivo <strong>{uploadedFile.name}</strong> carregado com sucesso!
                </span>
                {mode === "researcher" && (
                  <Button
                    onClick={() => setRetrainModalOpen(true)}
                    variant="outline"
                    size="sm"
                    className="border-accent/50 hover:bg-accent/10 text-accent hover:text-accent flex-shrink-0"
                  >
                    <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                    Retreinar Modelo
                  </Button>
                )}
              </div>
            </AlertDescription>
          </Alert>

          {/* Retrain Modal */}
          {mode === "researcher" && (
            <RetrainModal
              open={retrainModalOpen}
              onOpenChange={setRetrainModalOpen}
              dataset={dataset}
              file={uploadedFile}
              hyperparameters={useHyperparams ? hyperparameters : undefined}
            />
          )}
        </>
      )}

      {uploadStatus === "error" && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Erro ao processar arquivo. Certifique-se de que é um arquivo CSV ou JSON válido.
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
