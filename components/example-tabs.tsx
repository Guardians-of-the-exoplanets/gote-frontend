"use client"

import { useState } from "react"
import Image from "next/image"
import { useMode } from "@/lib/mode-context"
import { TelescopeFlow } from "@/components/telescope-flow"
import { Card } from "@/components/ui/card"

export function ExampleTabs() {
  const { mode } = useMode()
  const [active, setActive] = useState<'kepler'|'tess'>('kepler')

  if (mode !== 'example') return null

  return (
    <section className="space-y-6">
      {/* Purpose */}
      <Card className="p-5 border-primary/30 bg-gradient-to-r from-primary/5 via-accent/5 to-secondary/5">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Example mode</h3>
          <p className="text-sm text-muted-foreground">
            Explore large, curated datasets from historic missions and see how our model classifies thousands of objects at scale. Each tab shows candidate classifications plus contextual information — and mirrors insights you can find in the Researcher Analytics (e.g., distributions, performance and confusion matrices).
          </p>
        </div>
      </Card>

      {/* Tabs */}
      <div className="flex items-center justify-center">
        <div className="flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={() => setActive('kepler')}
            aria-pressed={active==='kepler'}
            className={`group relative flex items-center gap-4 px-6 py-4 rounded-2xl border transition-all shadow-sm ${active==='kepler' ? 'bg-primary/10 border-primary/40 ring-2 ring-primary/30' : 'hover:bg-card/70 border-border'}`}
          >
            <Image src="/telescope/kepler.png" alt="Kepler" width={56} height={56} className="h-14 w-14 object-contain" />
            <div className="text-left">
              <div className="text-base font-semibold">Kepler / K2</div>
              <div className="text-xs text-muted-foreground">Deep stare • Transit photometry</div>
            </div>
          </button>
          <button
            onClick={() => setActive('tess')}
            aria-pressed={active==='tess'}
            className={`group relative flex items-center gap-4 px-6 py-4 rounded-2xl border transition-all shadow-sm ${active==='tess' ? 'bg-primary/10 border-primary/40 ring-2 ring-primary/30' : 'hover:bg-card/70 border-border'}`}
          >
            <Image src="/telescope/tess.png" alt="TESS" width={56} height={56} className="h-14 w-14 object-contain" />
            <div className="text-left">
              <div className="text-base font-semibold">TESS</div>
              <div className="text-xs text-muted-foreground">All‑sky sectors • Bright nearby stars</div>
            </div>
          </button>
        </div>
      </div>

      {/* Content */}
      <TelescopeFlow focus={active} />
    </section>
  )
}


