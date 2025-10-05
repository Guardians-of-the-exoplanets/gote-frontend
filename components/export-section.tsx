"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, FileText, Share2, CheckCircle2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function ExportSection() {
  const { toast } = useToast()

  const handleExportCSV = () => {
    toast({
      title: "Exporting CSV",
      description: "Preparing your results for download...",
    })
    // Simulate export
    setTimeout(() => {
      toast({
        title: "CSV Exported",
        description: "The file has been downloaded successfully!",
      })
    }, 1500)
  }

  const handleExportPDF = () => {
    toast({
      title: "Generating PDF",
      description: "Creating a complete report with visualizations...",
    })
    // Simulate export
    setTimeout(() => {
      toast({
        title: "PDF Ready",
        description: "Full report available for download!",
      })
    }, 2000)
  }

  const handleShareLink = () => {
    const shareableLink = `${typeof window !== "undefined" ? window.location.origin : ""}/share/${Math.random().toString(36).substring(7)}`
    navigator.clipboard.writeText(shareableLink)
    toast({
      title: "Link Copied",
      description: "Shareable link copied to clipboard!",
    })
  }

  return (
    <section id="export" className="scroll-mt-20">
      <Card className="gradient-border bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-3xl">Export Results</CardTitle>
          <CardDescription className="text-base">Download your analyses or share with your team</CardDescription>
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
                <div className="font-semibold text-base">Export CSV</div>
                <div className="text-xs text-muted-foreground mt-1">Raw data for analysis</div>
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
                <div className="font-semibold text-base">Export PDF</div>
                <div className="text-xs text-muted-foreground mt-1">Formatted full report</div>
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
                <div className="font-semibold text-base">Share Link</div>
                <div className="text-xs text-muted-foreground mt-1">Collaborative access</div>
              </div>
            </Button>
          </div>

          <div className="mt-6 p-4 bg-primary/5 border border-primary/20 rounded-xl flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-medium text-foreground mb-1">Data Ready for Export</p>
              <p className="text-muted-foreground">All analysis results, visualizations and metrics are available for download or sharing.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  )
}
