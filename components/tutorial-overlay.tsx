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
import Image from "next/image"
import { TelescopeFlow } from "@/components/telescope-flow"

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
    title: "Welcome to Guardians of The Exoplanets — Explorer Mode",
    description:
      "Explorer Mode is for enthusiasts, students, and newcomers. It guides you from data entry to a trustworthy classification in just a few steps — no expertise required.",
    details: [
      "Two input paths: manual form with validation or CSV upload",
      "Live progress while your data is validated and analyzed",
      "Clear decision with confidence and color‑coded labels",
      "Optional 3D planet visualization to explore the result",
    ],
    tips: [
      "No hyperparameters are sent in Explorer — it always runs the baseline model",
      "Hover any info icon to understand a field before filling it",
      "Use the Example button to try a realistic set of values",
    ],
    imageQuery: "astronomer looking at stars through telescope, futuristic interface",
    icon: Rocket,
  },
  {
    id: "data-input",
    title: "Data Entry",
    description:
      "Enter the observed parameters for your candidate. You can type values directly or upload a CSV with one or more candidates.",
    details: [
      "When a planet passes in front of its star, it blocks a small fraction of light",
      "We measure how long the planet takes to complete an orbit (Orbital Period)",
      "We also estimate the planet’s size relative to Earth",
      "Other parameters like temperature and stellar properties help the analysis",
    ],
    inputs: [
      {
        name: "Orbital Period",
        description: "Time the planet takes to complete one full orbit around the star (days)",
      },
      { name: "Planet Radius", description: "Planet size relative to Earth (1.0 = Earth size)" },
      {
        name: "Equilibrium Temperature",
        description: "Estimated planetary temperature based on stellar distance (Kelvin)",
      },
      { name: "Signal‑to‑Noise Ratio", description: "Quality of the detected signal (higher = better)" },
    ],
    outputs: [
      {
        name: "Validated Data",
        description: "The system checks whether values are within realistic physical limits",
      },
    ],
    tips: [
      "Required fields are marked with an asterisk (*)",
      "Inline error messages help you fix formatting or invalid ranges",
      "Use CSV upload for multiple candidates at once",
    ],
    imageQuery: "data entry form with astronomical parameters, modern UI",
    icon: Database,
  },
  {
    id: "classification",
    title: "Classification Process",
    description:
      "Click ‘Classify’ to start a live, step‑by‑step analysis. You’ll see input validation, preprocessing, model inference and completion in real time.",
    details: [
      "The model compares your data with patterns of confirmed exoplanets",
      "Checks for common false‑positive signatures (e.g., binaries)",
      "Outputs a probability that the candidate is a real planet",
      "Typical runs complete in seconds",
    ],
    outputs: [
      { name: "Classification", description: "Confirmed, Candidate, or False Positive" },
      { name: "Confidence", description: "Certainty of the decision (0–100%)" },
      { name: "Factor Analysis", description: "Which features influenced the decision" },
    ],
    tips: [
      "Confidence above 70% indicates a high likelihood of a real exoplanet",
      "Candidates between 50–70% may require follow‑up observations",
      "False positives often match binary‑star or instrumental patterns",
    ],
    imageQuery: "AI analyzing astronomical data, neural network visualization",
    icon: Sparkles,
  },
  {
    id: "results",
    title: "Interpreting Results",
    description:
      "The Results tab shows the decision and context. For CSV uploads, candidates with the same ID are grouped and can be explored as a history.",
    details: [
      "Main card: classification (✓ or ✗) and confidence",
      "Grouped table: repeated IDs are merged; click a row to open the pubdate timeline with probabilities",
      "Color‑coded badges: Confirmed / Candidate / False Positive",
      "Short guidance on what to do next",
    ],
    outputs: [
      { name: "Candidate Status", description: "Confirmed, Candidate, or False Positive with a visual cue" },
      { name: "Confidence Level", description: "Percentage and a visual progress bar" },
      { name: "History Modal", description: "Timeline of detections by pubdate with classification and confidence" },
      { name: "Recommendations", description: "Suggested next steps based on the outcome" },
    ],
    tips: [
      "Click any grouped row to view the candidate’s timeline",
      "Confidence close to 100% across multiple dates is a strong sign",
      "A single detection slightly above 95% may still need confirmation",
    ],
    imageQuery: "scientific results dashboard with charts and confidence meters",
    icon: BarChart3,
  },
  {
    id: "visualization",
    title: "Interactive 3D Visualization",
    description:
      "If your candidate is confirmed or likely, you can view a 3D representation of the exoplanet compared with Earth!",
    details: [
      "Side‑by‑side view: Earth vs. the discovered exoplanet",
      "Interactive rotation — click and drag to spin the planets",
      "Realistic Earth texture and generated exoplanet texture",
      "Detailed information on size, temperature, and characteristics",
    ],
    outputs: [
      { name: "Earth 3D Model", description: "Realistic representation for comparison" },
      { name: "Exoplanet 3D Model", description: "Generated visualization based on the classified data" },
      { name: "Comparative Data", description: "Table showing differences between Earth and the exoplanet" },
    ],
    tips: [
      "Use the mouse to rotate and explore the planets in 3D",
      "Exoplanet color and texture are generated from temperature and type",
      "Compare relative sizes to understand scale",
    ],
    imageQuery: "3D planet comparison Earth vs exoplanet, interactive visualization",
    icon: Globe,
  },
  {
    id: "export",
    title: "Exporting Your Results",
    description:
      "Save and share your discoveries! Export results in multiple formats for later use.",
    details: [
      "JSON: Structured data for programmatic analysis",
      "CSV: Compatible with Excel and other spreadsheet tools",
      "PDF Report: Nicely formatted document with charts and explanations",
      "Includes all classification data, confidence, and parameters",
    ],
    outputs: [
      { name: "JSON File", description: "Complete data in a structured format" },
      { name: "CSV File", description: "Table with all parameters and results" },
      { name: "PDF Report", description: "Visual document with charts and full analysis" },
    ],
    tips: [
      "Choose JSON if you'll use the data in code",
      "Use CSV for analysis in Excel or Google Sheets",
      "PDF is ideal for presentations and sharing",
    ],
    imageQuery: "data export options, file formats, download interface",
    icon: Download,
  },
]

