"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Sparkles, CheckCircle2, XCircle, HelpCircle, TrendingUp, Info, History, ChevronRight, BarChart3 } from "lucide-react"
import { useMode } from "@/lib/mode-context"
import { usePlanetData } from "@/lib/planet-data-context"
import { motion } from "framer-motion"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { useMemo } from "react"
import { normalizeId, normalizeClassification, normalizeProbability, groupRowsById } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { CandidateHistoryDialog } from "@/components/candidate-history-dialog"
import { ChartContainer, ChartTooltip } from "@/components/ui/chart"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend, Cell } from "recharts"
import { Badge } from "@/components/ui/badge"

export function ResultsSection() {
  const { mode } = useMode()
  const { prediction, streamPredictions, runMeta, debugEvents } = usePlanetData() as any
  const [showDebug, setShowDebug] = useState(false)
  const [historyOpen, setHistoryOpen] = useState(false)
  const [historySelection, setHistorySelection] = useState<{ id: string; entries: any[] } | null>(null)

  if (mode !== "researcher") return null

  // Flatten potential nested arrays from backend
  // Step 7 structure: predictions = [[{old}, {new}], [{old}, {new}], ...]
  const flatPreds = useMemo(() => {
    if (!Array.isArray(streamPredictions) || streamPredictions.length === 0) return []
    // Deep flatten: if first element is array, flatten recursively
    let preds = streamPredictions as any[]
    while (Array.isArray(preds[0])) {
      preds = preds.flat()
    }
    return preds
  }, [streamPredictions])

  const isComparison = flatPreds.some((x:any) => (
    'old_classificacao' in (x || {}) ||
    'new_classificacao' in (x || {}) ||
    'old_classification' in (x || {}) ||
    'new_classification' in (x || {})
  ))

  const comparisonGroups = useMemo(() => {
    if (!flatPreds || flatPreds.length === 0) return []
    // Group by kepoi_name (Kepler) or toi (TESS) since each candidate has a unique identifier
    const map = new Map<string, any[]>()
    for (const r of flatPreds) {
      // Support both Kepler (kepoi_name, id) and TESS (toi, tid) fields
      const key = String(r?.kepoi_name ?? r?.toi ?? r?.id ?? r?.tid ?? '')
      if (!key) continue
      const arr = map.get(key) || []
      arr.push(r)
      map.set(key, arr)
    }
    
    const arr: Array<{ 
      id: string
      koi: string
      oldCls?: string
      oldProb?: number
      newCls?: string
      newProb?: number 
    }> = []
    
    for (const [koi, rows] of map.entries()) {
      // Support both Kepler (id) and TESS (tid) fields
      const id = String(rows[0]?.id ?? rows[0]?.tid ?? '')
      const oldRow = rows.find((r:any)=> 'old_classificacao' in (r||{}) || 'old_classification' in (r||{}))
      const newRow = rows.find((r:any)=> 'new_classificacao' in (r||{}) || 'new_classification' in (r||{}))
      
      const oldCls = oldRow ? String(oldRow.old_classificacao ?? oldRow.old_classification ?? '') : undefined
      const newCls = newRow ? String(newRow.new_classificacao ?? newRow.new_classification ?? '') : undefined
      const oldProb = oldRow ? Number(oldRow.old_probabilidade ?? oldRow.old_probability ?? 0) : undefined
      const newProb = newRow ? Number(newRow.new_probabilidade ?? newRow.new_probability ?? 0) : undefined
      
      arr.push({ id, koi, oldCls, oldProb, newCls, newProb })
    }
    
    // Sort by newProb desc
    arr.sort((a,b)=> (b.newProb ?? -Infinity) - (a.newProb ?? -Infinity))
    return arr
  }, [flatPreds])

  const groupedSummary = useMemo(() => {
    if (!flatPreds || flatPreds.length === 0) return []
    // Group by kepoi_name (Kepler) or toi (TESS)
    const map = new Map<string, any[]>()
    for (const r of flatPreds) {
      // Support both Kepler (kepoi_name, id) and TESS (toi, tid) fields
      const key = String(r?.kepoi_name ?? r?.toi ?? r?.id ?? r?.tid ?? '')
      if (!key) continue
      const arr = map.get(key) || []
      arr.push(r)
      map.set(key, arr)
    }
    
    const arr = Array.from(map.entries()).map(([koi, rows]) => {
      // Support both Kepler (id) and TESS (tid) fields
      const id = String(rows[0]?.id ?? rows[0]?.tid ?? koi)
      const entries = rows.map((r:any)=>{
        const isOld = ('old_classificacao' in (r||{})) || ('old_classification' in (r||{}))
        const isNew = ('new_classificacao' in (r||{})) || ('new_classification' in (r||{}))
        let cls = 'Candidate'
        let prob = 0
        if (isOld) {
          cls = String(r.old_classificacao ?? r.old_classification ?? 'Candidate')
          prob = Number(r.old_probabilidade ?? r.old_probability ?? 0)
        } else if (isNew) {
          cls = String(r.new_classificacao ?? r.new_classification ?? 'Candidate')
          prob = Number(r.new_probabilidade ?? r.new_probability ?? 0)
        }
        const norm = cls.toLowerCase().normalize('NFD').replace(/[^a-z ]/g,'')
        const finalCls = norm.includes('confirm') ? 'Confirmed' : norm.includes('candidate') || norm.includes('candidat') ? 'Candidate' : 'False Positive'
        
        // Extract pubdate from the record (supports K2, Kepler, TESS formats)
        // K2 format: "2018-03", Kepler: koi_pdisposition_date, TESS: publication_date
        const pubdate = r?.pubdate ?? r?.koi_pdisposition_date ?? r?.publication_date ?? r?.koi_disposition_date ?? null
        
        return {
          id,
          classification: finalCls as 'Confirmed' | 'Candidate' | 'False Positive',
          probability: prob,
          isNew,
          pubdate,
          raw: r
        }
      })
      // Prefer new_* entry as latest
      const latest = entries.find(e=>e.isNew) || entries.slice(-1)[0] || { classification: 'Candidate' as const, probability: 0 }
      const sortProb = latest?.probability ?? Math.max(0, ...entries.map(e=>e.probability))
      return { id, koi, entries, latest, sortProb }
    })
    arr.sort((a,b)=> b.sortProb - a.sortProb)
    return arr
  }, [flatPreds])

  // Helper for badge styles
  const badgeClassFor = (cls?: string) => {
    if (!cls) return 'bg-muted text-muted-foreground border-border'
    const k = String(cls).toLowerCase()
    if (k.includes('confirm')) return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
    if (k.includes('candidate') || k.includes('candidat')) return 'bg-amber-500/10 text-amber-400 border-amber-500/20'
    return 'bg-rose-500/10 text-rose-400 border-rose-500/20'
  }

  // Debug: log data structure
  // eslint-disable-next-line no-console
  console.log('[ResultsSection] 📊 Data counts:', {
    streamPredictions: streamPredictions?.length ?? 0,
    flatPreds: flatPreds.length,
    comparisonGroups: comparisonGroups.length,
    groupedSummary: groupedSummary.length
  })
  if (streamPredictions && streamPredictions.length > 0) {
    // eslint-disable-next-line no-console
    console.log('[ResultsSection] 📦 First streamPredictions item:', streamPredictions[0])
    // eslint-disable-next-line no-console
    console.log('[ResultsSection] 📦 First flatPreds item:', flatPreds[0])
    // eslint-disable-next-line no-console
    console.log('[ResultsSection] 📦 Detected fields:', {
      hasKeplerFields: 'kepoi_name' in (flatPreds[0] || {}),
      hasTessFields: 'toi' in (flatPreds[0] || {}) || 'tid' in (flatPreds[0] || {}),
      keys: Object.keys(flatPreds[0] || {})
    })
    // eslint-disable-next-line no-console
    console.log('[ResultsSection] 📦 comparisonGroups sample:', comparisonGroups[0])
    // eslint-disable-next-line no-console
    console.log('[ResultsSection] 📦 groupedSummary sample:', groupedSummary[0])
    // eslint-disable-next-line no-console
    if (groupedSummary[0]?.entries) {
      console.log('[ResultsSection] 📅 First entry with pubdate:', groupedSummary[0].entries[0])
    }
  }

  // Detect dataset type from first item
  const isTessData = flatPreds.length > 0 && ('toi' in flatPreds[0] || 'tid' in flatPreds[0])
  const candidateLabel = isTessData ? 'TOI' : 'KOI'

  return (
    <section id="results" className="scroll-mt-20 space-y-4">
      <Card className="rounded-xl border overflow-hidden">
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <CardTitle className="text-xl">Classificações (Baseline vs Hiperparâmetros)</CardTitle>
              </div>
              <CardDescription className="mt-1">
                Comparação detalhada: modelo baseline vs modelo com hiperparâmetros otimizados
                {isTessData && <span className="ml-2 text-xs text-accent">(TESS)</span>}
                {!isTessData && <span className="ml-2 text-xs text-accent">(Kepler)</span>}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={()=>setShowDebug((v)=>!v)} className="text-xs">{showDebug ? 'Ocultar' : 'Mostrar'} Debug</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-3">ID do Objeto</th>
                  <th className="text-left p-3">{candidateLabel}</th>
                  <th className="text-left p-3">Baseline</th>
                  <th className="text-right p-3">Prob. Baseline</th>
                  <th className="text-left p-3">Com Hiperparâmetros</th>
                  <th className="text-right p-3">Nova Prob.</th>
                </tr>
              </thead>
               <tbody>
                 {comparisonGroups.length === 0 ? (
                   <tr>
                     <td colSpan={6} className="p-8 text-center text-muted-foreground">
                       Nenhum dado de comparação disponível. Faça upload de um CSV com hiperparâmetros para ver resultados baseline vs otimizados.
                     </td>
                   </tr>
                 ) : (
                   comparisonGroups.map((g, idx) => {
                     const key = `${g.id}-${idx}`
                     return (
                       <tr key={key} className="border-t hover:bg-muted/30">
                         <td className="p-3 font-mono">{g.id}</td>
                         <td className="p-3 font-mono">{g.koi ?? '—'}</td>
                         <td className="p-3">
                           <span className={`inline-flex items-center px-2 py-0.5 rounded border text-xs ${badgeClassFor(g.oldCls)}`}>{g.oldCls ?? '—'}</span>
                         </td>
                         <td className="p-3 text-right">
                           <span className="font-mono">{g.oldProb == null ? '—' : `${g.oldProb.toFixed(2)}%`}</span>
                         </td>
                         <td className="p-3">
                           <span className={`inline-flex items-center px-2 py-0.5 rounded border text-xs ${badgeClassFor(g.newCls)}`}>{g.newCls ?? '—'}</span>
                         </td>
                         <td className="p-3 text-right">
                           <span className="font-mono">{g.newProb == null ? '—' : `${g.newProb.toFixed(2)}%`}</span>
                         </td>
                       </tr>
                     )
                   })
                 )}
               </tbody>
            </table>
          </div>
          {showDebug && (
            <div className="p-3 border-t bg-muted/30 text-xs font-mono max-h-72 overflow-auto">
              {(debugEvents || []).slice(-100).map((e:any, i:number)=> (
                <div key={i} className="py-1">
                  <div className="text-muted-foreground">[{new Date(e.ts).toLocaleTimeString()}] step {e.step ?? '—'} • {e.status ?? '—'} • {e.from}</div>
                  <pre className="whitespace-pre-wrap break-words">{e.raw}</pre>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Explorer-style grouped summary table built from step 7 rows (prefers new_* entries) */}
      <Card className="rounded-xl border overflow-hidden">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <CardTitle className="text-xl">Resumo por Candidato</CardTitle>
          </div>
          <CardDescription>Última classificação por objeto (registros refletem baseline vs hiperparâmetros)</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-3">ID do Objeto</th>
                  <th className="text-left p-3">Classificação</th>
                  <th className="text-right p-3">Registros</th>
                  <th className="text-right p-3">Prob. Média</th>
                  <th className="text-right p-3">Histórico</th>
                </tr>
              </thead>
               <tbody>
                 {groupedSummary.length === 0 ? (
                   <tr>
                     <td colSpan={5} className="p-8 text-center text-muted-foreground">
                       Nenhum dado de resumo disponível. Os resultados aparecerão aqui após a classificação ser concluída.
                     </td>
                   </tr>
                 ) : (
                   groupedSummary.map((g:any, idx:number) => {
                     const idVal = g.id
                     const cls = g.latest.classification as 'Confirmed' | 'Candidate' | 'False Positive'
                     const avgProb = (() => {
                       const vals = (g.entries || []).map((e:any)=> Number(e.probability) || 0)
                       const n = Math.max(1, vals.length)
                       return vals.reduce((a:number,b:number)=>a+b,0) / n
                     })()
                     const badgeClass = cls === 'Confirmed'
                       ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                       : cls === 'Candidate'
                       ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                       : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                     const key = `${idVal}-${idx}`
                     return (
                       <tr
                         key={key}
                         className="border-t hover:bg-muted/30 cursor-pointer"
                         title="Clique para ver o histórico do candidato"
                         onClick={() => { setHistorySelection({ id: idVal, entries: g.entries }); setHistoryOpen(true) }}
                       >
                         <td className="p-3 font-mono">{idVal}</td>
                         <td className="p-3">
                           <span className={`inline-flex items-center px-2 py-0.5 rounded border text-xs ${badgeClass}`}>{cls}</span>
                         </td>
                         <td className="p-3 text-right">
                           <span className="inline-flex items-center justify-center min-w-8 px-2 py-0.5 rounded-md border bg-card/70 text-xs">
                             {g.entries.length}
                           </span>
                         </td>
                         <td className="p-3 text-right">
                           <span className="font-mono">{Number.isFinite(avgProb) ? avgProb.toFixed(2) : '—'}%</span>
                         </td>
                         <td className="p-3 text-right">
                           <Button variant="ghost" size="sm" className="gap-1" onClick={(e)=>{ e.stopPropagation(); setHistorySelection({ id: idVal, entries: g.entries }); setHistoryOpen(true) }}>
                             <History className="h-3.5 w-3.5" />
                             <span className="hidden sm:inline">Histórico</span>
                             <ChevronRight className="h-3.5 w-3.5" />
                           </Button>
                         </td>
                       </tr>
                     )
                   })
                 )}
               </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      <CandidateHistoryDialog
        open={historyOpen}
        onOpenChange={setHistoryOpen}
        candidateId={historySelection?.id || ''}
        entries={(historySelection?.entries || []).map((r:any)=>({
          id: r?.id ?? normalizeId(r),
          classification: r?.classification ?? normalizeClassification(r),
          probability: r?.probability ?? normalizeProbability(r),
          // Extract pubdate from entry or raw record (K2: pubdate, Kepler: koi_pdisposition_date, TESS: publication_date)
          pubdate: r?.pubdate ?? r?.raw?.pubdate ?? r?.raw?.koi_pdisposition_date ?? r?.raw?.publication_date ?? r?.raw?.koi_disposition_date ?? null,
        }))}
      />
    </section>
  )

  // Fallback: single-prediction result card (manual path)
  if (!prediction) return null

  const confidence = prediction.probability
  const isExoplanet = prediction.classification === "Confirmado" || prediction.classification === "Candidato"

  return (
    <section id="results" className="scroll-mt-20">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="space-y-6">
          <Card className="gradient-border bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-3xl flex items-center gap-2">
                <Sparkles className="h-8 w-8 text-primary" />
                Resultado da Análise
              </CardTitle>
              <CardDescription className="text-base">
                Veja o que descobrimos sobre seu candidato a exoplaneta
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Main Result Card */}
              <div
                className={`p-8 rounded-2xl border-2 ${isExoplanet ? "bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/30" : "bg-gradient-to-br from-red-500/10 to-orange-500/10 border-red-500/30"}`}
              >
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="flex items-center gap-4">
                    {isExoplanet ? (
                      <div className="p-4 bg-green-500 rounded-full">
                        <CheckCircle2 className="h-12 w-12 text-white" />
                      </div>
                    ) : (
                      <div className="p-4 bg-red-500 rounded-full">
                        <XCircle className="h-12 w-12 text-white" />
                      </div>
                    )}
                    <div>
                      <h3 className="text-2xl md:text-3xl font-bold mb-1">{prediction.classification}!</h3>
                      <p className="text-muted-foreground">
                        {isExoplanet
                          ? "Os dados indicam fortemente a presença de um planeta"
                          : "Os dados sugerem que não é um planeta real"}
                      </p>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-5xl font-bold gradient-text">{confidence.toFixed(1)}%</div>
                    <div className="text-sm text-muted-foreground mt-1">Confiança</div>
                  </div>
                </div>
              </div>

              {/* Confidence Meter */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Nível de Confiança</span>
                  <span className="text-sm text-muted-foreground">{confidence.toFixed(1)}%</span>
                </div>
                <Progress value={confidence} className="h-3" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Improvável</span>
                  <span>Possível</span>
                  <span>Provável</span>
                  <span>Muito Provável</span>
                </div>
              </div>

              {/* Educational Explanation */}
              <Alert className="border-primary/30 bg-gradient-to-r from-primary/10 to-accent/10">
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <strong>Como interpretamos isso:</strong> O modelo analisou os padrões nos dados que você forneceu
                  (como o período orbital, tamanho do planeta e características da estrela) e comparou com milhares de
                  exoplanetas conhecidos e falsos positivos. Uma confiança acima de 50% indica que é mais provável ser
                  um planeta real do que um falso alarme!
                </AlertDescription>
              </Alert>

              {/* Key Factors */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-card border border-border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    <h4 className="font-semibold text-sm">Sinal de Trânsito</h4>
                  </div>
                  <div className="text-2xl font-bold text-green-500">Forte</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    O padrão de diminuição de luz é consistente com um planeta
                  </p>
                </div>

                <div className="p-4 bg-card border border-border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="h-4 w-4 text-accent" />
                    <h4 className="font-semibold text-sm">Características</h4>
                  </div>
                  <div className="text-2xl font-bold text-blue-500">Típicas</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Tamanho e órbita compatíveis com exoplanetas conhecidos
                  </p>
                </div>

                <div className="p-4 bg-card border border-border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <HelpCircle className="h-4 w-4 text-secondary" />
                    <h4 className="font-semibold text-sm">Falsos Positivos</h4>
                  </div>
                  <div className="text-2xl font-bold text-yellow-500">Baixo</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Poucas características de sistemas binários ou ruído
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Classification Distribution Analysis - Full Width Bar Chart */}
        {flatPreds.length > 0 && (
          <Card className="border-primary/20 w-full">
            <CardHeader className="pb-4">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div>
                  <CardTitle className="text-base md:text-lg flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                    Análise de Distribuição das Classificações
                  </CardTitle>
                  <CardDescription className="text-[10px] md:text-xs mt-1">
                    Interpretação detalhada dos resultados • Distribuição estatística por categoria
                  </CardDescription>
                </div>
                <Badge variant="outline" className="text-[10px] font-mono w-fit">
                  {flatPreds.length} predições
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {(() => {
                // Calculate distribution from flatPreds
                const norm = (v: any) => String(v ?? "").toLowerCase().normalize("NFD").replace(/[^a-z ]/g, "").trim()
                const getLabel = (row: any) => {
                  const raw = norm(row?.new_classification ?? row?.old_classification ?? row?.classificacao ?? row?.classification ?? '')
                  if (raw.includes("confirm")) return "confirmed"
                  if (raw.includes("candidate") || raw.includes("candidat")) return "candidate"
                  if (raw.includes("false") || raw.includes("falso") || raw.includes("fp")) return "false_positive"
                  return "unknown"
                }
                
                const confirmed = flatPreds.filter((r: any) => getLabel(r) === "confirmed").length
                const candidate = flatPreds.filter((r: any) => getLabel(r) === "candidate").length
                const falsePositive = flatPreds.filter((r: any) => getLabel(r) === "false_positive").length
                const total = confirmed + candidate + falsePositive
                
                const distributionData = [
                  { 
                    name: "Confirmado", 
                    value: confirmed, 
                    percentage: total > 0 ? (confirmed / total * 100) : 0,
                    color: "#10b981",
                    interpretation: "Objetos com alta probabilidade de serem exoplanetas confirmados",
                    icon: "✓"
                  },
                  { 
                    name: "Candidato", 
                    value: candidate, 
                    percentage: total > 0 ? (candidate / total * 100) : 0,
                    color: "#f59e0b",
                    interpretation: "Objetos que requerem observações adicionais para confirmação",
                    icon: "?"
                  },
                  { 
                    name: "Falso Positivo", 
                    value: falsePositive, 
                    percentage: total > 0 ? (falsePositive / total * 100) : 0,
                    color: "#ef4444",
                    interpretation: "Sinais que não correspondem a exoplanetas reais",
                    icon: "✕"
                  },
                ]

                return (
                  <>
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
                      {distributionData.map((item) => (
                        <div 
                          key={item.name} 
                          className="relative overflow-hidden rounded-lg border bg-card/50 p-4 transition-all hover:shadow-md"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <div 
                                className="flex items-center justify-center w-8 h-8 rounded-full text-white font-bold"
                                style={{ backgroundColor: item.color }}
                              >
                                {item.icon}
                              </div>
                              <div>
                                <div className="text-xs text-muted-foreground">{item.name}</div>
                                <div className="text-2xl font-bold font-mono" style={{ color: item.color }}>
                                  {item.value}
                                </div>
                              </div>
                            </div>
                            <Badge variant="outline" className="text-xs font-mono">
                              {item.percentage.toFixed(1)}%
                            </Badge>
                          </div>
                          <p className="text-[10px] md:text-xs text-muted-foreground leading-relaxed">
                            {item.interpretation}
                          </p>
                          {/* Progress bar */}
                          <div className="mt-3 h-1.5 w-full bg-muted rounded-full overflow-hidden">
                            <div 
                              className="h-full transition-all duration-500"
                              style={{ 
                                width: `${item.percentage}%`,
                                backgroundColor: item.color 
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Bar Chart */}
                    <div className="rounded-lg bg-card/30 p-3 md:p-4 border border-border/50">
                      <ChartContainer
                        config={{
                          confirmed: { label: "Confirmado", color: "#10b981" },
                          candidate: { label: "Candidato", color: "#f59e0b" },
                          falsePositive: { label: "Falso Positivo", color: "#ef4444" },
                        }}
                        className="h-[300px] md:h-[350px] w-full"
                      >
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={distributionData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                            <XAxis 
                              dataKey="name" 
                              tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.7)' }}
                              stroke="rgba(255,255,255,0.3)"
                            />
                            <YAxis 
                              tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.7)' }}
                              stroke="rgba(255,255,255,0.3)"
                              label={{ value: 'Quantidade', angle: -90, position: 'insideLeft', fontSize: 11, fill: 'rgba(255,255,255,0.6)' }}
                            />
                            <ChartTooltip
                              content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                  const data = payload[0].payload
                                  return (
                                    <div className="rounded-lg border-2 bg-background/95 backdrop-blur-sm p-3 shadow-xl">
                                      <div className="space-y-2">
                                        <div className="flex items-center gap-2 border-b pb-2">
                                          <div 
                                            className="h-3 w-3 rounded-full" 
                                            style={{ backgroundColor: data.color }} 
                                          />
                                          <span className="text-sm font-bold">{data.name}</span>
                                        </div>
                                        <div className="grid gap-1.5">
                                          <div className="flex justify-between gap-4">
                                            <span className="text-xs text-muted-foreground">Quantidade:</span>
                                            <span className="text-sm font-mono font-bold">{data.value}</span>
                                          </div>
                                          <div className="flex justify-between gap-4">
                                            <span className="text-xs text-muted-foreground">Percentual:</span>
                                            <span className="text-sm font-mono font-bold">{data.percentage.toFixed(1)}%</span>
                                          </div>
                                          <div className="flex justify-between gap-4">
                                            <span className="text-xs text-muted-foreground">Do total:</span>
                                            <span className="text-sm font-mono">{total} objetos</span>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  )
                                }
                                return null
                              }}
                            />
                            <Bar dataKey="value" radius={[8, 8, 0, 0]} maxBarSize={120}>
                              {distributionData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </ChartContainer>
                    </div>

                    {/* Interpretation Alert */}
                    <Alert className="border-primary/30 bg-primary/5">
                      <Info className="h-4 w-4" />
                      <AlertDescription className="text-[10px] md:text-xs">
                        <strong>Interpretação dos Resultados:</strong> A distribuição acima reflete a confiança do modelo em cada classificação.
                        <ul className="mt-2 ml-4 space-y-1 list-disc">
                          <li><strong>Confirmados</strong>: Alta certeza baseada em padrões de trânsito consistentes e características orbitais</li>
                          <li><strong>Candidatos</strong>: Sinais promissores que necessitam de validação adicional ou dados complementares</li>
                          <li><strong>Falsos Positivos</strong>: Sinais descartados por características inconsistentes com exoplanetas</li>
                        </ul>
                      </AlertDescription>
                    </Alert>
                  </>
                )
              })()}
            </CardContent>
          </Card>
        )}
      </motion.div>
    </section>
  )
}
