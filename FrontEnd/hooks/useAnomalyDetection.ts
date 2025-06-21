"use client"

import { useState, useEffect, useCallback } from "react"
import {
  predictAnomaly,
  generateNetworkFlowData,
  generateAnomalousFlowData,
  checkApiHealth,
  type NetworkFlowData,
  type PredictionResponse,
} from "@/lib/api"

export interface Device {
  id: string
  mac: string
  signalStrength: number
  status: "normal" | "suspicious" | "critical"
  lastActive: Date
  deviceType: string
  flowData?: NetworkFlowData
  lastPrediction?: PredictionResponse
}

export interface AnomalyAlert {
  id: string
  device: string
  message: string
  time: string
  severity: "high" | "medium" | "low"
  flowData: NetworkFlowData
  prediction: PredictionResponse
}

export interface SystemStats {
  connectedDevices: number
  currentAnomalies: number
  uptime: string
  lastUpdated: Date
  apiConnected: boolean
}

export function useAnomalyDetection() {
  const [devices, setDevices] = useState<Device[]>([
    {
      id: "Device-A1B2",
      mac: "00:1B:44:11:3A:B7",
      signalStrength: -45,
      status: "normal",
      lastActive: new Date(),
      deviceType: "Laptop",
    },
    {
      id: "Device-C3D4",
      mac: "00:1B:44:11:3A:B8",
      signalStrength: -52,
      status: "normal",
      lastActive: new Date(),
      deviceType: "Phone",
    },
    {
      id: "Device-E5F6",
      mac: "00:1B:44:11:3A:B9",
      signalStrength: -38,
      status: "normal",
      lastActive: new Date(),
      deviceType: "Tablet",
    },
    {
      id: "Device-G7H8",
      mac: "00:1B:44:11:3A:BA",
      signalStrength: -67,
      status: "normal",
      lastActive: new Date(),
      deviceType: "Phone",
    },
  ])

  const [alerts, setAlerts] = useState<AnomalyAlert[]>([])
  const [stats, setStats] = useState<SystemStats>({
    connectedDevices: 4,
    currentAnomalies: 0,
    uptime: "99.8%",
    lastUpdated: new Date(),
    apiConnected: false,
  })

  const [isMonitoring, setIsMonitoring] = useState(true)

  // Check API health on mount
  useEffect(() => {
    const checkHealth = async () => {
      const isHealthy = await checkApiHealth()
      setStats((prev) => ({ ...prev, apiConnected: isHealthy }))
    }
    checkHealth()
  }, [])

  // Generate and analyze network flow data for a device
  const analyzeDevice = useCallback(async (device: Device): Promise<Device> => {
    try {
      // Generate network flow data (mix of normal and potentially anomalous)
      const shouldGenerateAnomaly = Math.random() < 0.15 // 15% chance of anomaly
      const flowData = shouldGenerateAnomaly ? generateAnomalousFlowData() : generateNetworkFlowData()

      // Get prediction from Flask API (with fallback to mock)
      const prediction = await predictAnomaly(flowData)

      // Update device status based on prediction
      let newStatus: Device["status"] = "normal"
      if (prediction.status === "Anomaly") {
        // Determine severity based on flow characteristics
        const isHighSeverity = flowData["Tot Fwd Pkts"] > 500 || flowData["TotLen Fwd Pkts"] > 50000
        const isMediumSeverity = flowData["Tot Fwd Pkts"] > 100 || flowData["Flow Duration"] > 1000000

        if (isHighSeverity) {
          newStatus = "critical"
        } else if (isMediumSeverity) {
          newStatus = "suspicious"
        } else {
          newStatus = "suspicious"
        }
      }

      // Update signal strength with some variation
      const signalVariation = (Math.random() - 0.5) * 10
      const newSignalStrength = Math.max(-100, Math.min(-30, device.signalStrength + signalVariation))

      return {
        ...device,
        status: newStatus,
        signalStrength: newSignalStrength,
        lastActive: new Date(),
        flowData,
        lastPrediction: prediction,
      }
    } catch (error) {
      console.warn(`Error analyzing device ${device.id}, using fallback:`, error)

      // Enhanced fallback behavior with realistic simulation
      const signalVariation = (Math.random() - 0.5) * 8
      const newSignalStrength = Math.max(-100, Math.min(-30, device.signalStrength + signalVariation))

      // Occasionally simulate status changes even in fallback mode
      let newStatus = device.status
      if (Math.random() < 0.1) {
        // 10% chance of status change
        const statuses: Device["status"][] = ["normal", "suspicious", "critical"]
        newStatus = statuses[Math.floor(Math.random() * statuses.length)]
      }

      return {
        ...device,
        status: newStatus,
        signalStrength: newSignalStrength,
        lastActive: Math.random() > 0.8 ? new Date() : device.lastActive,
      }
    }
  }, [])

  // Create alert from anomalous device
  const createAlert = useCallback((device: Device): AnomalyAlert | null => {
    if (!device.flowData || !device.lastPrediction || device.lastPrediction.status !== "Anomaly") {
      return null
    }

    const flowData = device.flowData
    let message = "Network anomaly detected"
    let severity: AnomalyAlert["severity"] = "low"

    // Determine message and severity based on flow characteristics
    if (flowData["Tot Fwd Pkts"] > 500) {
      message = `High traffic volume detected (${flowData["Tot Fwd Pkts"]} packets)`
      severity = "high"
    } else if (flowData["TotLen Fwd Pkts"] > 50000) {
      message = `Large data transfer detected (${Math.round(flowData["TotLen Fwd Pkts"] / 1024)}KB)`
      severity = "high"
    } else if (flowData["Flow Duration"] > 1000000) {
      message = `Unusually long connection duration (${Math.round(flowData["Flow Duration"] / 1000)}s)`
      severity = "medium"
    } else if (flowData["Tot Fwd Pkts"] < 5) {
      message = `Suspicious low-traffic pattern detected`
      severity = "medium"
    } else {
      message = `Unusual network flow pattern detected`
      severity = "low"
    }

    return {
      id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      device: device.id,
      message,
      time: new Date().toLocaleTimeString(),
      severity,
      flowData,
      prediction: device.lastPrediction,
    }
  }, [])

  // Main monitoring loop
  useEffect(() => {
    if (!isMonitoring) return

    const interval = setInterval(async () => {
      try {
        // Analyze all devices with better error handling
        const devicePromises = devices.map(async (device) => {
          try {
            return await analyzeDevice(device)
          } catch (error) {
            console.warn(`Failed to analyze ${device.id}, keeping current state:`, error)
            return device // Return unchanged device on error
          }
        })

        const analyzedDevices = await Promise.all(devicePromises)

        // Create alerts for anomalous devices
        const newAlerts: AnomalyAlert[] = []
        analyzedDevices.forEach((device) => {
          try {
            const alert = createAlert(device)
            if (alert) {
              newAlerts.push(alert)
            }
          } catch (error) {
            console.warn(`Failed to create alert for ${device.id}:`, error)
          }
        })

        // Update devices
        setDevices(analyzedDevices)

        // Update alerts (keep last 10)
        if (newAlerts.length > 0) {
          setAlerts((prev) => [...newAlerts, ...prev].slice(0, 10))
        }

        // Update stats
        const anomalousDevices = analyzedDevices.filter((d) => d.status !== "normal").length
        setStats((prev) => ({
          ...prev,
          connectedDevices: analyzedDevices.length,
          currentAnomalies: anomalousDevices,
          lastUpdated: new Date(),
        }))

        // Check API health periodically (less frequently to reduce errors)
        if (Math.random() < 0.05) {
          // 5% chance each cycle (reduced from 10%)
          try {
            const isHealthy = await checkApiHealth()
            setStats((prev) => ({ ...prev, apiConnected: isHealthy }))
          } catch (error) {
            console.warn("API health check failed:", error)
            setStats((prev) => ({ ...prev, apiConnected: false }))
          }
        }
      } catch (error) {
        console.error("Monitoring cycle error:", error)
        // Don't break the monitoring loop on errors
      }
    }, 5000) // Check every 5 seconds

    return () => clearInterval(interval)
  }, [devices, isMonitoring, analyzeDevice, createAlert])

  const toggleMonitoring = useCallback(() => {
    setIsMonitoring((prev) => !prev)
  }, [])

  const clearAlerts = useCallback(() => {
    setAlerts([])
  }, [])

  return {
    devices,
    alerts,
    stats,
    isMonitoring,
    toggleMonitoring,
    clearAlerts,
  }
}
