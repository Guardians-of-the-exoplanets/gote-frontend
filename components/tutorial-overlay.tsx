"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import {
  X,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Rocket,
  Database,
  Settings,
  BarChart3,
  Globe,
  Download,
  Microscope,
  Layers,
  Eye,
  BookOpen,
  Play,
  Pause,
} from "lucide-react"
import { useMode } from "@/lib/mode-context"
import { Progress } from "@/components/ui/progress"

interface TutorialStep {
  id: string
  title: string
  description: string
  details: string[]
  inputs?: { name: string; description: string }[]
  outputs?: { name: string; description: string }[]
  tips?: string[]
  imageQuery?: string
  icon: any
}

const explorerSteps: TutorialStep[] = [
  {
    id: "intro",
    title: "Bem-vindo ao Guardians of The Exoplanets - Modo Explorador",
    description:
      "O Modo Explorador foi criado para tornar a descoberta de exoplanetas acessível a todos. Você vai aprender a identificar se um sinal astronômico é realmente um planeta orbitando outra estrela!",
    details: [
      "Interface simplificada e intuitiva para iniciantes",
      "Processo guiado em 3 etapas principais",
      "Resultados visuais e fáceis de interpretar",
      "Visualização 3D interativa do exoplaneta descoberto",
    ],
    tips: [
      "Não precisa ser um astrônomo para usar o Guardians of The Exoplanets",
      "Cada campo tem explicações detalhadas",
      "Experimente com diferentes valores para ver como afetam o resultado",
    ],
    imageQuery: "astronomer looking at stars through telescope, futuristic interface",
    icon: Rocket,
  },
  {
    id: "data-input",
    title: "Entrada de Dados",
    description:
      "Primeiro, você precisa inserir os dados observados do seu candidato a exoplaneta. Esses dados vêm de telescópios que medem a luz das estrelas.",
    details: [
      "Quando um planeta passa na frente de sua estrela, ele bloqueia um pouco da luz",
      "Medimos quanto tempo leva para o planeta completar uma órbita (Período Orbital)",
      "Também medimos o tamanho do planeta comparado com a Terra",
      "Outros dados como temperatura e características da estrela ajudam na análise",
    ],
    inputs: [
      {
        name: "Período Orbital",
        description: "Tempo que o planeta leva para dar uma volta completa ao redor da estrela (em dias)",
      },
      { name: "Raio do Planeta", description: "Tamanho do planeta em relação à Terra (1.0 = tamanho da Terra)" },
      {
        name: "Temperatura de Equilíbrio",
        description: "Temperatura estimada do planeta baseada na distância da estrela (em Kelvin)",
      },
      { name: "Razão Sinal/Ruído", description: "Qualidade do sinal detectado (valores maiores = melhor qualidade)" },
    ],
    outputs: [
      {
        name: "Dados Validados",
        description: "Sistema verifica se os valores estão dentro de limites físicos realistas",
      },
    ],
    tips: [
      "Campos obrigatórios estão marcados com asterisco (*)",
      "Passe o mouse sobre o ícone de informação para ver explicações detalhadas",
      "Você pode inserir dados manualmente ou fazer upload de um arquivo CSV",
    ],
    imageQuery: "data entry form with astronomical parameters, modern UI",
    icon: Database,
  },
  {
    id: "classification",
    title: "Processo de Classificação",
    description:
      "Quando você clica em 'Classificar', nossa inteligência artificial analisa os dados usando algoritmos treinados com milhares de exoplanetas conhecidos.",
    details: [
      "O modelo compara seus dados com padrões de exoplanetas confirmados",
      "Também verifica se há características de falsos positivos (como sistemas binários)",
      "Calcula a probabilidade de ser um planeta real vs. um falso alarme",
      "Todo o processo leva apenas alguns segundos",
    ],
    outputs: [
      { name: "Classificação", description: "Confirmado, Candidato ou Falso Positivo" },
      { name: "Confiança", description: "Porcentagem de certeza da classificação (0-100%)" },
      { name: "Análise de Fatores", description: "Quais características influenciaram a decisão" },
    ],
    tips: [
      "Confiança acima de 70% indica alta probabilidade de ser um exoplaneta real",
      "Candidatos entre 50-70% podem precisar de observações adicionais",
      "Falsos positivos geralmente têm características de sistemas binários",
    ],
    imageQuery: "AI analyzing astronomical data, neural network visualization",
    icon: Sparkles,
  },
  {
    id: "results",
    title: "Interpretando os Resultados",
    description:
      "A aba de Resultados mostra se seu candidato é um exoplaneta confirmado, um candidato promissor ou um falso positivo.",
    details: [
      "Resultado principal mostra a classificação com ícone visual (✓ ou ✗)",
      "Medidor de confiança indica o quão certo o modelo está",
      "Análise de fatores-chave explica o que influenciou a decisão",
      "Seção de próximos passos guia você sobre o que fazer depois",
    ],
    outputs: [
      { name: "Status do Candidato", description: "Confirmado, Candidato ou Falso Positivo com explicação visual" },
      { name: "Nível de Confiança", description: "Porcentagem e barra de progresso visual" },
      { name: "Fatores-Chave", description: "Sinal de trânsito, características e probabilidade de falso positivo" },
      { name: "Recomendações", description: "Sugestões de próximos passos baseadas no resultado" },
    ],
    tips: [
      "Leia a explicação educativa para entender como interpretamos os dados",
      "Verifique os fatores-chave para entender por que chegamos a essa conclusão",
      "Siga as recomendações de próximos passos para explorar mais",
    ],
    imageQuery: "scientific results dashboard with charts and confidence meters",
    icon: BarChart3,
  },
  {
    id: "visualization",
    title: "Visualização 3D Interativa",
    description:
      "Se seu candidato for confirmado ou provável, você pode ver uma representação 3D do exoplaneta comparado com a Terra!",
    details: [
      "Visualização lado a lado: Terra vs. Exoplaneta descoberto",
      "Rotação interativa - clique e arraste para girar os planetas",
      "Textura da Terra real e textura gerada para o exoplaneta",
      "Informações detalhadas sobre tamanho, temperatura e características",
    ],
    outputs: [
      { name: "Modelo 3D da Terra", description: "Representação realista do nosso planeta para comparação" },
      { name: "Modelo 3D do Exoplaneta", description: "Visualização gerada baseada nos dados classificados" },
      { name: "Dados Comparativos", description: "Tabela mostrando diferenças entre Terra e exoplaneta" },
    ],
    tips: [
      "Use o mouse para rotacionar e explorar os planetas em 3D",
      "A cor e textura do exoplaneta são geradas baseadas em temperatura e tipo",
      "Compare o tamanho relativo para entender a escala do exoplaneta",
    ],
    imageQuery: "3D planet comparison Earth vs exoplanet, interactive visualization",
    icon: Globe,
  },
  {
    id: "export",
    title: "Exportando seus Resultados",
    description:
      "Salve e compartilhe suas descobertas! Você pode exportar os resultados em diferentes formatos para uso posterior.",
    details: [
      "Formato JSON: Dados estruturados para análise programática",
      "Formato CSV: Compatível com Excel e outras ferramentas de planilha",
      "Relatório PDF: Documento formatado com gráficos e explicações",
      "Todos os dados da classificação, confiança e parâmetros incluídos",
    ],
    outputs: [
      { name: "Arquivo JSON", description: "Dados completos em formato estruturado" },
      { name: "Arquivo CSV", description: "Tabela com todos os parâmetros e resultados" },
      { name: "Relatório PDF", description: "Documento visual com gráficos e análise completa" },
    ],
    tips: [
      "Escolha JSON se for usar os dados em programação",
      "Use CSV para análise em Excel ou Google Sheets",
      "PDF é ideal para apresentações e compartilhamento",
    ],
    imageQuery: "data export options, file formats, download interface",
    icon: Download,
  },
]

