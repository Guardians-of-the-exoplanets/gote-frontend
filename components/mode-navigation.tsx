"use client"

import { useMode } from "@/lib/mode-context"
import { Button } from "@/components/ui/button"
import { Sparkles, Globe, Telescope, Layers, Atom, Lightbulb } from "lucide-react"
import { useEffect, useState } from "react"
import { ModeSwitcher } from "@/components/mode-switcher"
import Image from "next/image"
import { EducationalModal, type EducationalTopic } from "@/components/educational-modal"

export function ModeNavigation() {
  const { mode } = useMode()
  const [isScrolled, setIsScrolled] = useState(false)
  const [headerHeight, setHeaderHeight] = useState(0)
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedTopic, setSelectedTopic] = useState<EducationalTopic>("what-is")

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 80)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    const measure = () => {
      const header = document.querySelector("header") as HTMLElement | null
      setHeaderHeight(header?.offsetHeight || 0)
    }
    measure()
    window.addEventListener("resize", measure)
    return () => window.removeEventListener("resize", measure)
  }, [])

  const educationalButtons = [
    { topic: "what-is" as EducationalTopic, label: "O que é?", icon: Globe },
    { topic: "discovery" as EducationalTopic, label: "Descoberta", icon: Telescope },
    { topic: "types" as EducationalTopic, label: "Tipos", icon: Layers },
    { topic: "characteristics" as EducationalTopic, label: "Características", icon: Atom },
    { topic: "importance" as EducationalTopic, label: "Importância", icon: Lightbulb },
  ]

  const handleEducationalClick = (topic: EducationalTopic) => {
    setSelectedTopic(topic)
    setModalOpen(true)
  }

  return (
    <>
      <nav
        className={`border-b border-border/30 bg-card/30 backdrop-blur-sm sticky transition-all duration-300 ${
          isScrolled ? "shadow-lg bg-card/95" : ""
        }`}
        style={{ zIndex: 40, top: isScrolled ? 0 : headerHeight }}
      >
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="grid grid-cols-[auto_1fr_auto] items-center py-3 gap-2">
            <div className="flex items-center gap-2">
              {isScrolled && (
                <Image
                  src="/logoMinimizada.png"
                  alt="ExoLab mini logo"
                  width={80}
                  height={24}
                  className="h-6 w-auto sm:h-8"
                  priority
                />
              )}
            </div>

            <div className="flex items-center justify-center gap-1 md:gap-3 overflow-x-auto">
                {educationalButtons.map((button) => {
                  const Icon = button.icon
                  return (
                    <Button
                      key={button.topic}
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEducationalClick(button.topic)}
                      className="flex items-center gap-2 px-3 md:px-4 py-2 text-sm text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-all whitespace-nowrap group"
                    >
                      <Icon className="h-4 w-4 group-hover:scale-110 transition-transform" />
                      <span className="hidden sm:inline">{button.label}</span>
                    </Button>
                  )
                })}
            </div>

            <div className="justify-self-end">
              {isScrolled && (
                <div className="scale-90 origin-right">
                  <ModeSwitcher compact />
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      <EducationalModal open={modalOpen} onOpenChange={setModalOpen} topic={selectedTopic} />
    </>
  )
}
