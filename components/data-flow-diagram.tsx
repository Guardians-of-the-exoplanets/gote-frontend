"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Database, Cpu, BarChart3, FileOutput } from "lucide-react"
import { motion } from "framer-motion"

export function DataFlowDiagram() {
  const nodes = [
    { id: 1, icon: Database, label: "Dados Brutos", color: "primary" },
    { id: 2, icon: Cpu, label: "Pré-processamento", color: "accent" },
    { id: 3, icon: BarChart3, label: "Modelo ML", color: "secondary" },
    { id: 4, icon: FileOutput, label: "Resultados", color: "primary" },
  ]

  return (
    <Card className="border-primary/20 h-full">
      <CardHeader>
        <CardTitle className="text-2xl">Fluxo de Dados</CardTitle>
        <CardDescription className="line-clamp-2">Arquitetura modular do sistema de classificação</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap items-center justify-center gap-3">
          {nodes.map((node, index) => (
            <div key={node.id} className="flex items-center gap-3">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: index * 0.2, type: "spring" }}
                className="w-32 sm:w-36"
              >
                <div
                  className={`p-4 rounded-xl border border-${node.color}/30 bg-${node.color}/5 text-center space-y-2 overflow-hidden`}
                >
                  <div className={`inline-flex p-2.5 rounded-lg bg-gradient-to-br from-${node.color} to-accent`}>
                    <node.icon className="h-5 w-5 text-white" />
                  </div>
                  <div className="font-semibold text-xs line-clamp-2 text-balance">{node.label}</div>
                </div>
              </motion.div>

              {index < nodes.length - 1 && (
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: index * 0.2 + 0.1 }}
                  className="hidden sm:block flex-shrink-0"
                >
                  <div className="h-0.5 w-6 bg-gradient-to-r from-primary to-accent" />
                </motion.div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