const researcherSteps: TutorialStep[] = [
  {
    id: "intro",
    title: "Researcher Mode — Full Scientific Pipeline",
    description:
      "For scientists and power users who need reproducibility, control and metrics. Configure the model, stream the pipeline, and analyze detailed results.",
    details: [
      "Input formats: CSV (batch)",
      "Hyperparameter toggle in Model Configuration",
      "Advanced metrics: ROC, PR, Confusion Matrix and k‑folds",
      "Explainability with SHAP and feature importance",
      "Vetting interface to review candidates",
    ],
    tips: [
      "Switch on ‘Include hyperparameters’ to send tuned settings",
      "Turn it off to run a baseline comparable across experiments",
      "Batch CSV upload is ideal for catalog‑scale studies",
    ],
    imageQuery: "scientific research laboratory, advanced AI pipeline, data analysis",
    icon: Microscope,
  },
  {
    id: "data-input",
    title: "Advanced Data Ingestion",
    description:
      "Two ways to start: manual form (with validation) or CSV upload with streaming. Batch processing makes it easy to evaluate many candidates.",
    details: [
      "CSV: Light curves and tabular metadata",
      "TFRecords: Preprocessed TensorFlow data",
      "FITS: Astronomy standard with complete headers",
      "Batch processing: multiple rows per CSV",
      "Streaming UI: steps appear live as the backend processes the file",
    ],
    inputs: [
      { name: "Manual Form", description: "Enter parameters directly; fields are validated inline" },
      { name: "Light Curves", description: "Time series of normalized stellar flux (optional in CSV)" },
      { name: "Stellar Metadata", description: "Host star temperature, radius, mass, metallicity" },
      { name: "Orbital Parameters", description: "Period, epoch, duration, transit depth" },
      { name: "Centroid Motion", description: "Centroid motion data to flag false positives" },
    ],
    outputs: [
      { name: "Normalized Data", description: "Preprocessed and normalized light curves" },
      { name: "Extracted Features", description: "Automatically derived features from raw data" },
    ],
    tips: [
      "CSV column names should match the dataset schema you selected",
      "Batch processing is ideal for full catalogs",
      "Uploads stream step‑by‑step status to the UI",
    ],
    imageQuery: "astronomical data formats, CSV FITS TFRecords, batch processing",
    icon: Database,
  },
  {
    id: "model-config",
    title: "Model Configuration",
    description:
      "Control the architecture summary and, when enabled, adjust hyperparameters. A global switch decides whether hyperparameters are sent to the backend.",
    details: [
      "1D Transformer: Temporal analysis with an attention mechanism",
      "2D CNN: Spatial feature extraction from phase‑folded views",
      "MLP Fusion: Combining features and stellar metadata",
      "Physics‑informed constraints: Grounded in physical laws",
      "Hyperparameters (when enabled): trees, learning rate, epochs",
    ],
    inputs: [
      { name: "Number of Trees", description: "Number of decision trees in the ensemble (10–500)" },
      { name: "Learning Rate", description: "Step size during training (0.001–0.1)" },
      { name: "Training Epochs", description: "Number of passes over the dataset (10–100)" },
      { name: "Hyperparameter Switch", description: "Enable to include hyperparameters in requests; disable to run baseline" },
    ],
    outputs: [
      { name: "Configured Model", description: "Architecture and hyperparameters ready for training" },
      { name: "Configuration Summary", description: "Overview of selected parameters" },
    ],
    tips: [
      "More trees = higher accuracy but longer training",
      "Lower learning rate = more stable training",
      "Use data augmentation for small datasets",
    ],
    imageQuery: "neural network architecture, hyperparameter tuning, model configuration",
    icon: Settings,
  },
  {
    id: "pipeline",
    title: "Processing Pipeline (Live)",
    description:
      "Streamed steps show validation, preprocessing, model download, inference and completion with durations. The first step is seeded immediately for feedback.",
    details: [
      "Ingestion: Loading and validating data",
      "Preprocessing: Normalization, detrending, outlier removal",
      "Feature Engineering: Extracting the relevant characteristics",
      "Classification: ML model performs the prediction",
      "Post‑processing: Probability calibration and vetting",
      "Real‑time metrics for each stage",
    ],
    outputs: [
      { name: "Pipeline Status", description: "Per‑stage progress with visual indicators" },
      { name: "Performance Metrics", description: "Runtime, memory usage, throughput" },
      { name: "Detailed Logs", description: "Technical information for each processing step" },
    ],
    tips: [
      "Monitor the pipeline in real time during processing",
      "Check performance metrics for optimization",
      "Logs help diagnose data issues",
    ],
    imageQuery: "data pipeline visualization, processing stages, real-time metrics",
    icon: Layers,
  },
  {
    id: "visualizations",
    title: "Analytics Dashboard",
    description:
      "A collection of interactive charts to understand performance and data distributions — the same insights you can use in reports.",
    details: [
      "Distributions and feature importance",
      "K‑fold metrics (accuracy, precision, recall, F1)",
      "ROC / PR curves and confusion matrices",
      "Processing time and live summaries",
      "Interactive charts with export‑friendly tooltips",
    ],
    outputs: [
      { name: "Charts", description: "Curated plots built from live and post‑run metrics" },
      { name: "Matrices", description: "Confusion matrices for test and blind sets" },
      { name: "Distributions", description: "Feature and label distributions" },
    ],
    tips: [
      "Use the dashboard to compare runs and justify thresholds",
      "Copy metrics to lab notebooks or export figures",
      "Look for drift across folds to detect instability",
    ],
    imageQuery: "scientific data visualization, interactive charts, 3D planet models",
    icon: Eye,
  },
  {
    id: "results",
    title: "Results and Explainability",
    description:
      "Table view for classifications with grouping and a candidate timeline (like Explorer), plus optional comparison cards when baseline vs hyperparameters are present.",
    details: [
      "Grouped table: click a row to open the pubdate timeline",
      "Comparison cards: baseline vs tuned hyperparameters (when provided)",
      "Vetting panel appears automatically when candidates are present",
      "Explainability and importance available via Analytics",
    ],
    outputs: [
      { name: "Grouped Results", description: "Consolidated by object ID with timeline modal" },
      { name: "Comparison", description: "Side‑by‑side baseline vs hyperparameters" },
      { name: "Vetting", description: "Manual review workflow for candidates" },
    ],
    tips: [
      "Use comparison to quantify gains from tuning",
      "Document vetting notes for reproducibility",
      "Promote promising candidates to dedicated follow‑up",
    ],
    imageQuery: "machine learning metrics, SHAP values, confusion matrix, scientific analysis",
    icon: BarChart3,
  },
  {
    id: "export",
    title: "Export & Reproducibility",
    description:
      "Export artifacts and tabular results for reports and downstream analysis. When hyperparameters are enabled, they are included in the run metadata.",
    details: [
      "JSON: Structured data with complete metadata",
      "CSV: Tables compatible with analysis tools",
      "HDF5: Hierarchical format for large datasets",
      "FITS: Astronomy standard with WCS headers",
      "PDF Reports: Documents with charts and analyses",
      "ExoFOP integration: Direct submission of candidates",
    ],
    outputs: [
      { name: "Files", description: "Astronomy‑standard formats and tabular data" },
      { name: "Reports", description: "Documents with detailed analysis and visuals" },
      { name: "Run Metadata", description: "Configuration and (optionally) hyperparameters" },
    ],
    tips: [
      "Always include metadata for reproducibility",
      "CSV is best for quick spreadsheet analysis",
      "JSON preserves hierarchical structure for pipelines",
    ],
    imageQuery: "scientific data export, file formats, research publication",
    icon: Download,
  },
]

