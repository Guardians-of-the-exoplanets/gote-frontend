"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, FileText, Share2, CheckCircle2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function ExportSection() {
  const { toast } = useToast()

  const handleExportCSV = () => {
    toast({
      title: "Exportando CSV",
      description: "Seus resultados estão sendo preparados para download...",
    })
    // Simulate export
    setTimeout(() => {
      toast({
        title: "CSV Exportado",
        description: "O arquivo foi baixado com sucesso!",
      })
    }, 1500)
  }

  const handleExportPDF = () => {
    toast({
      title: "Gerando PDF",
      description: "Criando relatório completo com visualizações...",
    })
    // Simulate export
    setTimeout(() => {
      toast({
        title: "PDF Gerado",
        description: "Relatório completo disponível para download!",
      })
    }, 2000)
  }

  const handleShareLink = () => {
    const shareableLink = `${typeof window !== "undefined" ? window.location.origin : ""}/share/${Math.random().toString(36).substring(7)}`
    navigator.clipboard.writeText(shareableLink)
    toast({
      title: "Link Copiado",
      description: "Link compartilhável copiado para a área de transferência!",
    })
  }

  return (
    <section id="export" className="scroll-mt-20">
      <Card className="gradient-border bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-3xl">Exportar Resultados</CardTitle>
          <CardDescription className="text-base">Baixe suas análises ou compartilhe com sua equipe</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              onClick={handleExportCSV}
              size="lg"
              variant="outline"
              className="h-auto flex-col gap-3 py-6 hover:bg-primary/10 hover:border-primary transition-all bg-transparent"
            >
              <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl">
                <Download className="h-6 w-6 text-white" />
              </div>
              <div className="text-center">
                <div className="font-semibold text-base">Exportar CSV</div>
                <div className="text-xs text-muted-foreground mt-1">Dados brutos para análise</div>
              </div>
            </Button>

            <Button
              onClick={handleExportPDF}
              size="lg"
              variant="outline"
              className="h-auto flex-col gap-3 py-6 hover:bg-primary/10 hover:border-primary transition-all bg-transparent"
            >
              <div className="p-3 bg-gradient-to-br from-red-500 to-pink-500 rounded-xl">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <div className="text-center">
                <div className="font-semibold text-base">Exportar PDF</div>
                <div className="text-xs text-muted-foreground mt-1">Relatório completo formatado</div>
              </div>
            </Button>

            <Button
              onClick={handleShareLink}
              size="lg"
              variant="outline"
              className="h-auto flex-col gap-3 py-6 hover:bg-primary/10 hover:border-primary transition-all bg-transparent"
            >
              <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl">
                <Share2 className="h-6 w-6 text-white" />
              </div>
              <div className="text-center">
                <div className="font-semibold text-base">Compartilhar Link</div>
                <div className="text-xs text-muted-foreground mt-1">Acesso colaborativo</div>
              </div>
            </Button>
          </div>

          <div className="mt-6 p-4 bg-primary/5 border border-primary/20 rounded-xl flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-medium text-foreground mb-1">Dados Prontos para Exportação</p>
              <p className="text-muted-foreground">
                Todos os resultados da análise, visualizações e métricas estão disponíveis para download ou
                compartilhamento.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  )
}
