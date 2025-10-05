"use client"

import { Dialog, DialogContent } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Sparkles, Globe, Telescope, Atom, Layers, Lightbulb, X, ChevronRight, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"

export type EducationalTopic = "what-is" | "discovery" | "types" | "characteristics" | "importance"

interface EducationalModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  topic: EducationalTopic
}

const educationalContent = {
  "what-is": {
    title: "What is an Exoplanet?",
    subtitle: "Understanding worlds beyond our Solar System",
    icon: Globe,
    gradient: "from-blue-600 via-cyan-500 to-teal-400",
    accentColor: "blue",
    sections: [
      {
        subtitle: "Definition",
        content:
          "Also called an extrasolar planet, an exoplanet is any planet that orbits a star other than the Sun. While many share properties with Solar‑System planets (e.g., having enough mass to be roughly spherical), they do not orbit our Sun.",
      },
      {
        subtitle: "Big picture",
        content:
          "Astronomers have confirmed more than 5,600 exoplanets across the Milky Way, with thousands of additional candidates under review. These numbers grow continuously as surveys add new detections.",
        stats: [
          { label: "Confirmed exoplanets (approx.)", value: "5,600+" },
          { label: "First confirmed discovery", value: "1992" },
        ],
        highlight: "The first confirmed exoplanets were found in 1992.",
      },
      {
        subtitle: "Extraordinary diversity",
        content:
          "Some exoplanets resemble those in our Solar System, while others are unlike anything we’ve seen: lava worlds with oceans of molten rock, ultra‑puffed planets with very low density, and dense planetary cores continuing to orbit their stars.",
      },
    ],
  },
  discovery: {
    title: "How Do We Discover Exoplanets?",
    subtitle: "Detection methods and technologies",
    icon: Telescope,
    gradient: "from-purple-600 via-pink-500 to-rose-400",
    accentColor: "purple",
    sections: [
      {
        subtitle: "The challenge",
        content:
          "Exoplanet detection is hard — stars outshine their planets by orders of magnitude. Astronomers use clever, indirect techniques to find planets in that glare.",
      },
      {
        subtitle: "Radial velocity",
        content:
          "Measures the tiny wobble in a star’s spectrum caused by an orbiting planet (Doppler effect). In 1995 it revealed 51 Pegasi b, the first planet found around a Sun‑like star.",
        badge: "Milestone (1995)",
      },
      {
        subtitle: "Transit method",
        content:
          "Detects the small dip in a star’s brightness when a planet crosses in front of it. NASA’s Kepler (2009) and TESS (2018) transformed this approach, finding thousands of candidates and many confirmed planets.",
        highlight: "Transit surveys (Kepler/TESS) have produced thousands of candidates and hundreds to thousands of confirmed planets.",
      },
      {
        subtitle: "Other methods",
        content:
          "Direct imaging captures faint reflected/emitted light from wide‑orbit planets. Gravitational microlensing uses the bending of starlight by a foreground system to infer planets. Pulsar timing (1992) revealed the first confirmed exoplanets around a pulsar.",
      },
    ],
  },
  types: {
    title: "Types of Exoplanets",
    subtitle: "Main classes and characteristics",
    icon: Layers,
    gradient: "from-orange-600 via-amber-500 to-yellow-400",
    accentColor: "orange",
    sections: [
      {
        subtitle: "Gas giants",
        content:
          "Saturn‑ to Jupiter‑size (or larger) planets. ‘Hot Jupiters’ are gas giants heated to high temperatures by close‑in orbits around their stars.",
        badge: "Early detections",
        badgeVariant: "default",
      },
      {
        subtitle: "Sub‑Neptunes (mini‑Neptunes)",
        content:
          "Similar in size to Neptune/Uranus. Likely mixed composition (rock/ice cores with H/He envelopes). They are among the most frequent types found in transit surveys.",
        badge: "Common in surveys",
        badgeVariant: "secondary",
      },
      {
        subtitle: "Super‑Earths",
        content:
          "Rocky planets more massive than Earth but lighter than Neptune. They may or may not retain atmospheres and can have very diverse properties.",
        badge: "Potentially interesting",
        badgeVariant: "outline",
      },
      {
        subtitle: "Rocky (terrestrial) planets",
        content:
          "Earth‑size or smaller, composed mainly of silicates/iron/ice. They may host atmospheres and oceans — prime targets when searching for life‑friendly conditions.",
        badge: "High interest",
        badgeVariant: "destructive",
      },
    ],
  },
  characteristics: {
    title: "Unique Characteristics",
    subtitle: "Fascinating discoveries and extreme worlds",
    icon: Atom,
    gradient: "from-emerald-600 via-green-500 to-lime-400",
    accentColor: "green",
    sections: [
      {
        subtitle: "Varied compositions",
        content:
          "From rocky (Earth/Venus‑like) to gas‑rich (Jupiter/Saturn‑like), and potentially water‑ or carbon‑dominated. Mass–radius measurements reveal a wide continuum of possibilities.",
      },
      {
        subtitle: "Extreme worlds",
        content:
          "Lava worlds with molten oceans, ultra‑low‑density ‘puffy’ planets, and water‑rich worlds have all been proposed or observed. Each discovery pushes our understanding of planet formation.",
        highlight: "Some exoplanets don’t fit neatly into any known category.",
      },
      {
        subtitle: "Rogue planets",
        content:
          "Some planets are ejected from their systems and drift through space without a host star. These are called rogue or orphan planets.",
        badge: "Rare phenomenon",
      },
    ],
  },
  importance: {
    title: "Why Study Exoplanets?",
    subtitle: "Scientific impact and fundamental questions",
    icon: Lightbulb,
    gradient: "from-indigo-600 via-violet-500 to-purple-400",
    accentColor: "indigo",
    sections: [
      {
        subtitle: "Fundamental questions",
        content:
          "Exoplanet science addresses big questions: Are we alone? How do planetary systems form and evolve? What conditions allow life to emerge?",
      },
      {
        subtitle: "Search for life",
        content:
          "Some exoplanets may resemble Earth and could offer conditions favorable to life. Detailed follow‑up is required to test these possibilities.",
        highlight: "Finding life beyond Earth would be one of humanity’s greatest discoveries.",
      },
      {
        subtitle: "Understanding our own system",
        content:
          "Studying exoplanets helps us place the Solar System in context and refine models of planet formation and evolution.",
      },
      {
        subtitle: "Technological advances",
        content:
          "The search for exoplanets drives innovation in telescopes, detectors and data analysis — including AI/ML methods to process massive astronomical datasets.",
        badge: "AI & ML",
      },
    ],
  },
}

