"use client"

import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls, Environment, PerspectiveCamera, Html, Stars } from "@react-three/drei"
import { Suspense, useRef, useMemo } from "react"
import * as THREE from "three"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Info } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { EffectComposer, Bloom } from "@react-three/postprocessing"

interface PlanetData {
  radius?: number // Earth radii
  mass?: number // Earth masses
  temperature?: number // Kelvin
  orbitalPeriod?: number // days
  stellarFlux?: number // relative to Earth
  density?: number // g/cm³
}

function getPlanetType(data: PlanetData): string {
  const radius = data.radius || 1
  const density = data.density || 5.5

  if (radius < 1.5) return "rocky"
  if (radius < 4 && density > 2) return "super-earth"
  if (radius < 6) return "neptune"
  return "jupiter"
}

function createPlanetTexture(type: string, temperature: number, classification?: string): THREE.Texture {
  const canvas = document.createElement("canvas")
  canvas.width = 1024
  canvas.height = 512
  const ctx = canvas.getContext("2d")!

  // Enhanced noise function for better procedural generation
  const noise = (x: number, y: number, scale: number) => {
    return Math.sin(x * scale) * Math.cos(y * scale) + Math.sin(x * scale * 2.3) * Math.cos(y * scale * 1.7)
  }

  const turbulence = (x: number, y: number) => {
    let value = 0
    let amplitude = 1
    let frequency = 1
    for (let i = 0; i < 4; i++) {
      value += noise(x * frequency, y * frequency, 0.1) * amplitude
      amplitude *= 0.5
      frequency *= 2
    }
    return value
  }

  // Draw based on planet type and classification
  if (type === "rocky") {
    const isHabitable = temperature > 250 && temperature < 350
    const isConfirmed = classification === "Confirmado"

    for (let y = 0; y < canvas.height; y++) {
      for (let x = 0; x < canvas.width; x++) {
        const n = turbulence(x / 50, y / 50)
        const detail = noise(x / 20, y / 20, 0.3) * 0.5
        const combined = n + detail

        let r, g, b

        if (isHabitable) {
          // Earth-like with varied terrain
          if (combined > 0.3) {
            // Mountains and highlands
            const height = (combined - 0.3) * 2
            r = 100 + height * 80
            g = 90 + height * 70
            b = 60 + height * 40
          } else if (combined > 0.1) {
            // Plains and lowlands
            r = 80 + combined * 100
            g = 120 + combined * 80
            b = 60 + combined * 50
          } else {
            // Oceans with depth variation
            const depth = Math.abs(combined)
            r = 20 + depth * 30
            g = 60 + depth * 80
            b = 120 + depth * 100
          }

          // Add ice caps at poles
          const latitude = Math.abs(y - canvas.height / 2) / (canvas.height / 2)
          if (latitude > 0.8) {
            const iceFactor = (latitude - 0.8) * 5
            r = r * (1 - iceFactor) + 255 * iceFactor
            g = g * (1 - iceFactor) + 255 * iceFactor
            b = b * (1 - iceFactor) + 255 * iceFactor
          }
        } else if (temperature > 500) {
          // Hot rocky - volcanic with lava flows
          const lavaFlow = noise(x / 30, y / 30, 0.2)
          if (lavaFlow > 0.5) {
            // Lava
            r = 255
            g = 100 + lavaFlow * 80
            b = 30
          } else {
            // Cooled rock
            r = 80 + combined * 70
            g = 40 + combined * 40
            b = 30 + combined * 30
          }
        } else {
          // Cold rocky - icy with craters
          const crater = Math.abs(noise(x / 15, y / 15, 0.5))
          r = 150 + combined * 80 - crater * 50
          g = 150 + combined * 80 - crater * 50
          b = 160 + combined * 80 - crater * 40
        }

        ctx.fillStyle = `rgb(${Math.max(0, Math.min(255, r))},${Math.max(0, Math.min(255, g))},${Math.max(0, Math.min(255, b))})`
        ctx.fillRect(x, y, 1, 1)
      }
    }
  } else if (type === "jupiter" || type === "neptune") {
    // Gas giant with enhanced band patterns
    for (let y = 0; y < canvas.height; y++) {
      const bandNoise = noise(0, y / 30, 0.2) * 0.3
      const turbulence = noise(y / 10, y / 15, 0.5) * 30

      for (let x = 0; x < canvas.width; x++) {
        const xNoise = noise(x / 40 + turbulence, y / 40, 0.15)
        const storm = Math.abs(noise(x / 60, y / 60, 0.1))
        const band = Math.sin((y + xNoise * 20) / 25) + bandNoise

        let r, g, b
        if (type === "jupiter") {
          // Jupiter-like with Great Red Spot effect
          if (storm > 0.7 && y > canvas.height * 0.4 && y < canvas.height * 0.6) {
            r = 220 + storm * 35
            g = 100 + storm * 50
            b = 80 + storm * 40
          } else {
            r = 200 + band * 55
            g = 150 + band * 50
            b = 100 + band * 40
          }
        } else {
          // Neptune-like with dynamic storms
          if (storm > 0.75) {
            r = 100 + storm * 60
            g = 140 + storm * 80
            b = 200 + storm * 55
          } else {
            r = 60 + band * 40
            g = 100 + band * 60
            b = 180 + band * 75
          }
        }

        ctx.fillStyle = `rgb(${Math.max(0, Math.min(255, r))},${Math.max(0, Math.min(255, g))},${Math.max(0, Math.min(255, b))})`
        ctx.fillRect(x, y, 1, 1)
      }
    }
  } else {
    // Super-Earth - mix of features
    for (let y = 0; y < canvas.height; y++) {
      for (let x = 0; x < canvas.width; x++) {
        const n = turbulence(x / 40, y / 40)
        const r = 120 + n * 70
        const g = 140 + n * 60
        const b = 100 + n * 80

        ctx.fillStyle = `rgb(${Math.max(0, Math.min(255, r))},${Math.max(0, Math.min(255, g))},${Math.max(0, Math.min(255, b))})`
        ctx.fillRect(x, y, 1, 1)
      }
    }
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.needsUpdate = true
  return texture
}

function createNormalMap(type: string): THREE.Texture {
  const canvas = document.createElement("canvas")
  canvas.width = 512
  canvas.height = 256
  const ctx = canvas.getContext("2d")!

  const noise = (x: number, y: number) => {
    return Math.sin(x * 0.1) * Math.cos(y * 0.1) + Math.sin(x * 0.3) * Math.cos(y * 0.2)
  }

  for (let y = 0; y < canvas.height; y++) {
    for (let x = 0; x < canvas.width; x++) {
      const n = noise(x, y)
      const intensity = type === "rocky" ? 128 + n * 60 : 128 + n * 20
      ctx.fillStyle = `rgb(${intensity},${intensity},255)`
      ctx.fillRect(x, y, 1, 1)
    }
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.needsUpdate = true
  return texture
}

function Planet({ data, classification }: { data: PlanetData; classification?: string }) {
  const meshRef = useRef<THREE.Mesh>(null)
  const radius = Math.max(0.5, Math.min(3, (data.radius || 1) / 2))
  const type = getPlanetType(data)
  const temp = data.temperature || 288

  const texture = useMemo(() => createPlanetTexture(type, temp, classification), [type, temp, classification])
  const normalMap = useMemo(() => createNormalMap(type), [type])

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.1
    }
  })

  const materialProps = useMemo(() => {
    if (type === "rocky") {
      return {
        roughness: 0.85,
        metalness: 0.05,
        emissive: temp > 800 ? new THREE.Color(0xff4500) : new THREE.Color(0x000000),
        emissiveIntensity: temp > 800 ? 0.4 : 0,
        envMapIntensity: 0.6,
      }
    } else if (type === "jupiter" || type === "neptune") {
      return {
        roughness: 0.3,
        metalness: 0.0,
        emissive: new THREE.Color(0x000000),
        emissiveIntensity: 0,
        envMapIntensity: 0.8,
      }
    } else {
      return {
        roughness: 0.5,
        metalness: 0.15,
        emissive: new THREE.Color(0x000000),
        emissiveIntensity: 0,
        envMapIntensity: 0.7,
      }
    }
  }, [type, temp])

  const hasAtmosphere = type !== "rocky" || (data.mass || 1) > 0.5
  const atmosphereColor = temp > 800 ? "#ff6600" : temp > 400 ? "#ffaa44" : "#88ccff"

  return (
    <group>
      <mesh ref={meshRef} castShadow receiveShadow>
        <sphereGeometry args={[radius, 128, 128]} />
        <meshStandardMaterial
          map={texture}
          normalMap={normalMap}
          normalScale={new THREE.Vector2(0.8, 0.8)}
          {...materialProps}
        />
      </mesh>

      {hasAtmosphere && (
        <mesh scale={1.08}>
          <sphereGeometry args={[radius, 64, 64]} />
          <meshPhongMaterial
            color={atmosphereColor}
            transparent
            opacity={0.18}
            side={THREE.BackSide}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      )}

      {/* Cloud layer for habitable planets */}
      {temp > 250 && temp < 350 && type === "rocky" && (
        <mesh scale={1.02}>
          <sphereGeometry args={[radius, 64, 64]} />
          <meshPhongMaterial color="#ffffff" transparent opacity={0.25} depthWrite={false} />
        </mesh>
      )}

      {temp > 800 && (
        <>
          <mesh scale={1.15}>
            <sphereGeometry args={[radius, 32, 32]} />
            <meshBasicMaterial
              color="#ff4500"
              transparent
              opacity={0.25}
              side={THREE.BackSide}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
            />
          </mesh>
          <mesh scale={1.25}>
            <sphereGeometry args={[radius, 32, 32]} />
            <meshBasicMaterial
              color="#ff6600"
              transparent
              opacity={0.1}
              side={THREE.BackSide}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
            />
          </mesh>
        </>
      )}
    </group>
  )
}

