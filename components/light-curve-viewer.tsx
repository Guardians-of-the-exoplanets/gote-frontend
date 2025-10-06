"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Line, LineChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, ReferenceLine, Area } from "recharts"
import { Button } from "@/components/ui/button"
import { ZoomIn, ZoomOut, RotateCcw } from "lucide-react"
import { Slider } from "@/components/ui/slider"

// Generate mock light curve data with transit
const generateLightCurve = () => {
  const data = []
  const transitCenter = 50
  const transitWidth = 5
  const transitDepth = 0.02

  for (let i = 0; i < 100; i++) {
    const time = i
    let flux = 1.0 + (Math.random() - 0.5) * 0.005 // noise

    // Add transit dip
    if (Math.abs(i - transitCenter) < transitWidth) {
      const distance = Math.abs(i - transitCenter) / transitWidth
      flux -= transitDepth * (1 - distance)
    }

    data.push({ time, flux })
  }
  return data
}

export function LightCurveViewer() {
  const [fullData] = useState(generateLightCurve())
  const [zoomLevel, setZoomLevel] = useState(1)
  const [showTransitMarker, setShowTransitMarker] = useState(true)

  const displayData = useMemo(() => {
    if (zoomLevel === 1) return fullData

    const center = 50 // Transit center
    const range = 50 / zoomLevel
    const start = Math.max(0, center - range)
    const end = Math.min(100, center + range)

    return fullData.filter((d) => d.time >= start && d.time <= end)
  }, [fullData, zoomLevel])

  const handleZoomIn = () => setZoomLevel(Math.min(zoomLevel * 1.5, 5))
  const handleZoomOut = () => setZoomLevel(Math.max(zoomLevel / 1.5, 1))
  const handleReset = () => setZoomLevel(1)

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl">Interactive Light Curve</CardTitle>
            <CardDescription>Light curve visualization with traffic detection</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={handleZoomOut} disabled={zoomLevel <= 1}>
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={handleZoomIn} disabled={zoomLevel >= 5}>
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={handleReset}>
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <ChartContainer
          config={{
            flux: {
              label: "Fluxo Normalizado",
              color: "hsl(var(--primary))",
            },
          }}
          className="h-[320px] sm:h-[400px] w-full"
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={displayData} margin={{ top: 10, right: 30, left: 10, bottom: 20 }}>
              <defs>
                <linearGradient id="fluxGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="time"
                label={{ value: "Tempo (dias)", position: "insideBottom", offset: -5 }}
                tick={{ fontSize: 10 }}
                interval="preserveStartEnd"
                minTickGap={30}
              />
              <YAxis
                label={{ value: "Fluxo Normalizado", angle: -90, position: "insideLeft" }}
                domain={[0.97, 1.01]}
                tick={{ fontSize: 10 }}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              {showTransitMarker && (
                <ReferenceLine x={50} stroke="hsl(var(--accent))" strokeDasharray="3 3" label="Trânsito" />
              )}
              <Area type="monotone" dataKey="flux" stroke="none" fill="url(#fluxGradient)" />
              <Line type="monotone" dataKey="flux" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Zoom: {zoomLevel.toFixed(1)}x</label>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowTransitMarker(!showTransitMarker)}
              className={showTransitMarker ? "bg-accent/10" : ""}
            >
              {showTransitMarker ? "Ocultar" : "Mostrar"} Marker
            </Button>
          </div>
          <Slider
            value={[zoomLevel]}
            onValueChange={(value) => setZoomLevel(value[0])}
            min={1}
            max={5}
            step={0.1}
            className="w-full"
          />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-4 border-t border-border">
          <div className="p-3 bg-muted/50 rounded-lg text-center">
            <div className="text-xs text-muted-foreground mb-1">Period</div>
            <div className="text-lg font-bold">3.45d</div>
          </div>
          <div className="p-3 bg-muted/50 rounded-lg text-center">
            <div className="text-xs text-muted-foreground mb-1">Depth</div>
            <div className="text-lg font-bold">2.0%</div>
          </div>
          <div className="p-3 bg-muted/50 rounded-lg text-center">
            <div className="text-xs text-muted-foreground mb-1">Duration</div>
            <div className="text-lg font-bold">4.2h</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
