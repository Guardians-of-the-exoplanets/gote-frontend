"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

type Mode = "researcher" | "explorer" | "kepler" | "tess"

interface ModeContextType {
  mode: Mode
  setMode: (mode: Mode) => void
}

const ModeContext = createContext<ModeContextType | undefined>(undefined)

export function ModeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<Mode>("explorer")

  return <ModeContext.Provider value={{ mode, setMode }}>{children}</ModeContext.Provider>
}

export function useMode() {
  const context = useContext(ModeContext)
  if (context === undefined) {
    throw new Error("useMode must be used within a ModeProvider")
  }
  return context
}