function EarthPlanet() {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.1
    }
  })

  const earthTexture = useMemo(() => {
    const canvas = document.createElement("canvas")
    canvas.width = 2048
    canvas.height = 1024
    const ctx = canvas.getContext("2d")!

    const noise = (x: number, y: number, scale: number) => {
      return Math.sin(x * scale) * Math.cos(y * scale) + Math.sin(x * scale * 2.3) * Math.cos(y * scale * 1.7)
    }

    const turbulence = (x: number, y: number) => {
      let value = 0
      let amplitude = 1
      let frequency = 1
      for (let i = 0; i < 5; i++) {
        value += noise(x * frequency, y * frequency, 0.05) * amplitude
        amplitude *= 0.5
        frequency *= 2
      }
      return value
    }

    for (let y = 0; y < canvas.height; y++) {
      for (let x = 0; x < canvas.width; x++) {
        const n = turbulence(x / 80, y / 80)
        const detail = noise(x / 30, y / 30, 0.2) * 0.3
        const combined = n + detail

        let r, g, b

        if (combined > 0.25) {
          // Land - varied terrain
          const height = (combined - 0.25) * 1.5
          r = 90 + height * 90
          g = 110 + height * 80
          b = 50 + height * 40
        } else if (combined > 0.15) {
          // Coastal areas
          r = 70 + combined * 120
          g = 130 + combined * 100
          b = 70 + combined * 80
        } else {
          // Ocean with depth
          const depth = Math.abs(combined)
          r = 15 + depth * 40
          g = 50 + depth * 100
          b = 100 + depth * 130
        }

        // Ice caps at poles
        const latitude = Math.abs(y - canvas.height / 2) / (canvas.height / 2)
        if (latitude > 0.85) {
          const iceFactor = (latitude - 0.85) * 6.67
          r = r * (1 - iceFactor) + 255 * iceFactor
          g = g * (1 - iceFactor) + 255 * iceFactor
          b = b * (1 - iceFactor) + 255 * iceFactor
        }

        ctx.fillStyle = `rgb(${Math.max(0, Math.min(255, r))},${Math.max(0, Math.min(255, g))},${Math.max(0, Math.min(255, b))})`
        ctx.fillRect(x, y, 1, 1)
      }
    }

    const texture = new THREE.CanvasTexture(canvas)
    texture.needsUpdate = true
    return texture
  }, [])

  return (
    <group>
      <mesh ref={meshRef} castShadow receiveShadow>
        <sphereGeometry args={[1, 128, 128]} />
        <meshStandardMaterial map={earthTexture} roughness={0.85} metalness={0.05} envMapIntensity={0.6} />
      </mesh>

      {/* Earth's atmosphere */}
      <mesh scale={1.08}>
        <sphereGeometry args={[1, 64, 64]} />
        <meshPhongMaterial
          color="#88ccff"
          transparent
          opacity={0.18}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Clouds layer */}
      <mesh scale={1.02}>
        <sphereGeometry args={[1, 64, 64]} />
        <meshPhongMaterial color="#ffffff" transparent opacity={0.25} depthWrite={false} />
      </mesh>
    </group>
  )
}

