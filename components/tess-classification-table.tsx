"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"

interface TessRow {
  id: string
  sector: string
  classification: "Confirmed" | "Candidate" | "False Positive"
  probability: number
}

const tessRows: TessRow[] = [
  { id: "TIC 261136679", sector: "S13", classification: "Confirmed", probability: 88.7 },
  { id: "TIC 183985250", sector: "S27", classification: "Candidate", probability: 71.2 },
  { id: "TIC 402980664", sector: "S21", classification: "False Positive", probability: 18.4 },
]

export function TessClassificationTable() {
  const getClassificationColor = (classification: string) => {
    switch (classification) {
      case "Confirmed":
        return "bg-green-500/10 text-green-500 border-green-500/20"
      case "Candidate":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20"
      case "False Positive":
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
        <h3 className="text-lg font-semibold mb-4">Classificações (TESS)</h3>
        <div className="rounded-lg border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="font-semibold">ID do Objeto</TableHead>
                <TableHead className="font-semibold">Setor</TableHead>
                <TableHead className="font-semibold">Classificação</TableHead>
                <TableHead className="font-semibold text-right">Probabilidade</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tessRows.map((row) => (
                <TableRow key={`${row.id}-${row.sector}`} className="hover:bg-muted/30 transition-colors">
                  <TableCell className="font-mono text-sm">{row.id}</TableCell>
                  <TableCell className="text-sm">{row.sector}</TableCell>
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


