"use client"

import { useMemo } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"

type Entry = {
  id: string
  pubdate?: string | null
  classification: string
  probability: number
}

export function CandidateHistoryDialog({
  open,
  onOpenChange,
  candidateId,
  entries,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  candidateId: string
  entries: Entry[]
}) {
  const normalized = useMemo(() => {
    const normCls = (c: string) => {
      const s = String(c || "").toLowerCase().normalize("NFD").replace(/[^a-z ]/g, "")
      if (s.includes("confirm")) return "Confirmed"
      if (s.includes("candidate") || s.includes("candidat")) return "Candidate"
      return "False Positive"
    }
    const normProb = (p: number) => {
      const n = Number(p)
      return Number.isFinite(n) ? Math.max(0, Math.min(100, n)) : 0
    }
    const parseDateRank = (d?: string | null, idx: number = 0) => {
      if (!d) return { key: `0000-00-${idx}`, sort: -Infinity }
      // Expecting YYYY-MM; fallback lexicographic which works for this format
      const parts = String(d).split("-")
      if (parts.length >= 2) {
        const y = Number(parts[0]) || 0
        const m = Number(parts[1]) || 0
        return { key: `${parts[0]}-${parts[1]}`, sort: y * 12 + m }
      }
      return { key: String(d), sort: -Infinity }
    }
    const list = (entries || []).map((e, idx) => ({
      id: e.id,
      pubdate: e.pubdate || null,
      classification: normCls(e.classification),
      probability: normProb(e.probability),
      _rank: parseDateRank(e.pubdate, idx).sort,
      _dateKey: parseDateRank(e.pubdate, idx).key,
    }))
    list.sort((a, b) => a._rank - b._rank)
    const stats = {
      total: list.length,
      num100: list.filter((x) => x.probability >= 100).length,
      num95: list.filter((x) => x.probability >= 95).length,
      minProb: list.reduce((acc, x) => Math.min(acc, x.probability), 100),
      maxProb: list.reduce((acc, x) => Math.max(acc, x.probability), 0),
      avgProb: list.reduce((acc, x) => acc + x.probability, 0) / Math.max(1, list.length),
    }
    const narrative = (() => {
      if (stats.total >= 2 && stats.num100 >= stats.total - 1) {
        return "Múltiplas detecções consistentes (quase todas 100%). Forte indicação de exoplaneta."
      }
      if (stats.total >= 2 && stats.num95 === 1) {
        return "Apenas uma detecção acima de 95%. Evidência fraca/moderada — requer mais validação."
      }
      if (stats.avgProb >= 95) return "Probabilidade média alta em várias detecções. Forte candidato."
      if (stats.maxProb >= 95) return "Pelo menos uma detecção forte (>=95%), mas há variação entre as medições."
      return "Histórico sem evidências fortes consistentes."
    })()
    return { list, stats, narrative }
  }, [entries])

  const badgeClass = (cls: string) =>
    cls === "Confirmed"
      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
      : cls === "Candidate"
      ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
      : "bg-rose-500/10 text-rose-400 border-rose-500/20"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl">{candidateId}</DialogTitle>
          <DialogDescription>
            Linha do tempo de publicações e classificações ({normalized.stats.total})
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="p-3 rounded-lg border bg-card/60">
            <div className="text-sm text-muted-foreground">Resumo</div>
            <div className="mt-1 text-sm">
              {normalized.narrative}
            </div>
            <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
              <div>
                <div className="text-muted-foreground">Média</div>
                <div className="font-mono">{normalized.stats.avgProb.toFixed(2)}%</div>
              </div>
              <div>
                <div className="text-muted-foreground">Máx</div>
                <div className="font-mono">{normalized.stats.maxProb.toFixed(2)}%</div>
              </div>
              <div>
                <div className="text-muted-foreground">{">=95%"}</div>
                <div className="font-mono">{normalized.stats.num95}</div>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />
            <ol className="space-y-4">
              {normalized.list.map((e, i) => (
                <li key={`${e._dateKey}-${i}`} className="relative pl-10">
                  <div className="absolute left-3 top-2 h-2 w-2 rounded-full bg-primary" />
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs text-muted-foreground font-mono">
                      {e.pubdate || "—"}
                    </span>
                    <Badge variant="outline" className={badgeClass(e.classification)}>
                      {e.classification}
                    </Badge>
                    <span className="font-mono text-xs ml-auto">
                      {e.probability.toFixed(2)}%
                    </span>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}


