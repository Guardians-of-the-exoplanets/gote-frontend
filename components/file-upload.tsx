"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { Upload, FileJson, FileSpreadsheet, CheckCircle2, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface FileUploadProps {
  onDataUploaded: (data: any) => void
}

export function FileUpload({ onDataUploaded }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [uploadStatus, setUploadStatus] = useState<"idle" | "success" | "error">("idle")

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
        onDataUploaded(data)
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
        <Alert className="border-green-500/50 bg-green-500/10">
          <CheckCircle2 className="h-4 w-4 text-green-500" />
          <AlertDescription className="text-green-500">
            Arquivo <strong>{uploadedFile.name}</strong> carregado com sucesso!
          </AlertDescription>
        </Alert>
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
