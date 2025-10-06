"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"
import { Layers, ArrowRight } from "lucide-react"

interface LayerNode {
  name: string
  type: string
  params: string
  output: string
}

export function ModelArchitectureViz() {
  const layers: LayerNode[] = [
    { name: "Input", type: "Input Layer", params: "0", output: "(None, 2001, 1)" },
    { name: "Conv1D-1", type: "Convolutional", params: "128", output: "(None, 2001, 16)" },
    { name: "MaxPool1D", type: "Pooling", params: "0", output: "(None, 1000, 16)" },
    { name: "Conv1D-2", type: "Convolutional", params: "256", output: "(None, 1000, 32)" },
    { name: "Transformer", type: "Attention", params: "4.2K", output: "(None, 1000, 64)" },
    { name: "GlobalPool", type: "Pooling", params: "0", output: "(None, 64)" },
    { name: "Dense-1", type: "Fully Connected", params: "8.2K", output: "(None, 128)" },
    { name: "Dropout", type: "Regularization", params: "0", output: "(None, 128)" },
    { name: "Dense-2", type: "Fully Connected", params: "387", output: "(None, 3)" },
    { name: "Softmax", type: "Activation", params: "0", output: "(None, 3)" },
  ]

  const getLayerColor = (type: string) => {
    switch (type) {
      case "Input Layer":
        return "bg-primary/10 border-primary/30 text-primary"
      case "Convolutional":
        return "bg-accent/10 border-accent/30 text-accent"
      case "Attention":
        return "bg-secondary/10 border-secondary/30 text-secondary"
      case "Fully Connected":
        return "bg-chart-1/10 border-chart-1/30 text-chart-1"
      case "Activation":
        return "bg-chart-2/10 border-chart-2/30 text-chart-2"
      default:
        return "bg-muted border-border text-muted-foreground"
    }
  }

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Layers className="h-5 w-5 text-primary" />
          <CardTitle className="text-2xl">Architecture do Modelo</CardTitle>
        </div>
        <CardDescription>Visualização interativa da rede neural multi-branch</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {layers.map((layer, index) => (
            <div key={index}>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.02, x: 5 }}
                className="cursor-pointer"
              >
                <div className={`p-4 rounded-lg border ${getLayerColor(layer.type)} transition-all`}>
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h4 className="font-semibold">{layer.name}</h4>
                        <Badge variant="outline" className="text-xs">
                          {layer.type}
                        </Badge>
                      </div>
                      <div className="flex gap-6 mt-2 text-xs text-muted-foreground">
                        <span>Params: {layer.params}</span>
                        <span>Output: {layer.output}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {index < layers.length - 1 && (
                <div className="flex justify-center py-1">
                  <ArrowRight className="h-4 w-4 text-muted-foreground/50" />
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-muted/50 rounded-lg border border-border">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-primary">13.2K</div>
              <div className="text-xs text-muted-foreground mt-1">Total Params</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-accent">10</div>
              <div className="text-xs text-muted-foreground mt-1">Camadas</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-secondary">52.8KB</div>
              <div className="text-xs text-muted-foreground mt-1">Tamanho</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-chart-1">~15ms</div>
              <div className="text-xs text-muted-foreground mt-1">Inferência</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
