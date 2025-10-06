"use client"

import { UserCheck } from "lucide-react"
import { VettingInterface } from "@/components/vetting-interface"
import { useMode } from "@/lib/mode-context"

export function VettingSection() {
  const { mode } = useMode()

  // Only show vetting in researcher mode
  if (mode !== "researcher") return null

  return (
    <section id="vetting" className="scroll-mt-20 space-y-8">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 border border-accent/20 rounded-full text-sm text-accent mb-2">
          <UserCheck className="h-4 w-4" />
          Human-in-the-Loop
        </div>
        <h2 className="text-4xl font-bold">Sistema de Vetting</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Manual review of candidates with confidence below threshold to ensure maximum quality
        </p>
      </div>

      <VettingInterface />
    </section>
  )
}
