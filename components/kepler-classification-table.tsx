"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"

type KeplerDataset = "kepler" | "k2"

interface KeplerRow {
  id: string
  campaign: string
  classification: "Confirmado" | "Candidato" | "Falso Positivo"
  probability: number
}

const keplerRows: KeplerRow[] = [
  { id: "KOI-1234", campaign: "Q1-Q17", classification: "Confirmado", probability: 94.2 },
  { id: "KOI-5678", campaign: "Q9", classification: "Candidato", probability: 78.5 },
  { id: "KOI-9012", campaign: "Q6", classification: "Falso Positivo", probability: 12.3 },
]

const k2Rows: KeplerRow[] = [
  { id: "EPIC 201367065", campaign: "C1", classification: "Confirmado", probability: 91.4 },
  { id: "EPIC 206103150", campaign: "C3", classification: "Candidato", probability: 63.9 },
  { id: "EPIC 212521166", campaign: "C6", classification: "Falso Positivo", probability: 22.1 },
]

export function KeplerClassificationTable({ dataset }: { dataset: KeplerDataset }) {
  const rows = dataset === "k2" ? k2Rows : keplerRows

  const getClassificationColor = (classification: string) => {
    switch (classification) {
      case "Confirmado":
        return "bg-green-500/10 text-green-500 border-green-500/20"
      case "Candidato":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20"
      case "Falso Positivo":
        return "bg-red-500/10 text-red-500 border-red-500/20"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const getProbabilityColor = (probability: number) => {
    if (probability >= 80) return "text-green-500"
    if (probability >= 50) return "text-blue-500"
    return "text-red-500"
  }

  return (
    <Card className="bg-card/50">
      <div className="p-6">
        <h3 className="text-lg font-semibold mb-4">Classificações ({dataset.toUpperCase()})</h3>
        <div className="rounded-lg border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="font-semibold">ID do Objeto</TableHead>
                <TableHead className="font-semibold">Campanha</TableHead>
                <TableHead className="font-semibold">Classificação</TableHead>
                <TableHead className="font-semibold text-right">Probabilidade</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={`${row.id}-${row.campaign}`} className="hover:bg-muted/30 transition-colors">
                  <TableCell className="font-mono text-sm">{row.id}</TableCell>
                  <TableCell className="text-sm">{row.campaign}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getClassificationColor(row.classification)}>
                      {row.classification}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className={`font-mono font-semibold ${getProbabilityColor(row.probability)}`}>
                      {row.probability.toFixed(1)}%
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </Card>
  )
}


