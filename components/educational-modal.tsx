"use client"

import { Dialog, DialogContent } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Sparkles, Globe, Telescope, Atom, Layers, Lightbulb, X, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export type EducationalTopic = "what-is" | "discovery" | "types" | "characteristics" | "importance"

interface EducationalModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  topic: EducationalTopic
}

const educationalContent = {
  "what-is": {
    title: "O que é um Exoplaneta?",
    subtitle: "Entenda os mundos além do nosso Sistema Solar",
    icon: Globe,
    gradient: "from-blue-600 via-cyan-500 to-teal-400",
    accentColor: "blue",
    sections: [
      {
        subtitle: "Definição",
        content:
          "Também chamado de planeta extrassolar, um exoplaneta é qualquer planeta que orbita uma estrela fora do Sistema Solar. Apesar de compartilharem características com os planetas do nosso sistema, como ter massa suficiente para ser esférico, os exoplanetas não precisam orbitar o Sol.",
      },
      {
        subtitle: "Números Impressionantes",
        content:
          "Até agosto de 2024, os astrônomos confirmaram a detecção de 5.743 exoplanetas em diferentes regiões da Via Láctea. Além disso, já existem milhares de outros candidatos que ainda serão analisados para confirmação posterior.",
        stats: [
          { label: "Exoplanetas Confirmados", value: "5.743" },
          { label: "Primeira Descoberta", value: "1992" },
        ],
        highlight: "Os primeiros exoplanetas só foram confirmados em 1992!",
      },
      {
        subtitle: "Diversidade Extraordinária",
        content:
          "Embora muitos exoplanetas sejam semelhantes aos planetas do Sistema Solar, alguns apresentam características que ainda são misteriosas e inexplicáveis para o atual entendimento da ciência. Identificamos mundos de lava cobertos por mares derretidos, planetas inchados com a densidade de isopor e núcleos densos de planetas ainda orbitando suas estrelas.",
      },
    ],
  },
  discovery: {
    title: "Como Descobrimos Exoplanetas?",
    subtitle: "Métodos e tecnologias de detecção",
    icon: Telescope,
    gradient: "from-purple-600 via-pink-500 to-rose-400",
    accentColor: "purple",
    sections: [
      {
        subtitle: "O Desafio",
        content:
          "A detecção de novos exoplanetas não é uma tarefa simples. O universo é tão grande e extenso que é como buscar uma agulha em um palheiro. Por isso, os astrônomos desenvolveram estratégias inteligentes para encontrá-los.",
      },
      {
        subtitle: "Método de Velocidade Radial",
        content:
          "Em 1992, os primeiros exoplanetas foram descobertos por meio deste método, que faz a detecção com auxílio do efeito Doppler. Observa-se o movimento da estrela causado pela gravidade do planeta.",
        badge: "Primeiro Método",
      },
      {
        subtitle: "Método de Trânsito",
        content:
          "Lançado em 2009, o telescópio espacial Kepler marcou o início deste método, que analisa o brilho de uma estrela para verificar se ela sofre eclipses causados por exoplanetas.",
        stats: [
          { label: "Kepler - Confirmados", value: "3.321" },
          { label: "TESS - Confirmados", value: "542" },
        ],
        highlight: "O telescópio TESS (2018) já confirmou 542 planetas e estuda 7.204 candidatos!",
      },
      {
        subtitle: "Outros Métodos",
        content:
          "Existem também o método de imagem direta, que busca a emissão de luz refletida por um planeta, e o método de microlente gravitacional, que observa a curvatura da luz de uma estrela causada pela presença de planetas.",
      },
    ],
  },
  types: {
    title: "Tipos de Exoplanetas",
    subtitle: "Classificação e características principais",
    icon: Layers,
    gradient: "from-orange-600 via-amber-500 to-yellow-400",
    accentColor: "orange",
    sections: [
      {
        subtitle: "Gigantes Gasosos",
        content:
          "Planetas do tamanho de Saturno ou Júpiter, ou muito maiores. Os planetas do tipo 'Júpiter quente' são gigantes gasosos que podem alcançar temperaturas extremamente altas devido à sua proximidade com a estrela que orbitam.",
        badge: "Mais Comuns",
        badgeVariant: "default",
      },
      {
        subtitle: "Planetas Netunianos (Mini-Netuno)",
        content:
          "São semelhantes em tamanho a Netuno ou Urano no nosso Sistema Solar. Sua composição interna é mista, com um núcleo rochoso, mas sua atmosfera é composta principalmente por hidrogênio e hélio. A maior parte dos exoplanetas descobertos nos últimos anos são deste tipo.",
        badge: "Muito Frequentes",
        badgeVariant: "secondary",
      },
      {
        subtitle: "Superterra",
        content:
          "São planetas terrestres mais massivos que a Terra, mas mais leves que Netuno. Podem ter ou não uma atmosfera. Suas características são variadas, algumas semelhantes às da Terra, mas consideravelmente maiores.",
        badge: "Potencial Habitável",
        badgeVariant: "outline",
      },
      {
        subtitle: "Planetas Rochosos (Terrestres)",
        content:
          "Têm o tamanho da Terra ou são menores, compostos de rocha, silicato, água ou carbono. Podem ter atmosferas, oceanos e outros sinais que sugerem a possibilidade de formação de vida como a conhecemos.",
        badge: "Mais Interessantes",
        badgeVariant: "destructive",
      },
    ],
  },
  characteristics: {
    title: "Características Únicas",
    subtitle: "Descobertas fascinantes e mundos extremos",
    icon: Atom,
    gradient: "from-emerald-600 via-green-500 to-lime-400",
    accentColor: "green",
    sections: [
      {
        subtitle: "Composições Variadas",
        content:
          "Ao medir os tamanhos e massas dos exoplanetas, podemos ver composições que variam de rochosas (como a Terra e Vênus) a ricas em gás (como Júpiter e Saturno). Alguns planetas podem ser dominados por água ou gelo, enquanto outros são dominados por ferro ou carbono.",
      },
      {
        subtitle: "Mundos Extremos",
        content:
          "Existem mundos de lava cobertos por mares derretidos, planetas com a densidade de isopor, e exoplanetas completamente cobertos por água. Cada descoberta desafia nossa compreensão do que é possível no universo.",
        highlight: "Alguns exoplanetas são tão únicos que não se encaixam em nenhuma categoria conhecida!",
      },
      {
        subtitle: "Planetas Nômades",
        content:
          "Alguns planetas se formam ao redor de uma estrela, mas depois são ejetados para vagar sozinhos pelo espaço, sem orbitar nenhuma estrela. Estes são chamados de planetas nômades ou planetas órfãos.",
        badge: "Fenômeno Raro",
      },
    ],
  },
  importance: {
    title: "Por Que Estudar Exoplanetas?",
    subtitle: "Impacto científico e questões fundamentais",
    icon: Lightbulb,
    gradient: "from-indigo-600 via-violet-500 to-purple-400",
    accentColor: "indigo",
    sections: [
      {
        subtitle: "Questões Fundamentais",
        content:
          "O estudo dos exoplanetas pode ajudar a responder questões primordiais sobre o universo: Estamos sozinhos? Como os sistemas planetários se formam? Quais condições são necessárias para a vida?",
      },
      {
        subtitle: "Busca por Vida",
        content:
          "Alguns exoplanetas podem apresentar semelhanças com a Terra e até oferecer condições favoráveis ao desenvolvimento da vida. Contudo, é necessário estudá-los com mais profundidade para confirmar essas possibilidades.",
        highlight: "A descoberta de vida fora da Terra seria uma das maiores descobertas da humanidade!",
      },
      {
        subtitle: "Compreensão do Nosso Sistema",
        content:
          "Estudar exoplanetas nos ajuda a entender melhor nosso próprio Sistema Solar e como ele se formou. Cada exoplaneta descoberto adiciona uma peça ao quebra-cabeça da formação planetária.",
      },
      {
        subtitle: "Avanço Tecnológico",
        content:
          "A busca por exoplanetas impulsiona o desenvolvimento de novas tecnologias de telescópios, sensores e análise de dados, incluindo inteligência artificial e machine learning para processar grandes volumes de informações astronômicas.",
        badge: "IA & ML",
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