const researcherSteps: TutorialStep[] = [
  {
    id: "intro",
    title: "Modo Pesquisador - Pipeline Científico Completo",
    description:
      "O Modo Pesquisador oferece controle total sobre o pipeline de classificação, com configurações avançadas, métricas detalhadas e ferramentas de análise profissional.",
    details: [
      "Arquitetura multi-branch: Transformer 1D + CNN 2D + MLP",
      "Suporte para formatos científicos: CSV, TFRecords, FITS",
      "Configuração completa de hiperparâmetros do modelo",
      "Métricas avançadas: ROC, Precision-Recall, Confusion Matrix",
      "Explicabilidade com SHAP e análise de importância de features",
      "Sistema de vetting para validação manual",
    ],
    tips: [
      "Ideal para pesquisadores e cientistas de dados",
      "Compatível com pipelines Kepler, K2 e TESS",
      "Suporta processamento em lote de múltiplos candidatos",
    ],
    imageQuery: "scientific research laboratory, advanced AI pipeline, data analysis",
    icon: Microscope,
  },
  {
    id: "data-input",
    title: "Entrada de Dados Avançada",
    description:
      "Suporte para múltiplos formatos de dados astronômicos e processamento em lote para análise de grandes volumes de candidatos.",
    details: [
      "CSV: Light curves e metadados tabulares",
      "TFRecords: Dados preprocessados do TensorFlow",
      "FITS: Formato padrão de astronomia com headers completos",
      "Processamento em lote: Múltiplos arquivos simultaneamente",
      "Conexão direta com MAST/ExoFOP para dados públicos",
    ],
    inputs: [
      { name: "Light Curves", description: "Séries temporais de fluxo estelar normalizado" },
      { name: "Metadados Estelares", description: "Temperatura, raio, massa e metalicidade da estrela hospedeira" },
      { name: "Parâmetros Orbitais", description: "Período, época, duração e profundidade do trânsito" },
      { name: "Centroid Motion", description: "Dados de movimento do centroide para detecção de falsos positivos" },
    ],
    outputs: [
      { name: "Dados Normalizados", description: "Light curves preprocessadas e normalizadas" },
      { name: "Features Extraídas", description: "Características automáticas extraídas dos dados brutos" },
    ],
    tips: [
      "Use TFRecords para melhor performance em grandes datasets",
      "FITS preserva todos os metadados originais",
      "Processamento em lote é ideal para catálogos completos",
    ],
    imageQuery: "astronomical data formats, CSV FITS TFRecords, batch processing",
    icon: Database,
  },
  {
    id: "model-config",
    title: "Configuração do Modelo",
    description:
      "Controle total sobre a arquitetura do modelo e hiperparâmetros para otimizar a classificação conforme suas necessidades.",
    details: [
      "Transformer 1D: Análise temporal com attention mechanism",
      "CNN 2D: Extração de features espaciais de phase-folded views",
      "MLP Fusion: Combinação de features + metadados estelares",
      "Physics-informed constraints: Restrições baseadas em leis físicas",
      "Hiperparâmetros ajustáveis: árvores, learning rate, épocas",
    ],
    inputs: [
      { name: "Número de Árvores", description: "Quantidade de árvores de decisão no ensemble (10-500)" },
      { name: "Taxa de Aprendizado", description: "Tamanho dos passos durante treinamento (0.001-0.1)" },
      { name: "Épocas de Treinamento", description: "Número de iterações sobre o dataset (10-100)" },
      { name: "Opções de Treinamento", description: "Incremental learning, federated learning, data augmentation" },
    ],
    outputs: [
      { name: "Modelo Configurado", description: "Arquitetura e hiperparâmetros prontos para treinamento" },
      { name: "Resumo da Configuração", description: "Visão geral dos parâmetros selecionados" },
    ],
    tips: [
      "Mais árvores = maior precisão, mas mais tempo de treinamento",
      "Learning rate menor = treinamento mais estável",
      "Use data augmentation para datasets pequenos",
    ],
    imageQuery: "neural network architecture, hyperparameter tuning, model configuration",
    icon: Settings,
  },
  {
    id: "pipeline",
    title: "Pipeline de Processamento",
    description:
      "Visualize cada etapa do pipeline de classificação em tempo real, desde a ingestão de dados até a predição final.",
    details: [
      "Ingestão: Carregamento e validação dos dados",
      "Preprocessamento: Normalização, detrending, remoção de outliers",
      "Feature Engineering: Extração de características relevantes",
      "Classificação: Modelo de ML faz a predição",
      "Pós-processamento: Calibração de probabilidades e vetting",
      "Métricas em tempo real de cada etapa",
    ],
    outputs: [
      { name: "Status do Pipeline", description: "Progresso de cada etapa com indicadores visuais" },
      { name: "Métricas de Performance", description: "Tempo de execução, uso de memória, throughput" },
      { name: "Logs Detalhados", description: "Informações técnicas de cada etapa do processamento" },
    ],
    tips: [
      "Acompanhe o pipeline em tempo real durante o processamento",
      "Verifique métricas de performance para otimização",
      "Logs ajudam a diagnosticar problemas nos dados",
    ],
    imageQuery: "data pipeline visualization, processing stages, real-time metrics",
    icon: Layers,
  },
  {
    id: "visualizations",
    title: "Visualizações Avançadas",
    description:
      "Explore seus dados e resultados através de visualizações interativas e gráficos científicos detalhados.",
    details: [
      "Light Curves: Visualização das séries temporais originais",
      "Phase-Folded Views: Trânsitos alinhados por fase orbital",
      "Distribuições: Histogramas de parâmetros e classificações",
      "Comparação 3D: Terra vs. Exoplaneta com texturas realistas",
      "Gráficos interativos com zoom, pan e export",
    ],
    outputs: [
      { name: "Gráficos Interativos", description: "Visualizações manipuláveis com controles avançados" },
      { name: "Modelos 3D", description: "Representações tridimensionais dos planetas descobertos" },
      { name: "Dashboards", description: "Painéis com múltiplas visualizações sincronizadas" },
    ],
    tips: [
      "Use zoom para examinar detalhes nas light curves",
      "Phase-folded views revelam a forma do trânsito",
      "Exporte gráficos em alta resolução para publicações",
    ],
    imageQuery: "scientific data visualization, interactive charts, 3D planet models",
    icon: Eye,
  },
  {
    id: "results",
    title: "Resultados e Explicabilidade",
    description:
      "Análise detalhada dos resultados com métricas científicas, explicabilidade do modelo e sistema de vetting para validação manual.",
    details: [
      "Métricas de Classificação: Accuracy, Precision, Recall, F1-Score",
      "Curvas ROC e Precision-Recall para análise de threshold",
      "Confusion Matrix: Visualização de acertos e erros",
      "SHAP Values: Explicação de quais features influenciaram a predição",
      "Feature Importance: Ranking das características mais relevantes",
      "Sistema de Vetting: Interface para validação manual de candidatos",
    ],
    outputs: [
      { name: "Métricas Detalhadas", description: "Conjunto completo de métricas de performance do modelo" },
      { name: "Explicações SHAP", description: "Valores de contribuição de cada feature para a predição" },
      { name: "Matriz de Confusão", description: "Tabela de verdadeiros/falsos positivos e negativos" },
      { name: "Relatório de Vetting", description: "Validação manual com notas e classificação revisada" },
    ],
    tips: [
      "Use SHAP para entender decisões individuais do modelo",
      "Confusion matrix ajuda a identificar tipos de erros",
      "Sistema de vetting é essencial para validação científica",
    ],
    imageQuery: "machine learning metrics, SHAP values, confusion matrix, scientific analysis",
    icon: BarChart3,
  },
  {
    id: "export",
    title: "Exportação Científica",
    description:
      "Exporte resultados em formatos científicos padrão, prontos para publicação ou compartilhamento com a comunidade astronômica.",
    details: [
      "JSON: Dados estruturados com metadados completos",
      "CSV: Tabelas compatíveis com ferramentas de análise",
      "HDF5: Formato hierárquico para grandes volumes de dados",
      "FITS: Padrão astronômico com headers WCS",
      "Relatórios PDF: Documentos formatados com gráficos e análises",
      "Integração com ExoFOP: Submissão direta de candidatos",
    ],
    outputs: [
      { name: "Arquivos Científicos", description: "Dados em formatos padrão da astronomia" },
      { name: "Relatórios Completos", description: "Documentos com análise detalhada e visualizações" },
      { name: "Metadados", description: "Informações completas sobre processamento e configuração" },
    ],
    tips: [
      "HDF5 é ideal para grandes datasets",
      "FITS preserva compatibilidade com ferramentas astronômicas",
      "Inclua sempre metadados para reprodutibilidade",
    ],
    imageQuery: "scientific data export, file formats, research publication",
    icon: Download,
  },
]

