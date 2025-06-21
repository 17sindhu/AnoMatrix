// API configuration and utilities
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

export interface NetworkFlowData {
  "Flow Duration": number
  "Tot Fwd Pkts": number
  "Tot Bwd Pkts": number
  "TotLen Fwd Pkts": number
  "TotLen Bwd Pkts": number
  "Fwd Pkt Len Mean": number
  "Bwd Pkt Len Mean": number
  "Flow IAT Mean": number
  "Flow IAT Std": number
  "Fwd IAT Mean": number
}

export interface PredictionResponse {
  prediction: number
  status: "Anomaly" | "Normal"
}

export interface ApiError {
  error: string
  required?: string[]
}

// Check if Flask API is available
export async function checkApiHealth(): Promise<boolean> {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 3000) // 3 second timeout

    const response = await fetch(`${API_BASE_URL}/`, {
      signal: controller.signal,
      mode: "cors",
    })
    clearTimeout(timeoutId)
    return response.ok
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      console.warn("API health check timed out")
    } else {
      console.warn("API health check failed:", error)
    }
    return false
  }
}

// Send network flow data to Flask API for anomaly prediction
export async function predictAnomaly(flowData: NetworkFlowData): Promise<PredictionResponse> {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 second timeout

    const response = await fetch(`${API_BASE_URL}/predict`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(flowData),
      signal: controller.signal,
      mode: "cors",
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      const errorData: ApiError = await response.json()
      throw new Error(errorData.error || "Prediction failed")
    }

    return await response.json()
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      console.warn("Prediction API request timed out")
    } else {
      console.warn("Prediction API error:", error)
    }

    // Return mock prediction when API is unavailable
    return generateMockPrediction(flowData)
  }
}

// Generate realistic network flow data for simulation
export function generateNetworkFlowData(): NetworkFlowData {
  return {
    "Flow Duration": Math.random() * 1000000 + 1000, // 1ms to 1s
    "Tot Fwd Pkts": Math.floor(Math.random() * 100) + 1,
    "Tot Bwd Pkts": Math.floor(Math.random() * 50) + 1,
    "TotLen Fwd Pkts": Math.random() * 10000 + 100,
    "TotLen Bwd Pkts": Math.random() * 5000 + 50,
    "Fwd Pkt Len Mean": Math.random() * 1500 + 64, // Typical packet sizes
    "Bwd Pkt Len Mean": Math.random() * 1500 + 64,
    "Flow IAT Mean": Math.random() * 100000 + 1000,
    "Flow IAT Std": Math.random() * 50000 + 500,
    "Fwd IAT Mean": Math.random() * 80000 + 800,
  }
}

// Generate anomalous network flow data (more extreme values)
export function generateAnomalousFlowData(): NetworkFlowData {
  const isHighTraffic = Math.random() > 0.5

  if (isHighTraffic) {
    // High traffic anomaly
    return {
      "Flow Duration": Math.random() * 5000000 + 10000, // Much longer duration
      "Tot Fwd Pkts": Math.floor(Math.random() * 1000) + 500, // High packet count
      "Tot Bwd Pkts": Math.floor(Math.random() * 500) + 200,
      "TotLen Fwd Pkts": Math.random() * 100000 + 50000, // Large data transfer
      "TotLen Bwd Pkts": Math.random() * 50000 + 20000,
      "Fwd Pkt Len Mean": Math.random() * 1500 + 1000,
      "Bwd Pkt Len Mean": Math.random() * 1500 + 1000,
      "Flow IAT Mean": Math.random() * 10000 + 100, // Very fast intervals
      "Flow IAT Std": Math.random() * 5000 + 100,
      "Fwd IAT Mean": Math.random() * 8000 + 80,
    }
  } else {
    // Suspicious pattern anomaly
    return {
      "Flow Duration": Math.random() * 100000 + 50000,
      "Tot Fwd Pkts": Math.floor(Math.random() * 10) + 1, // Very few packets
      "Tot Bwd Pkts": Math.floor(Math.random() * 5) + 1,
      "TotLen Fwd Pkts": Math.random() * 100 + 10, // Very small data
      "TotLen Bwd Pkts": Math.random() * 50 + 5,
      "Fwd Pkt Len Mean": Math.random() * 100 + 10, // Small packets
      "Bwd Pkt Len Mean": Math.random() * 100 + 10,
      "Flow IAT Mean": Math.random() * 1000000 + 100000, // Very slow intervals
      "Flow IAT Std": Math.random() * 500000 + 50000,
      "Fwd IAT Mean": Math.random() * 800000 + 80000,
    }
  }
}

// Generate mock prediction when API is unavailable
export function generateMockPrediction(flowData: NetworkFlowData): PredictionResponse {
  // Simple heuristic-based mock prediction
  const isHighTraffic = flowData["Tot Fwd Pkts"] > 200 || flowData["TotLen Fwd Pkts"] > 20000
  const isLongDuration = flowData["Flow Duration"] > 500000
  const isLowTraffic = flowData["Tot Fwd Pkts"] < 5 && flowData["TotLen Fwd Pkts"] < 100
  const isFastInterval = flowData["Flow IAT Mean"] < 1000

  // Determine if it should be classified as anomaly based on characteristics
  const isAnomaly = isHighTraffic || isLongDuration || (isLowTraffic && !isFastInterval)

  return {
    prediction: isAnomaly ? 1 : 0,
    status: isAnomaly ? "Anomaly" : "Normal",
  }
}