export function EducationalModal({ open, onOpenChange, topic }: EducationalModalProps) {
  const content = educationalContent[topic]
  const Icon = content.icon

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] sm:w-[90vw] md:w-[85vw] lg:w-[80vw] xl:w-[75vw] 2xl:max-w-[1280px] h-[90vh] max-h-[720px] p-0 overflow-hidden border-0 bg-transparent shadow-2xl">
        <div className="relative h-full bg-gradient-to-br from-background/98 via-background/95 to-background/98 backdrop-blur-2xl rounded-3xl overflow-hidden border border-white/10 shadow-[0_0_100px_rgba(0,0,0,0.4)]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.05),rgba(255,255,255,0))] pointer-events-none" />
          <div className="absolute inset-0 bg-grid-white/[0.015] pointer-events-none" />
          <div
            className={`absolute -top-24 -right-24 w-[500px] h-[500px] bg-gradient-to-br ${content.gradient} opacity-[0.12] blur-[100px] rounded-full pointer-events-none animate-pulse`}
            style={{ animationDuration: "8s" }}
          />
          <div
            className={`absolute -bottom-32 -left-32 w-[450px] h-[450px] bg-gradient-to-tr ${content.gradient} opacity-[0.08] blur-[100px] rounded-full pointer-events-none animate-pulse`}
            style={{ animationDuration: "10s", animationDelay: "2s" }}
          />

          <div className="relative">
            <div className={`absolute inset-0 bg-gradient-to-r ${content.gradient} opacity-95 pointer-events-none`} />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/30 pointer-events-none" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.1),transparent_50%)] pointer-events-none" />

            <div className="relative z-10 px-8 py-6 text-white">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onOpenChange(false)}
                className="absolute top-4 right-4 h-9 w-9 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white transition-all duration-300 hover:scale-110 hover:rotate-90 shadow-lg z-20"
                aria-label="Fechar"
              >
                <X className="h-4 w-4" />
              </Button>

              <div className="flex items-center gap-5">
                <div className="relative group">
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${content.gradient} blur-xl opacity-70 rounded-2xl group-hover:opacity-90 transition-opacity duration-500`}
                  />
                  <div className="relative p-3 bg-white/20 backdrop-blur-xl rounded-2xl border border-white/30 shadow-2xl group-hover:scale-105 transition-transform duration-500">
                    <Icon className="h-8 w-8" strokeWidth={1.5} />
                  </div>
                </div>

                <div className="flex-1">
                  <h2 className="text-3xl font-bold mb-1 tracking-tight leading-tight drop-shadow-lg">
                    {content.title}
                  </h2>
                  <p className="text-white/90 text-base font-light tracking-wide">{content.subtitle}</p>
                </div>
              </div>
            </div>
          </div>

          <ScrollArea className="h-[calc(90vh-140px)] max-h-[calc(720px-140px)]">
            <div className="px-6 sm:px-8 lg:px-10 py-6 space-y-6 pb-12">
              {/* Live reference (opens in new tab) */}
              <div className="flex items-center justify-end">
                <a
                  href="https://exoplanetarchive.ipac.caltech.edu/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-xs px-3 py-1.5 rounded-md border hover:bg-card/70 transition-colors"
                  title="NASA Exoplanet Archive"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  <span>NASA Exoplanet Archive</span>
                </a>
              </div>
              {content.sections.map((section, index) => (
                <div
                  key={index}
                  className="group relative bg-gradient-to-br from-card/60 to-card/30 backdrop-blur-md rounded-2xl p-6 lg:p-7 border border-white/5 hover:border-white/15 transition-all duration-500 hover:shadow-xl hover:shadow-primary/10 hover:scale-[1.01]"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`h-2 w-2 rounded-full bg-gradient-to-r ${content.gradient} shadow-lg shadow-primary/50 group-hover:scale-125 transition-transform duration-300`}
                      />
                      <h3 className="text-xl lg:text-2xl font-semibold text-foreground flex items-center gap-2 tracking-tight">
                        {section.subtitle}
                        <ChevronRight className="h-4 w-4 lg:h-5 lg:w-5 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
                      </h3>
                    </div>
                    {section.badge && (
                      <Badge
                        variant={section.badgeVariant || "secondary"}
                        className="text-xs font-semibold px-3 py-1 shadow-md backdrop-blur-sm w-fit"
                      >
                        {section.badge}
                      </Badge>
                    )}
                  </div>

                  <p className="text-muted-foreground leading-relaxed text-[15px] lg:text-[16px] mb-4 text-pretty">
                    {section.content}
                  </p>

                  {section.stats && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5">
                      {section.stats.map((stat, statIndex) => (
                        <div
                          key={statIndex}
                          className="relative group/stat bg-gradient-to-br from-background/90 to-background/50 backdrop-blur-md rounded-xl p-5 border border-white/5 hover:border-white/15 transition-all duration-300 hover:shadow-lg overflow-hidden"
                        >
                          <div
                            className={`absolute inset-0 bg-gradient-to-br ${content.gradient} opacity-0 group-hover/stat:opacity-5 transition-opacity duration-500`}
                          />
                          <div className="relative">
                            <div className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent mb-2 tracking-tight">
                              {stat.value}
                            </div>
                            <div className="text-xs lg:text-sm text-muted-foreground font-medium tracking-wide">
                              {stat.label}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {section.highlight && (
                    <div
                      className={`relative mt-5 bg-gradient-to-r ${content.gradient} p-[1.5px] rounded-xl overflow-hidden shadow-lg`}
                    >
                      <div className="bg-background/98 backdrop-blur-md rounded-xl p-5">
                        <div className="flex items-start gap-3">
                          <div
                            className={`p-2 rounded-lg bg-gradient-to-br ${content.gradient} shadow-lg flex-shrink-0`}
                          >
                            <Sparkles className="h-4 w-4 text-white" />
                          </div>
                          <p className="text-[14px] lg:text-[15px] font-medium text-foreground leading-relaxed pt-1 text-pretty">
                            {section.highlight}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              <div className="flex items-center justify-center gap-3 pt-4 pb-2">
                <div className={`h-[3px] w-10 rounded-full bg-gradient-to-r ${content.gradient} opacity-40`} />
                <div className="flex items-center gap-2 text-muted-foreground/70">
                  <Sparkles className="h-3 w-3" />
                  <span className="text-xs lg:text-sm font-semibold tracking-wider">Guardians of The Exoplanets Educational Content</span>
                  <Sparkles className="h-3 w-3" />
                </div>
                <div className={`h-[3px] w-10 rounded-full bg-gradient-to-r ${content.gradient} opacity-40`} />
              </div>
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  )
}
