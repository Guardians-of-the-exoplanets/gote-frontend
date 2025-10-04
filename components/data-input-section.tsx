"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileUpload } from "@/components/file-upload"
import { ManualDataForm } from "@/components/manual-data-form"
import { Upload, Edit3, Database, FileText, Rocket } from "lucide-react"
import { useMode } from "@/lib/mode-context"
import { usePlanetData } from "@/lib/planet-data-context"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { motion } from "framer-motion"

export function DataInputSection() {
  const [uploadedData, setUploadedData] = useState<any>(null)
  const { mode } = useMode()
  const { setIsProcessing } = usePlanetData()

  const handleStartBatchClassification = () => {
    if (!uploadedData) return
    setIsProcessing(true)
  }

  return (
    <section id="data" className="scroll-mt-20">
      <Card className="gradient-border bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-2xl md:text-3xl">Entrada de Dados</CardTitle>
          <CardDescription className="text-sm md:text-base">
            {mode === "explorer"
              ? "Insira os dados do seu candidato a exoplaneta para descobrir se é real"
              : "Insira dados de TCEs/KOIs via CSV. Suporte para pipelines Kepler/K2/TESS"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {mode === "explorer" && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <Alert className="mb-6 border-primary/30 bg-gradient-to-r from-primary/10 to-accent/10">
                <Rocket className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  <strong>Bem-vindo ao Guardians of The Exoplanets!</strong> Você está prestes a descobrir se um sinal astronômico é um
                  planeta real orbitando outra estrela. Quando um planeta passa na frente de sua estrela, ele bloqueia
                  um pouco da luz - é isso que vamos analisar!
                </AlertDescription>
              </Alert>
            </motion.div>
          )}

          {mode === "researcher" && (
            <Alert className="mb-6 border-primary/30 bg-primary/5">
              <Database className="h-4 w-4" />
              <AlertDescription>
                <strong>Formatos suportados:</strong> CSV (light curves), JSON (preprocessed).
                Pipeline automático detecta eventos, normaliza e remove ruído.
              </AlertDescription>
            </Alert>
          )}

          <Tabs defaultValue="manual" className="w-full">
            <TabsList
              className="grid w-full max-w-md mx-auto grid-cols-2"
            >
              <TabsTrigger value="manual" className="flex items-center gap-2 text-xs md:text-sm">
                <Edit3 className="h-4 w-4" />
                <span className="hidden sm:inline">Manual</span>
              </TabsTrigger>
              <TabsTrigger value="upload" className="flex items-center gap-2 text-xs md:text-sm">
                <Upload className="h-4 w-4" />
                <span className="hidden sm:inline">Upload</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="manual" className="mt-6">
              <ManualDataForm
                showSubmit={true}
                formId={mode === "explorer" ? "explorer-data-form" : "researcher-data-form"}
              />
            </TabsContent>

            <TabsContent value="upload" className="mt-6">
              <FileUpload onDataUploaded={setUploadedData} />
              <div className="flex justify-center pt-4">
                <Button type="button" size="lg" className="gap-2 glow-effect" onClick={handleStartBatchClassification} disabled={!uploadedData}>
                  <Rocket className="h-4 w-4" />
                  Iniciar Classificação
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </section>
  )
}
