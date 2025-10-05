"use client"

import { Workflow } from "lucide-react"
import { PipelineVisualization } from "@/components/pipeline-visualization"
import { DataFlowDiagram } from "@/components/data-flow-diagram"
import { useMode } from "@/lib/mode-context"

export function PipelineSection() {
  const { mode } = useMode()

  // Only show detailed pipeline in researcher mode
  if (mode !== "researcher") return null

  return (
    <section id="pipeline" className="scroll-mt-20 space-y-8">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 border border-accent/20 rounded-full text-sm text-accent mb-2">
          <Workflow className="h-4 w-4" />
          Advanced Pipeline
        </div>
        <h2 className="text-4xl font-bold">Data Processing</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto text-pretty">
          Visualize each stage of the machine learning pipeline in real time
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <PipelineVisualization />
        <DataFlowDiagram />
      </div>
    </section>
  )
}
