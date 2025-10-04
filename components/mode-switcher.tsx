"use client"

import { useMode } from "@/lib/mode-context"
import { Microscope, Compass } from "lucide-react"
import Image from "next/image"
import { motion } from "framer-motion"

export function ModeSwitcher({ compact = false }: { compact?: boolean }) {
  const { mode, setMode } = useMode()

  if (compact) {
    return (
      <div className="flex items-center gap-1 p-0.5 bg-card border border-border rounded-lg text-xs">
        <button
          onClick={() => setMode("kepler")}
          className={`relative px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-md font-medium transition-all flex items-center gap-1.5 ${
            mode === "kepler" ? "text-white" : "text-muted-foreground hover:text-foreground"
          }`}
          aria-label="Kepler"
          title="Kepler"
        >
          {mode === "kepler" && (
            <motion.div
              layoutId="mode-background-compact"
              className="absolute inset-0 bg-gradient-to-r from-primary to-accent rounded-md"
              transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
            />
          )}
          <span className="relative z-10 block">
            <Image src="/telescope/kepler.png" alt="Kepler" width={16} height={16} className="h-3 w-3 object-contain" />
          </span>
        </button>

        <button
          onClick={() => setMode("tess")}
          className={`relative px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-md font-medium transition-all flex items-center gap-1.5 ${
            mode === "tess" ? "text-white" : "text-muted-foreground hover:text-foreground"
          }`}
          aria-label="TESS"
          title="TESS"
        >
          {mode === "tess" && (
            <motion.div
              layoutId="mode-background-compact"
              className="absolute inset-0 bg-gradient-to-r from-primary to-accent rounded-md"
              transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
            />
          )}
          <span className="relative z-10 block">
            <Image src="/telescope/tess.png" alt="TESS" width={16} height={16} className="h-3 w-3 object-contain" />
          </span>
        </button>
        <button
          onClick={() => setMode("explorer")}
          className={`relative px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-md font-medium transition-all flex items-center gap-1.5 ${
            mode === "explorer" ? "text-white" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {mode === "explorer" && (
            <motion.div
              layoutId="mode-background-compact"
              className="absolute inset-0 bg-gradient-to-r from-primary to-accent rounded-md"
              transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
            />
          )}
          <Compass className="h-3 w-3 relative z-10" />
          <span className="relative z-10 hidden sm:inline">Explorador</span>
        </button>

        <button
          onClick={() => setMode("researcher")}
          className={`relative px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-md font-medium transition-all flex items-center gap-1.5 ${
            mode === "researcher" ? "text-white" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {mode === "researcher" && (
            <motion.div
              layoutId="mode-background-compact"
              className="absolute inset-0 bg-gradient-to-r from-accent to-secondary rounded-md"
              transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
            />
          )}
          <Microscope className="h-3 w-3 relative z-10" />
          <span className="relative z-10 hidden sm:inline">Pesquisador</span>
        </button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-1 sm:gap-2 p-0.5 sm:p-1 bg-card border border-border rounded-xl">
      <button
        onClick={() => setMode("kepler")}
        className={`relative px-3 py-2 md:px-6 md:py-3 rounded-lg font-medium transition-all flex items-center gap-2 ${
          mode === "kepler" ? "text-white" : "text-muted-foreground hover:text-foreground"
        }`}
        aria-label="Kepler"
        title="Kepler"
      >
        {mode === "kepler" && (
          <motion.div
            layoutId="mode-background"
            className="absolute inset-0 bg-gradient-to-r from-primary to-accent rounded-lg glow-effect"
            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
          />
        )}
        <span className="relative z-10 block">
          <Image src="/telescope/kepler.png" alt="Kepler" width={20} height={20} className="h-4 w-4 object-contain" />
        </span>
      </button>

      <button
        onClick={() => setMode("tess")}
        className={`relative px-3 py-2 md:px-6 md:py-3 rounded-lg font-medium transition-all flex items-center gap-2 ${
          mode === "tess" ? "text-white" : "text-muted-foreground hover:text-foreground"
        }`}
        aria-label="TESS"
        title="TESS"
      >
        {mode === "tess" && (
          <motion.div
            layoutId="mode-background"
            className="absolute inset-0 bg-gradient-to-r from-primary to-accent rounded-lg glow-effect"
            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
          />
        )}
        <span className="relative z-10 block">
          <Image src="/telescope/tess.png" alt="TESS" width={20} height={20} className="h-4 w-4 object-contain" />
        </span>
      </button>
      <button
        onClick={() => setMode("explorer")}
        className={`relative px-3 py-2 md:px-6 md:py-3 rounded-lg font-medium transition-all flex items-center gap-2 ${
          mode === "explorer" ? "text-white" : "text-muted-foreground hover:text-foreground"
        }`}
      >
        {mode === "explorer" && (
          <motion.div
            layoutId="mode-background"
            className="absolute inset-0 bg-gradient-to-r from-primary to-accent rounded-lg glow-effect"
            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
          />
        )}
        <Compass className="h-4 w-4 relative z-10" />
        <span className="relative z-10 hidden sm:inline">Explorador</span>
      </button>

      <button
        onClick={() => setMode("researcher")}
        className={`relative px-3 py-2 md:px-6 md:py-3 rounded-lg font-medium transition-all flex items-center gap-2 ${
          mode === "researcher" ? "text-white" : "text-muted-foreground hover:text-foreground"
        }`}
      >
        {mode === "researcher" && (
          <motion.div
            layoutId="mode-background"
            className="absolute inset-0 bg-gradient-to-r from-accent to-secondary rounded-lg glow-effect"
            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
          />
        )}
        <Microscope className="h-4 w-4 relative z-10" />
        <span className="relative z-10 hidden sm:inline">Pesquisador</span>
      </button>
    </div>
  )
}
