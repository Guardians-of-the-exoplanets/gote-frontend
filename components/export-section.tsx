"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, FileText, Share2, Wrench, Lock } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function ExportSection() {
  return (
    <section id="export" className="scroll-mt-20">
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="text-xl">Export Results</CardTitle>
          <CardDescription>Download your analyses or share with your team</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Future Implementation Alert */}
          <Alert className="border-primary/30 bg-primary/5">
            <Wrench className="h-4 w-4 text-primary" />
            <AlertDescription className="text-xs leading-relaxed">
              <span className="font-semibold">Future Implementation:</span> Export functionality is currently under development and will be available in upcoming releases. This feature will enable CSV exports, PDF reports generation, and collaborative link sharing capabilities.
            </AlertDescription>
          </Alert>

          {/* Disabled buttons with glow overlay */}
          <div className="relative">
            {/* Glow overlay effect */}
            <div className="absolute inset-0 z-10 bg-gradient-to-t from-background/95 via-background/70 to-background/95 backdrop-blur-[2px] rounded-lg pointer-events-none">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 animate-pulse rounded-lg" />
            </div>
            
            {/* Lock indicator */}
            <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
              <div className="p-4 bg-background/90 backdrop-blur-sm rounded-full border-2 border-primary/30 shadow-lg">
                <Lock className="h-8 w-8 text-primary animate-pulse" />
              </div>
            </div>

            {/* Buttons (disabled) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 opacity-60">
              <Button
                disabled
                size="lg"
                variant="outline"
                className="h-auto flex-col gap-3 py-6 cursor-not-allowed"
              >
                <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl opacity-50">
                  <Download className="h-6 w-6 text-white" />
                </div>
                <div className="text-center">
                  <div className="font-semibold text-base">Export CSV</div>
                  <div className="text-xs text-muted-foreground mt-1">Raw data for analysis</div>
                </div>
              </Button>

              <Button
                disabled
                size="lg"
                variant="outline"
                className="h-auto flex-col gap-3 py-6 cursor-not-allowed"
              >
                <div className="p-3 bg-gradient-to-br from-red-500 to-pink-500 rounded-xl opacity-50">
                  <FileText className="h-6 w-6 text-white" />
                </div>
                <div className="text-center">
                  <div className="font-semibold text-base">Export PDF</div>
                  <div className="text-xs text-muted-foreground mt-1">Formatted full report</div>
                </div>
              </Button>

              <Button
                disabled
                size="lg"
                variant="outline"
                className="h-auto flex-col gap-3 py-6 cursor-not-allowed"
              >
                <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl opacity-50">
                  <Share2 className="h-6 w-6 text-white" />
                </div>
                <div className="text-center">
                  <div className="font-semibold text-base">Share Link</div>
                  <div className="text-xs text-muted-foreground mt-1">Collaborative access</div>
                </div>
              </Button>
            </div>
          </div>

          {/* Next Steps Info */}
          <div className="p-4 bg-muted/30 border border-border rounded-lg">
            <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
              <Wrench className="h-4 w-4" />
              Next Steps to Improve the Application
            </h4>
            <ul className="text-xs text-muted-foreground space-y-1.5 ml-6 list-disc">
              <li>Implement CSV export with customizable field selection</li>
              <li>Generate comprehensive PDF reports with charts and visualizations</li>
              <li>Create shareable links with expiration and access control</li>
              <li>Add batch export capabilities for multiple classification sessions</li>
              <li>Enable integration with cloud storage services (Google Drive, Dropbox)</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </section>
  )
}