export function TutorialOverlay() {
  const { mode } = useMode()
  const [isActive, setIsActive] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [hasSeenTutorial, setHasSeenTutorial] = useState(false)
  const [isAutoPlay, setIsAutoPlay] = useState(false)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const steps = mode === "explorer" ? explorerSteps : researcherSteps
  const storageKey = `exolab-tutorial-seen-${mode}`

  useEffect(() => {
    const seen = localStorage.getItem(storageKey)
    if (!seen) {
      setTimeout(() => setIsActive(true), 1500)
    }
    setHasSeenTutorial(!!seen)
  }, [storageKey])

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isAutoPlay && isActive) {
      interval = setInterval(() => {
        if (currentStep < steps.length - 1) {
          setCurrentStep((prev) => prev + 1)
        } else {
          setIsAutoPlay(false)
        }
      }, 8000) // 8 seconds per step
    }
    return () => clearInterval(interval)
  }, [isAutoPlay, isActive, currentStep, steps.length])

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ top: 0, behavior: "smooth" })
    }
  }, [currentStep])

  useEffect(() => {
    if (currentStep >= steps.length) {
      setCurrentStep(0)
    }
  }, [currentStep, steps.length])

  const handleClose = () => {
    setIsActive(false)
    localStorage.setItem(storageKey, "true")
    setHasSeenTutorial(true)
    setIsAutoPlay(false)
  }

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      handleClose()
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleRestart = () => {
    setCurrentStep(0)
    setIsActive(true)
    setIsAutoPlay(false)
  }

  const step = steps[currentStep]

  // Early return if step is not available
  if (!step) {
    return null
  }

  const Icon = step.icon
  const progress = ((currentStep + 1) / steps.length) * 100

  return (
    <>
      {/* Tutorial trigger button */}
      {!isActive && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          onClick={handleRestart}
          className="fixed bottom-6 right-6 z-50 p-4 bg-gradient-to-r from-primary via-accent to-secondary rounded-full shadow-2xl hover:shadow-primary/50 transition-all duration-300 hover:scale-110 group"
          title="Abrir Tutorial"
        >
          <BookOpen className="h-6 w-6 text-white group-hover:rotate-12 transition-transform" />
        </motion.button>
      )}

      <AnimatePresence>
        {isActive && (
          <>
            {/* Backdrop with blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-md z-[100]"
              onClick={handleClose}
            />

            {/* Tutorial modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[101] w-[95vw] sm:w-[90vw] md:w-[85vw] lg:w-[80vw] xl:w-[75vw] max-w-[1280px] h-[85vh] max-h-[720px]"
            >
              <div className="relative h-full bg-gradient-to-br from-background/95 via-background/98 to-background/95 backdrop-blur-2xl border-2 border-primary/30 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
                {/* Decorative background elements */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
                  <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse delay-1000" />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-secondary/5 rounded-full blur-3xl" />
                </div>

                {/* Header */}
                <div className="relative border-b border-border/50 bg-gradient-to-r from-primary/10 via-accent/10 to-secondary/10 px-6 py-4 flex-shrink-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-gradient-to-br from-primary to-accent rounded-xl shadow-lg">
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold gradient-text">Tutorial Guardians of The Exoplanets</h2>
                        <p className="text-sm text-muted-foreground">
                          Modo {mode === "explorer" ? "Explorador" : "Pesquisador"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsAutoPlay(!isAutoPlay)}
                        className="gap-2"
                        title={isAutoPlay ? "Pausar reprodução automática" : "Reprodução automática"}
                      >
                        {isAutoPlay ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                      </Button>
                      <Button variant="ghost" size="icon" onClick={handleClose} className="hover:bg-destructive/20">
                        <X className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                  <div className="mt-3">
                    <Progress value={progress} className="h-1.5" />
                  </div>
                </div>

                {/* Content */}
                <div
                  ref={scrollContainerRef}
                  className="relative flex-1 overflow-y-auto px-6 lg:px-10 py-6 custom-scrollbar"
                >
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={step.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-6 pb-12"
                    >
                      {/* Title */}
                      <div className="text-center space-y-2">
                        <h3 className="text-2xl lg:text-3xl font-bold gradient-text">{step.title}</h3>
                        <p className="text-base lg:text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                          {step.description}
                        </p>
                      </div>

                      {/* Image placeholder */}
                      {step.imageQuery && (
                        <div className="relative w-full aspect-video rounded-2xl overflow-hidden border-2 border-primary/20 shadow-xl">
                          <img
                            src={`/.jpg?height=400&width=800&query=${encodeURIComponent(step.imageQuery)}`}
                            alt={step.title}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                        </div>
                      )}

                      {/* Details */}
                      <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-6 space-y-4">
                        <h4 className="text-lg font-semibold flex items-center gap-2">
                          <Sparkles className="h-5 w-5 text-primary" />
                          Como Funciona
                        </h4>
                        <ul className="space-y-3">
                          {step.details.map((detail, index) => (
                            <li key={index} className="flex items-start gap-3 text-sm lg:text-base">
                              <div className="mt-1 h-2 w-2 rounded-full bg-primary flex-shrink-0" />
                              <span className="text-muted-foreground leading-relaxed">{detail}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Inputs */}
                      {step.inputs && step.inputs.length > 0 && (
                        <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/30 rounded-2xl p-6 space-y-4">
                          <h4 className="text-lg font-semibold flex items-center gap-2">
                            <Database className="h-5 w-5 text-blue-500" />
                            Entradas (Inputs)
                          </h4>
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            {step.inputs.map((input, index) => (
                              <div key={index} className="bg-background/50 rounded-xl p-4 space-y-2">
                                <h5 className="font-semibold text-sm lg:text-base text-blue-400">{input.name}</h5>
                                <p className="text-xs lg:text-sm text-muted-foreground leading-relaxed">
                                  {input.description}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Outputs */}
                      {step.outputs && step.outputs.length > 0 && (
                        <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-2xl p-6 space-y-4">
                          <h4 className="text-lg font-semibold flex items-center gap-2">
                            <BarChart3 className="h-5 w-5 text-green-500" />
                            Saídas (Outputs)
                          </h4>
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            {step.outputs.map((output, index) => (
                              <div key={index} className="bg-background/50 rounded-xl p-4 space-y-2">
                                <h5 className="font-semibold text-sm lg:text-base text-green-400">{output.name}</h5>
                                <p className="text-xs lg:text-sm text-muted-foreground leading-relaxed">
                                  {output.description}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Tips */}
                      {step.tips && step.tips.length > 0 && (
                        <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/30 rounded-2xl p-6 space-y-4">
                          <h4 className="text-lg font-semibold flex items-center gap-2">
                            <Sparkles className="h-5 w-5 text-amber-500" />
                            Dicas e Melhores Práticas
                          </h4>
                          <ul className="space-y-3">
                            {step.tips.map((tip, index) => (
                              <li key={index} className="flex items-start gap-3 text-sm lg:text-base">
                                <div className="mt-1 h-2 w-2 rounded-full bg-amber-500 flex-shrink-0" />
                                <span className="text-muted-foreground leading-relaxed">{tip}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* Footer */}
                <div className="relative border-t border-border/50 bg-gradient-to-r from-primary/5 via-accent/5 to-secondary/5 px-6 py-4 flex-shrink-0">
                  <div className="flex items-center justify-between">
                    <Button
                      variant="outline"
                      onClick={handlePrevious}
                      disabled={currentStep === 0}
                      className="gap-2 border-primary/30 hover:bg-primary/10 bg-transparent"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Anterior
                    </Button>

                    <div className="flex items-center gap-2">
                      {steps.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentStep(index)}
                          className={`h-2 rounded-full transition-all duration-300 ${
                            index === currentStep
                              ? "w-8 bg-primary"
                              : index < currentStep
                                ? "w-2 bg-primary/50"
                                : "w-2 bg-border"
                          }`}
                          title={`Ir para etapa ${index + 1}`}
                        />
                      ))}
                    </div>

                    <Button
                      onClick={handleNext}
                      className="gap-2 bg-gradient-to-r from-primary via-accent to-secondary hover:opacity-90"
                    >
                      {currentStep === steps.length - 1 ? "Concluir" : "Próximo"}
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: hsl(var(--muted) / 0.3);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: hsl(var(--primary) / 0.5);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: hsl(var(--primary) / 0.7);
        }
      `}</style>
    </>
  )
}
