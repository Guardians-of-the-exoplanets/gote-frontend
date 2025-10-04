import { NextResponse } from "next/server"

// Simulated ML model prediction
// In production, this would load the actual trained model
function predictExoplanet(features: {
  orbitalPeriod: number
  planetRadius: number
  equilibriumTemp: number
  stellarMagnitude: number
  transitDepth: number
  transitDuration: number
  signalToNoise: number
}) {
  // Simple heuristic-based classification for demonstration
  // In production, this would use the actual trained model

  const { orbitalPeriod, planetRadius, transitDepth, transitDuration, signalToNoise } = features

  // Calculate a confidence score based on typical exoplanet characteristics
  let score = 50 // Base score

  // Orbital period in habitable zone range (increases confidence)
  if (orbitalPeriod > 10 && orbitalPeriod < 500) score += 15

  // Planet radius in typical range (Earth to Neptune size)
  if (planetRadius > 0.5 && planetRadius < 4) score += 15

  // Transit depth consistency
  if (transitDepth > 0.001 && transitDepth < 0.1) score += 10

  // Transit duration reasonable
  if (transitDuration > 1 && transitDuration < 12) score += 10

  // Strong signal to noise ratio
  if (signalToNoise > 7) score += 20
  else if (signalToNoise > 4) score += 10

  // Add some randomness to simulate model uncertainty
  score += (Math.random() - 0.5) * 10

  // Clamp between 0 and 100
  score = Math.max(0, Math.min(100, score))

  // Determine classification
  let classification: "Confirmado" | "Candidato" | "Falso Positivo"
  if (score >= 75) {
    classification = "Confirmado"
  } else if (score >= 40) {
    classification = "Candidato"
  } else {
    classification = "Falso Positivo"
  }

  return {
    classification,
    probability: score,
    confidence: score >= 75 ? "Alta" : score >= 40 ? "Média" : "Baixa",
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const {
      orbitalPeriod,
      planetRadius,
      equilibriumTemp,
      stellarMagnitude,
      transitDepth,
      transitDuration,
      signalToNoise,
    } = body

    // Validate inputs
    if (!orbitalPeriod || !planetRadius || !transitDuration) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 })
    }

    // Make prediction
    const prediction = predictExoplanet({
      orbitalPeriod: Number.parseFloat(orbitalPeriod),
      planetRadius: Number.parseFloat(planetRadius),
      equilibriumTemp: Number.parseFloat(equilibriumTemp) || 500,
      stellarMagnitude: Number.parseFloat(stellarMagnitude) || 12,
      transitDepth: Number.parseFloat(transitDepth) || 0.01,
      transitDuration: Number.parseFloat(transitDuration),
      signalToNoise: Number.parseFloat(signalToNoise) || 10,
    })

    console.log("Classification prediction:", prediction)

    return NextResponse.json({
      success: true,
      prediction,
    })
  } catch (error) {
    console.error("Classification error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
