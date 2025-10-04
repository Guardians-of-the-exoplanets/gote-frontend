"use client"

import Image from "next/image"
import { ModeSwitcher } from "@/components/mode-switcher"
import { useEffect, useState } from "react"

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 80)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <header
      className={`border-b border-border/50 bg-background/80 backdrop-blur-xl sticky top-0 z-50 transition-all duration-300 ${
        isScrolled ? "opacity-0 -translate-y-full pointer-events-none" : "opacity-100 translate-y-0"
      }`}
    >
      <div className="container mx-auto px-3 sm:px-4 py-2 sm:py-4 flex items-center justify-between max-w-7xl">
        <div className="flex items-center gap-2 sm:gap-3">
          <Image
            src="/logo.png"
            alt="Guardians of The Exoplanets"
            width={180}
            height={36}
            className="h-9 sm:h-12 w-auto"
            priority
          />
        </div>
        <div className="scale-90 sm:scale-100">
          <ModeSwitcher />
        </div>
      </div>
    </header>
  )
}
