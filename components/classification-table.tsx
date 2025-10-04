"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"

// Mock data for demonstration
const mockResults = [
  { id: "KOI-1234", classification: "Confirmado", probability: 94.2 },
  { id: "KOI-5678", classification: "Candidato", probability: 78.5 },
  { id: "KOI-9012", classification: "Falso Positivo", probability: 12.3 },
  { id: "KOI-3456", classification: "Confirmado", probability: 89.7 },
  { id: "KOI-7890", classification: "Candidato", probability: 65.4 },
]

export function ClassificationTable() {
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
        <h3 className="text-lg font-semibold mb-4">Classificações Individuais</h3>
        <div className="rounded-lg border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="font-semibold">ID do Objeto</TableHead>
                <TableHead className="font-semibold">Classificação</TableHead>
                <TableHead className="font-semibold text-right">Probabilidade</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockResults.map((result) => (
                <TableRow key={result.id} className="hover:bg-muted/30 transition-colors">
                  <TableCell className="font-mono text-sm">{result.id}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getClassificationColor(result.classification)}>
                      {result.classification}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className={`font-mono font-semibold ${getProbabilityColor(result.probability)}`}>
                      {result.probability.toFixed(1)}%
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
