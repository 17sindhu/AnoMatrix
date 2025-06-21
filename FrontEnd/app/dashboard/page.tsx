"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { ArrowLeft, Wifi, RefreshCw, Settings, Zap, TrendingUp } from "lucide-react"
import Link from "next/link"
import { useAnomalyDetection } from "@/hooks/useAnomalyDetection"

export default function LiveDashboard() {
  const { devices, alerts, stats, isMonitoring, toggleMonitoring } = useAnomalyDetection()

  const [signalData, setSignalData] = useState([
    { time: "10:00", deviceA: -45, deviceB: -52, deviceC: -38, deviceD: -67 },
    { time: "10:05", deviceA: -48, deviceB: -55, deviceC: -41, deviceD: -65 },
    { time: "10:10", deviceA: -46, deviceB: -58, deviceC: -39, deviceD: -69 },
    { time: "10:15", deviceA: -51, deviceB: -61, deviceC: -43, deviceD: -71 },
    { time: "10:20", deviceA: -49, deviceB: -59, deviceC: -40, deviceD: -68 },
    { time: "10:25", deviceA: -53, deviceB: -63, deviceC: -45, deviceD: -72 },
  ])

  const [anomalyTrendData, setAnomalyTrendData] = useState([
    { time: "10:00", normal: 4, anomalies: 0 },
    { time: "10:05", normal: 4, anomalies: 0 },
    { time: "10:10", normal: 3, anomalies: 1 },
    { time: "10:15", normal: 2, anomalies: 2 },
    { time: "10:20", normal: 3, anomalies: 1 },
    { time: "10:25", normal: 4, anomalies: 0 },
  ])

  const [mlMetrics, setMlMetrics] = useState([
    { metric: "Accuracy", value: 94.2 },
    { metric: "Precision", value: 91.8 },
    { metric: "Recall", value: 89.5 },
    { metric: "F1-Score", value: 90.6 },
  ])

  const [selectedDevices, setSelectedDevices] = useState(["deviceA", "deviceB", "deviceC", "deviceD"])

  useEffect(() => {
    if (!isMonitoring) return

    const interval = setInterval(() => {
      const now = new Date()
      const timeStr = now.toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit" })

      // Update signal strength data based on actual device data
      setSignalData((prev) => {
        const newData = [
          ...prev.slice(1),
          {
            time: timeStr,
            deviceA: devices[0]?.signalStrength || -45,
            deviceB: devices[1]?.signalStrength || -52,
            deviceC: devices[2]?.signalStrength || -38,
            deviceD: devices[3]?.signalStrength || -67,
          },
        ]
        return newData
      })

      // Update anomaly trend data
      const normalCount = devices.filter((d) => d.status === "normal").length
      const anomalyCount = devices.filter((d) => d.status !== "normal").length

      setAnomalyTrendData((prev) => {
        const newData = [
          ...prev.slice(1),
          {
            time: timeStr,
            normal: normalCount,
            anomalies: anomalyCount,
          },
        ]
        return newData
      })
    }, 5000)

    return () => clearInterval(interval)
  }, [isMonitoring, devices])

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "bg-red-500"
      case "medium":
        return "bg-yellow-500"
      case "low":
        return "bg-blue-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-blue-900">
      {/* Header */}
      <div className="bg-black/50 backdrop-blur-sm border-b border-blue-500/20">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="sm" className="text-blue-300 hover:text-white hover:bg-blue-600/20">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Home
                </Button>
              </Link>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-600 rounded-lg">
                  <Wifi className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">ML-Powered Live Dashboard</h1>
                  <div className="flex items-center gap-2">
                    <p className="text-blue-300 text-sm">Real-time anomaly detection with XGBoost</p>
                    <div className={`w-2 h-2 rounded-full ${stats.apiConnected ? "bg-green-500" : "bg-red-500"}`} />
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={isMonitoring ? "default" : "outline"}
                size="sm"
                onClick={toggleMonitoring}
                className={
                  isMonitoring
                    ? "bg-green-600 hover:bg-green-700"
                    : "border-blue-500/50 text-blue-300 hover:bg-blue-600/20"
                }
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isMonitoring ? "animate-spin" : ""}`} />
                {isMonitoring ? "Monitoring" : "Paused"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Signal Strength Chart */}
          <div className="lg:col-span-2">
            <Card className="bg-black/40 border-blue-500/30 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Wifi className="w-5 h-5 text-blue-400" />
                  Real-Time Signal Strength
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    deviceA: { label: "Device A", color: "#3B82F6" },
                    deviceB: { label: "Device B", color: "#10B981" },
                    deviceC: { label: "Device C", color: "#F59E0B" },
                    deviceD: { label: "Device D", color: "#EF4444" },
                  }}
                  className="h-[300px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={signalData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="time" stroke="#9CA3AF" />
                      <YAxis stroke="#9CA3AF" domain={[-100, -30]} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      {selectedDevices.includes("deviceA") && (
                        <Line
                          type="monotone"
                          dataKey="deviceA"
                          stroke="#3B82F6"
                          strokeWidth={2}
                          dot={{ fill: "#3B82F6", r: 4 }}
                        />
                      )}
                      {selectedDevices.includes("deviceB") && (
                        <Line
                          type="monotone"
                          dataKey="deviceB"
                          stroke="#10B981"
                          strokeWidth={2}
                          dot={{ fill: "#10B981", r: 4 }}
                        />
                      )}
                      {selectedDevices.includes("deviceC") && (
                        <Line
                          type="monotone"
                          dataKey="deviceC"
                          stroke="#F59E0B"
                          strokeWidth={2}
                          dot={{ fill: "#F59E0B", r: 4 }}
                        />
                      )}
                      {selectedDevices.includes("deviceD") && (
                        <Line
                          type="monotone"
                          dataKey="deviceD"
                          stroke="#EF4444"
                          strokeWidth={2}
                          dot={{ fill: "#EF4444", r: 4 }}
                        />
                      )}
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>

          {/* Real-time ML Alerts */}
          <Card className="bg-black/40 border-blue-500/30 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-400" />
                ML Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-[300px] overflow-y-auto">
                {alerts.slice(0, 5).map((alert) => (
                  <div key={alert.id} className="p-3 bg-gray-800/50 rounded-lg border border-gray-700/50">
                    <div className="flex items-center gap-2 mb-1">
                      <div className={`w-2 h-2 rounded-full ${getSeverityColor(alert.severity)}`} />
                      <span className="text-white font-medium text-sm">{alert.device}</span>
                      <span className="text-blue-400 text-xs ml-auto">{alert.time}</span>
                    </div>
                    <p className="text-gray-300 text-xs mb-1">{alert.message}</p>
                    <div className="text-xs text-yellow-300">ML Prediction: {alert.prediction.status}</div>
                  </div>
                ))}
                {alerts.length === 0 && (
                  <div className="text-center py-4">
                    <Zap className="w-8 h-8 text-gray-500 mx-auto mb-2" />
                    <p className="text-gray-400 text-sm">No recent alerts</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Anomaly Detection Trend */}
        <Card className="bg-black/40 border-blue-500/30 backdrop-blur-sm mt-6">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-400" />
              ML Detection Trend (Real-Time)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                normal: { label: "Normal", color: "#10B981" },
                anomalies: { label: "Anomalies", color: "#EF4444" },
              }}
              className="h-[200px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={anomalyTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="time" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area
                    type="monotone"
                    dataKey="normal"
                    stackId="1"
                    stroke="#10B981"
                    fill="#10B981"
                    fillOpacity={0.6}
                  />
                  <Area
                    type="monotone"
                    dataKey="anomalies"
                    stackId="1"
                    stroke="#EF4444"
                    fill="#EF4444"
                    fillOpacity={0.8}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          {/* ML Model Performance */}
          <Card className="bg-black/40 border-blue-500/30 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Settings className="w-5 h-5 text-purple-400" />
                XGBoost Model Metrics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  value: { label: "Score", color: "#8B5CF6" },
                }}
                className="h-[200px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={mlMetrics}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="metric" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" domain={[0, 100]} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="value" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Device Selection */}
          <Card className="bg-black/40 border-blue-500/30 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Settings className="w-5 h-5 text-blue-400" />
                Device Tracking Controls
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {["deviceA", "deviceB", "deviceC", "deviceD"].map((device, index) => (
                    <Button
                      key={device}
                      variant={selectedDevices.includes(device) ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        setSelectedDevices((prev) =>
                          prev.includes(device) ? prev.filter((d) => d !== device) : [...prev, device],
                        )
                      }}
                      className={
                        selectedDevices.includes(device)
                          ? "bg-blue-600 hover:bg-blue-700 text-white"
                          : "border-blue-500/50 text-blue-300 hover:bg-blue-600/20"
                      }
                    >
                      {devices[index]?.id || `Device ${device.slice(-1).toUpperCase()}`}
                    </Button>
                  ))}
                </div>

                <div className="pt-4 border-t border-gray-700">
                  <h4 className="text-white font-medium mb-2">System Status</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-300">Flask API:</span>
                      <span className={stats.apiConnected ? "text-green-400" : "text-red-400"}>
                        {stats.apiConnected ? "Connected" : "Offline"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Monitoring:</span>
                      <span className={isMonitoring ? "text-green-400" : "text-yellow-400"}>
                        {isMonitoring ? "Active" : "Paused"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Last Update:</span>
                      <span className="text-blue-400">{stats.lastUpdated.toLocaleTimeString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