// New tutorials for Kepler and TESS modes
const ExampleSteps: TutorialStep[] = [
  {
    id: "intro",
    title: "Kepler — Processed Example Data",
    description:
      "In this experience you explore a Kepler dataset already processed by our Machine Learning models. The goal is to view ready‑made results, understand what each classification means, and learn how the model reached its conclusions.",
    details: [
      "Kepler observed a fixed region of the sky using the transit method",
      "Examples include KOIs and K2 campaigns, with confidence metrics",
      "Screens show only final results (no data upload required)",
    ],
    tips: [
      "Use this view to learn how to interpret real classifications",
      "Compare confirmed cases, candidates, and false positives",
    ],
    imageQuery: "Kepler space telescope, transit method, exoplanet discovery",
    icon: Globe,
  },
  {
    id: "about",
    title: "About the Kepler Mission",
    description:
      "Educational overview of the mission: how Kepler revolutionized exoplanet statistics and how the K2 phase expanded the science.",
    details: [
      "Large‑scale transit method",
      ">2,600 confirmed planets",
      "K2: campaigns along the ecliptic using solar‑pressure pointing",
    ],
    tips: ["See the ‘About’ tab for the full mission text and highlights"],
    imageQuery: "Kepler mission overview, star field, transit light curves",
    icon: Layers,
  },
  {
    id: "classifications",
    title: "Classifications (Model Results)",
    description:
      "List of candidates classified by our pipeline: each entry includes a label (Confirmed/Candidate/False Positive) and a high confidence score.",
    details: [
      "Each row corresponds to an object (KOI/EPIC)",
      "The classification badge indicates the final label",
      "The probability column summarizes model confidence",
    ],
    tips: ["Sort by probability to see the strongest cases first"],
    imageQuery: "classification table, confidence scores, badges",
    icon: BarChart3,
  },
  {
    id: "report",
    title: "Technical Report",
    description:
      "Metrics and artifacts produced during processing: confusion matrix, ROC curve, and other materials that explain model performance on the examples.",
    details: [
      "Confusion matrix to visualize hits and misses",
      "ROC curve for sensitivity vs. specificity",
      "Technical summary of the pipeline applied to the data",
    ],
    tips: ["Use this material to compare different model versions"],
    imageQuery: "confusion matrix and roc curve scientific dashboard",
    icon: BarChart3,
  },
  {
    id: "intro",
    title: "TESS — Processed Example Data",
    description:
      "Here you explore a TESS dataset processed by our models. The focus is to learn from ready‑made examples and understand how we interpret the classifications.",
    details: [
      "The TESS mission surveys ~85% of the sky in sectors",
      "Examples include TICs and observed sectors",
      "No data upload required; view ready results",
    ],
    tips: ["Track the sectors to relate discoveries"],
    imageQuery: "TESS satellite, all-sky survey, exoplanet transit",
    icon: Globe,
  },
  {
    id: "about",
    title: "About the TESS Mission",
    description:
      "Overview of the TESS mission and its goals: to find nearby, bright worlds ideal for detailed characterization.",
    details: [
      "Nearly all‑sky survey",
      ">200k target stars, prioritizing bright targets",
      "Produces TOIs and confirms hundreds of planets",
    ],
    tips: ["See the ‘About’ tab for TESS history and milestones"],
    imageQuery: "TESS mission overview, sectors map, bright stars",
    icon: Layers,
  },
  {
    id: "classifications",
    title: "Classifications (Model Results)",
    description:
      "Table of TESS candidates classified by our pipeline, including final labels and high confidence scores.",
    details: [
      "Each entry corresponds to a TIC/Sector",
      "Final label with badge and probability in %",
      "Data ready for study and comparison",
    ],
    tips: ["Sort by sector to compare sky regions"],
    imageQuery: "classification table TESS, sectors, confidence",
    icon: BarChart3,
  },
  {
    id: "report",
    title: "Technical Report",
    description:
      "Metrics and artifacts for the TESS set: understand model performance on these examples.",
    details: [
      "Confusion matrix, ROC curve, and supporting metrics",
      "Interpretation of results to support studies",
    ],
    tips: ["Compare reports across sectors or model versions"],
    imageQuery: "technical report metrics confusion roc",
    icon: BarChart3,
  },
]


