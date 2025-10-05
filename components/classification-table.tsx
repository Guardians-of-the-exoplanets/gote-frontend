"use client"

import { useMemo, useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination"

// Mock data for demonstration
const mockResults = [
  { id: "KOI-1234", classification: "Confirmed", probability: 94.2 },
  { id: "KOI-5678", classification: "Candidate", probability: 78.5 },
  { id: "KOI-9012", classification: "False Positive", probability: 12.3 },
  { id: "KOI-3456", classification: "Confirmed", probability: 89.7 },
  { id: "KOI-7890", classification: "Candidate", probability: 65.4 },
]

export function ClassificationTable() {
  const [currentPage, setCurrentPage] = useState(1)
  const rowsPerPage = 8

  const totalPages = Math.ceil(mockResults.length / rowsPerPage)

  const visibleRows = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage
    const endIndex = startIndex + rowsPerPage
    return mockResults.slice(startIndex, endIndex)
  }, [currentPage])

  const goToPage = (nextPage: number) => {
    if (nextPage < 1 || nextPage > totalPages) return
    setCurrentPage(nextPage)
  }

  const renderPageNumbers = () => {
    const items: (number | "ellipsis")[] = []
    const maxButtons = 5
    if (totalPages <= maxButtons) {
      for (let i = 1; i <= totalPages; i++) items.push(i)
    } else {
      const left = Math.max(2, currentPage - 1)
      const right = Math.min(totalPages - 1, currentPage + 1)
      items.push(1)
      if (left > 2) items.push("ellipsis")
      for (let i = left; i <= right; i++) items.push(i)
      if (right < totalPages - 1) items.push("ellipsis")
      items.push(totalPages)
    }
    return items
  }

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
        <h3 className="text-lg font-semibold mb-4">Individual Classifications</h3>
        <div className="rounded-lg border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="font-semibold">Object ID</TableHead>
                <TableHead className="font-semibold">Classification</TableHead>
                <TableHead className="font-semibold text-right">Probability</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visibleRows.map((result) => (
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
        {mockResults.length > rowsPerPage && (
          <div className="mt-4">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault()
                      goToPage(currentPage - 1)
                    }}
                    className={currentPage === 1 ? "pointer-events-none opacity-50" : undefined}
                  />
                </PaginationItem>
                {renderPageNumbers().map((item, idx) => (
                  <PaginationItem key={`${item}-${idx}`}>
                    {item === "ellipsis" ? (
                      <PaginationEllipsis />
                    ) : (
                      <PaginationLink
                        href="#"
                        isActive={item === currentPage}
                        onClick={(e) => {
                          e.preventDefault()
                          goToPage(item as number)
                        }}
                      >
                        {item}
                      </PaginationLink>
                    )}
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault()
                      goToPage(currentPage + 1)
                    }}
                    className={currentPage === totalPages ? "pointer-events-none opacity-50" : undefined}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>
    </Card>
  )
}
