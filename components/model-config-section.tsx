"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Settings2, Info, Layers, Zap } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useMode } from "@/lib/mode-context"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { usePlanetData } from "@/lib/planet-data-context"

export function ModelConfigSection() {
  const [numTrees, setNumTrees] = useState([100])
  const [learningRate, setLearningRate] = useState([0.01])
  const [epochs, setEpochs] = useState([50])
  const { mode } = useMode()
  const { useHyperparams, setUseHyperparams } = usePlanetData()

  return (
    <section id="model" className="scroll-mt-20">
      <Card className="border-primary/20">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Settings2 className="h-5 w-5 text-primary" />
            <CardTitle className="text-2xl">Model Configuration</CardTitle>
          </div>
          <CardDescription>
            {mode === "explorer"
              ? "Tune model hyperparameters to optimize classification"
              : "Multi‑branch architecture (1D Transformer + 2D CNN + MLP) with physics‑informed constraints"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {mode === "researcher" ? (
            <>
            <div className="flex items-center justify-between p-3 border rounded-xl bg-card/60">
              <div className="text-sm">
                <div className="font-medium">Incluir hiperparâmetros nas requisições</div>
                <div className="text-muted-foreground text-xs">Quando desativado, a aba de hiperparâmetros fica indisponível.</div>
              </div>
              <Switch checked={useHyperparams} onCheckedChange={setUseHyperparams as any} />
            </div>

            <Tabs defaultValue="architecture" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="architecture" className="flex items-center gap-2">
                  <Layers className="h-4 w-4" />
                  Architecture
                </TabsTrigger>
                <TabsTrigger value="hyperparams" className="flex items-center gap-2" disabled={!useHyperparams}>
                  <Settings2 className="h-4 w-4" />
                  Hyperparameters
                </TabsTrigger>
                {/* <TabsTrigger value="training" className="flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  Treinamento
                </TabsTrigger> */}
              </TabsList>

              <TabsContent value="architecture" className="mt-4 space-y-3">
                <div className="grid grid-cols-1 gap-3">
                  <div className="p-3 border border-primary/30 rounded-lg bg-primary/5">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-primary"></div>
                      Transformer 1D
                    </h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">Temporal analysis of light curves with attention mechanism</p>
                  </div>
                  <div className="p-3 border border-accent/30 rounded-lg bg-accent/5">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-accent"></div>
                      CNN 2D
                    </h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">Spatial feature extraction from phase‑folded views</p>
                  </div>
                  <div className="p-3 border border-secondary/30 rounded-lg bg-secondary/5">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-secondary"></div>
                      MLP Fusion
                    </h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">Fusion of features + stellar metadata</p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="hyperparams" className="mt-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6">
                  {/* Number of Trees */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Label htmlFor="numTrees" className="text-sm font-medium">Number of Trees</Label>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <Info className="h-3.5 w-3.5 text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="max-w-xs text-xs">Number of decision trees in the ensemble. More trees generally improve accuracy but increase training time.</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <span className="text-sm font-mono text-primary">{numTrees[0]}</span>
                    </div>
                    <Slider
                      id="numTrees"
                      min={10}
                      max={500}
                      step={10}
                      value={numTrees}
                      onValueChange={setNumTrees}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>10</span>
                      <span>500</span>
                    </div>
                  </div>

                  {/* Learning Rate */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Label htmlFor="learningRate" className="text-sm font-medium">Learning Rate</Label>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <Info className="h-3.5 w-3.5 text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="max-w-xs text-xs">Controls the step size during training. Lower values are more stable but require more epochs.</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <span className="text-sm font-mono text-primary">{learningRate[0].toFixed(3)}</span>
                    </div>
                    <Slider
                      id="learningRate"
                      min={0.001}
                      max={0.1}
                      step={0.001}
                      value={learningRate}
                      onValueChange={setLearningRate}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>0.001</span>
                      <span>0.1</span>
                    </div>
                  </div>

                  {/* Training Epochs */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Label htmlFor="epochs" className="text-sm font-medium">Training Epochs</Label>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <Info className="h-3.5 w-3.5 text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="max-w-xs text-xs">Number of times the model sees the entire dataset during training. More epochs can improve learning.</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <span className="text-sm font-mono text-primary">{epochs[0]}</span>
                    </div>
                    <Slider
                      id="epochs"
                      min={10}
                      max={100}
                      step={5}
                      value={epochs}
                      onValueChange={setEpochs}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>10</span>
                      <span>100</span>
                    </div>
                  </div>
                </div>
              </TabsContent>
{/* 
              <TabsContent value="training" className="mt-6">
                <div className="space-y-4">
                  <div className="p-4 border border-border rounded-lg">
                    <h4 className="font-semibold mb-3">Opções de Treinamento</h4>
                    <div className="space-y-3 text-sm">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input type="checkbox" className="rounded" defaultChecked />
                        <span>Incremental Learning (online updates)</span>
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input type="checkbox" className="rounded" />
                        <span>Federated Learning (multi-institution)</span>
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input type="checkbox" className="rounded" defaultChecked />
                        <span>Data Augmentation (synthetic transits)</span>
                      </label>
                    </div>
                  </div>
                </div>
              </TabsContent> */}
            </Tabs>
            </>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Number of Trees */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="numTrees" className="text-sm font-medium">Number of Trees</Label>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="h-3.5 w-3.5 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs text-xs">Number of decision trees in the ensemble. More trees generally improve accuracy but increase training time.</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <span className="text-sm font-mono text-primary">{numTrees[0]}</span>
                </div>
                <Slider
                  id="numTrees"
                  min={10}
                  max={500}
                  step={10}
                  value={numTrees}
                  onValueChange={setNumTrees}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>10</span>
                  <span>500</span>
                </div>
              </div>

              {/* Learning Rate */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="learningRate" className="text-sm font-medium">Learning Rate</Label>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="h-3.5 w-3.5 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs text-xs">Controls the step size during training. Lower values are more stable but require more epochs.</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <span className="text-sm font-mono text-primary">{learningRate[0].toFixed(3)}</span>
                </div>
                <Slider
                  id="learningRate"
                  min={0.001}
                  max={0.1}
                  step={0.001}
                  value={learningRate}
                  onValueChange={setLearningRate}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>0.001</span>
                  <span>0.1</span>
                </div>
              </div>

              {/* Training Epochs */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="epochs" className="text-sm font-medium">Training Epochs</Label>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="h-3.5 w-3.5 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs text-xs">Number of times the model sees the entire dataset during training. More epochs can improve learning.</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <span className="text-sm font-mono text-primary">{epochs[0]}</span>
                </div>
                <Slider
                  id="epochs"
                  min={10}
                  max={100}
                  step={5}
                  value={epochs}
                  onValueChange={setEpochs}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>10</span>
                  <span>100</span>
                </div>
              </div>
            </div>
          )}

          {/* Configuration Summary */}
          <div className="mt-8 p-4 bg-muted/50 rounded-lg border border-border">
            <h4 className="text-sm font-medium mb-3">Configuration Summary</h4>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Trees:</span>{" "}
                <span className="font-mono font-medium">{numTrees[0]}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Learning rate:</span>{" "}
                <span className="font-mono font-medium">{learningRate[0].toFixed(3)}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Epochs:</span>{" "}
                <span className="font-mono font-medium">{epochs[0]}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  )
}