export function TutorialOverlay() {
  const { mode } = useMode()
  const [isActive, setIsActive] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [hasSeenTutorial, setHasSeenTutorial] = useState(false)
  const [isAutoPlay, setIsAutoPlay] = useState(false)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const steps = mode === "explorer" ? explorerSteps : mode === "researcher" ? researcherSteps : ExampleSteps
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
    setCurrentStep(0)
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
          title="Open Tutorial"
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
                        <h2 className="text-xl font-bold gradient-text">Guardians of The Exoplanets Tutorial</h2>
                        <p className="text-sm text-muted-foreground">
                          Mode {mode === "explorer" ? "Explorer" : "Researcher"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsAutoPlay(!isAutoPlay)}
                        className="gap-2"
                        title={isAutoPlay ? "Pause auto‑play" : "Auto‑play"}
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
                      {mode === 'example' && (
                        <div className="p-4 border rounded-xl bg-primary/5">
                          <h4 className="text-sm font-semibold mb-1">Why this tab exists</h4>
                          {/(kepler|k2)/i.test(step.title) ? (
                            <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
                              <li>Deep, long‑baseline photometry — sensitive to small and long‑period planets.</li>
                              <li>Stable single field enables consistent comparisons across campaigns (Kepler and K2).</li>
                              <li>Great to inspect historic KOIs with high‑quality light curves.</li>
                            </ul>
                          ) : /(tess)/i.test(step.title) ? (
                            <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
                              <li>Nearly all‑sky coverage focused on bright nearby stars — ideal for follow‑ups.</li>
                              <li>Large candidate volumes per sector — showcases model classification at scale.</li>
                              <li>Optimized to surface short‑period transits and frequent detections.</li>
                            </ul>
                          ) : (
                            <p className="text-sm text-muted-foreground">Use the Kepler/K2 or TESS tab in the main page to explore a curated dataset classified by our model. This tutorial explains what you will find in each tab.</p>
                          )}
                        </div>
                      )}
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
                          How It Works
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
                            Inputs
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
                            Outputs
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
                          Tips & Best Practices
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
                      Previous
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
                          title={`Go to step ${index + 1}`}
                        />
                      ))}
                    </div>

                    <Button
                      onClick={handleNext}
                      className="gap-2 bg-gradient-to-r from-primary via-accent to-secondary hover:opacity-90"
                    >
                      {currentStep === steps.length - 1 ? "Finish" : "Next"}
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