function Scene({
  data,
  isEarth = false,
  classification,
}: { data: PlanetData; isEarth?: boolean; classification?: string }) {
  const temp = isEarth ? 288 : data.temperature || 288
  const starColor = temp > 1000 ? "#ffaa66" : temp > 500 ? "#ffdd99" : "#ffffee"

  const cameraPosition: [number, number, number] = isEarth ? [-2, 0, 8] : [2, 0, 8]

  return (
    <>
      <PerspectiveCamera makeDefault position={cameraPosition} fov={50} />
      <OrbitControls
        enableZoom={true}
        enablePan={false}
        minDistance={4}
        maxDistance={15}
        autoRotate
        autoRotateSpeed={0.5}
      />

      <ambientLight intensity={0.15} color="#ffffff" />

      {/* Main star light - key light */}
      <directionalLight
        position={[10, 5, 5]}
        intensity={2.5}
        color={starColor}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={50}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />

      {/* Rim light for depth */}
      <directionalLight position={[-8, 3, -5]} intensity={0.8} color="#6699ff" />

      {/* Fill light */}
      <pointLight position={[-10, -5, -5]} intensity={0.4} color="#4169e1" />

      {/* Subtle accent light */}
      <pointLight position={[5, -8, 8]} intensity={0.3} color="#ff8844" />

      {isEarth ? <EarthPlanet /> : <Planet data={data} classification={classification} />}

      <Stars radius={150} depth={80} count={8000} factor={5} saturation={0.1} fade speed={0.5} />

      <Environment preset="night" background={false} />

      <EffectComposer>
        <Bloom intensity={0.3} luminanceThreshold={0.9} luminanceSmoothing={0.9} mipmapBlur />
      </EffectComposer>
    </>
  )
}

interface PlanetVisualizationProps {
  data?: PlanetData
  className?: string
  comparisonMode?: boolean
  classification?: string
}

export function PlanetVisualization({
  data = {},
  className = "",
  comparisonMode = false,
  classification,
}: PlanetVisualizationProps) {
  const type = getPlanetType(data)
  const temp = data.temperature || 288

  const typeDescriptions: Record<string, string> = {
    rocky: "Rocky Planet - Similar to Earth, with a solid surface",
"super-earth": "Super-Earth - Rocky planet larger than Earth",
    neptune: "Neptune-like ice giant with thick atmosphere",
    jupiter: "Gas Giant - Similar to Jupiter, composed primarily of gases",
  }

  const tempDescription =
    temp > 1500
      ? "Extremely hot - Surface likely molten"
      : temp > 800
        ? "Very hot - Lava temperature"
        : temp > 400
          ? "Hot - No liquid water possible"
          : temp > 200 && temp < 350
            ? "Temperate - Potentially habitable"
            : temp > 100
              ? "Cold - Freeze water"
              : "Very cold - Icy surface"

  const isHabitable = temp > 250 && temp < 350 && type === "rocky" && (data.radius || 1) < 2
  const habitabilityScore =
    isHabitable && (data.stellarFlux || 1) > 0.5 && (data.stellarFlux || 1) < 2 ? "Alta" : "Baixa"

  const earthData: PlanetData = {
    radius: 1,
    mass: 1,
    temperature: 288,
    orbitalPeriod: 365.25,
    stellarFlux: 1,
    density: 5.51,
  }

  if (comparisonMode) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Earth visualization */}
          <Card className="gradient-border bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-xl">Earth (Reference)</CardTitle>
              <CardDescription>Our home planet for comparison</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="w-full h-[320px] sm:h-[400px] rounded-xl overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border border-border shadow-2xl">
                <Canvas>
                  <Suspense fallback={<LoadingFallback />}>
                    <Scene data={earthData} isEarth={true} />
                  </Suspense>
                </Canvas>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-4 text-sm">
                <div className="p-2 bg-muted/50 rounded border border-border/50">
                  <div className="text-muted-foreground text-xs">Ray</div>
                  <div className="font-semibold">1.00 R⊕</div>
                </div>
                <div className="p-2 bg-muted/50 rounded border border-border/50">
                  <div className="text-muted-foreground text-xs">Mass</div>
                  <div className="font-semibold">1.00 M⊕</div>
                </div>
                <div className="p-2 bg-muted/50 rounded border border-border/50">
                  <div className="text-muted-foreground text-xs">Temperature</div>
                  <div className="font-semibold">288 K</div>
                </div>
                <div className="p-2 bg-muted/50 rounded border border-border/50">
                  <div className="text-muted-foreground text-xs">Density</div>
                  <div className="font-semibold">5.51 g/cm³</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Exoplanet visualization */}
          <Card className="gradient-border bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-xl">Exoplanet Discovered</CardTitle>
                  <CardDescription>Characteristics based on observed data</CardDescription>
                </div>
                {isHabitable && (
                  <Badge variant="default" className="bg-green-500/20 text-green-400 border-green-500/30">
                   Habitable Zone
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="w-full h-[320px] sm:h-[400px] rounded-xl overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border border-border shadow-2xl">
                <Canvas>
                  <Suspense fallback={<LoadingFallback />}>
                    <Scene data={data} isEarth={false} classification={classification} />
                  </Suspense>
                </Canvas>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-4 text-sm">
                <div className="p-2 bg-muted/50 rounded border border-border/50">
                  <div className="text-muted-foreground text-xs">Ray</div>
                  <div className="font-semibold">{(data.radius || 1).toFixed(2)} R⊕</div>
                </div>
                <div className="p-2 bg-muted/50 rounded border border-border/50">
                  <div className="text-muted-foreground text-xs">Mass</div>
                  <div className="font-semibold">{(data.mass || 1).toFixed(2)} M⊕</div>
                </div>
                <div className="p-2 bg-muted/50 rounded border border-border/50">
                  <div className="text-muted-foreground text-xs">Temperature</div>
                  <div className="font-semibold">{Math.round(temp)} K</div>
                </div>
                <div className="p-2 bg-muted/50 rounded border border-border/50">
                  <div className="text-muted-foreground text-xs">Density</div>
                  <div className="font-semibold">{(data.density || 5.5).toFixed(2)} g/cm³</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Comparison summary */}
        <Alert className="border-primary/30 bg-gradient-to-r from-primary/10 to-accent/10">
          <Info className="h-4 w-4" />
          <AlertDescription className="space-y-2">
            <div>
              <strong>Type:</strong> {typeDescriptions[type]}
            </div>
            <div>
              <strong>Size Comparison:</strong>{" "}
              {(data.radius || 1) > 1.5
                ? `${((data.radius || 1) / 1).toFixed(1)}x maior que a Terra`
                : (data.radius || 1) < 0.8
                  ? `${(1 / (data.radius || 1)).toFixed(1)}x menor que a Terra`
                  : "Tamanho similar à Terra"}
            </div>
            <div>
              <strong>Temperature:</strong> {tempDescription} (~{Math.round(temp)}K vs 288K da Terra)
            </div>
            {isHabitable && (
              <div>
                <strong>Skills:</strong> {habitabilityScore} - Favorable conditions for liquid water
              </div>
            )}
            <div className="text-xs text-muted-foreground mt-2">
              💡 Drag to rotate, scroll to zoom. Zoom is proportional to facilitate size comparison.
            </div>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <Card className={`gradient-border bg-card/50 backdrop-blur-sm ${className}`}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-2xl">3D Visualization of the Exoplanet</CardTitle>
            <CardDescription>Representation based on physical characteristics and estimated composition</CardDescription>
          </div>
          {isHabitable && (
            <Badge variant="default" className="bg-green-500/20 text-green-400 border-green-500/30">
             Habitable Zone
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="w-full h-[360px] sm:h-[500px] rounded-xl overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border border-border shadow-2xl">
          <Canvas>
            <Suspense fallback={<LoadingFallback />}>
              <Scene data={data} classification={classification} />
            </Suspense>
          </Canvas>
        </div>

        <Alert className="border-primary/30 bg-gradient-to-r from-primary/10 to-accent/10">
          <Info className="h-4 w-4" />
          <AlertDescription className="space-y-2">
            <div>
              <strong>Type:</strong> {typeDescriptions[type]}
            </div>
            <div>
              <strong>Temperature:</strong> {tempDescription} (~{Math.round(temp)}K / {Math.round(temp - 273.15)}°C)
            </div>
            {isHabitable && (
              <div>
                <strong>Habitability:</strong> {habitabilityScore} - Favorable conditions for liquid water
              </div>
            )}
            <div className="text-xs text-muted-foreground mt-2">
              💡 Drag to rotate, scroll to zoom. Textures and colors are procedurally generated based on the physical data.
            </div>
          </AlertDescription>
        </Alert>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
            <div className="text-muted-foreground text-xs mb-1">Ray</div>
            <div className="font-semibold">{(data.radius || 1).toFixed(2)} R⊕</div>
          </div>
          <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
            <div className="text-muted-foreground text-xs mb-1">Mass</div>
            <div className="font-semibold">{(data.mass || 1).toFixed(2)} M⊕</div>
          </div>
          <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
            <div className="text-muted-foreground text-xs mb-1">Density</div>
            <div className="font-semibold">{(data.density || 5.5).toFixed(2)} g/cm³</div>
          </div>
          <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
            <div className="text-muted-foreground text-xs mb-1">Stellar Flow</div>
            <div className="font-semibold">{(data.stellarFlux || 1).toFixed(2)} S⊕</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function LoadingFallback() {
  return (
    <Html center>
      <div className="flex items-center gap-2 text-primary">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span className="text-sm">Generating planet...</span>
      </div>
    </Html>
  )
}
