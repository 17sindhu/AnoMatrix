"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Shield, Search, Download, Calendar, Filter, Zap } from "lucide-react"
import Link from "next/link"
import { useAnomalyDetection } from "@/hooks/useAnomalyDetection"

interface AnomalyRecord {
  id: string
  timestamp: Date
  deviceId: string
  anomalyType: string
  signalValue: number
  severity: "low" | "medium" | "high"
  description: string
  resolved: boolean
  mlPrediction: "Normal" | "Anomaly"
  confidence: number
  flowData?: {
    packets: number
    duration: number
    dataSize: number
  }
}

export default function AnomalyHistory() {
  const { alerts, stats } = useAnomalyDetection()

  const [anomalies, setAnomalies] = useState<AnomalyRecord[]>([
    {
      id: "ANO-001",
      timestamp: new Date(Date.now() - 3600000),
      deviceId: "Device-A1B2",
      anomalyType: "High Traffic Volume",
      signalValue: -45,
      severity: "high",
      description: "ML detected unusual high packet volume (847 packets)",
      resolved: true,
      mlPrediction: "Anomaly",
      confidence: 94.2,
      flowData: { packets: 847, duration: 15000, dataSize: 52000 },
    },
    {
      id: "ANO-002",
      timestamp: new Date(Date.now() - 7200000),
      deviceId: "Device-C3D4",
      anomalyType: "Suspicious Pattern",
      signalValue: -78,
      severity: "medium",
      description: "XGBoost model flagged unusual flow characteristics",
      resolved: true,
      mlPrediction: "Anomaly",
      confidence: 87.6,
      flowData: { packets: 12, duration: 85000, dataSize: 156 },
    },
    {
      id: "ANO-003",
      timestamp: new Date(Date.now() - 10800000),
      deviceId: "Device-E5F6",
      anomalyType: "Data Transfer Anomaly",
      signalValue: -52,
      severity: "high",
      description: "Large data transfer detected by ML model (78KB)",
      resolved: false,
      mlPrediction: "Anomaly",
      confidence: 91.8,
      flowData: { packets: 234, duration: 8500, dataSize: 78000 },
    },
    {
      id: "ANO-004",
      timestamp: new Date(Date.now() - 14400000),
      deviceId: "Device-G7H8",
      anomalyType: "Connection Pattern",
      signalValue: -65,
      severity: "medium",
      description: "Unusual inter-arrival time patterns detected",
      resolved: true,
      mlPrediction: "Anomaly",
      confidence: 82.3,
      flowData: { packets: 45, duration: 125000, dataSize: 2400 },
    },
  ])

  const [searchTerm, setSearchTerm] = useState("")
  const [severityFilter, setSeverityFilter] = useState<string>("all")
  const [timeRange, setTimeRange] = useState<string>("24h")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  // Add new alerts to history
  useEffect(() => {
    alerts.forEach((alert) => {
      const existingRecord = anomalies.find((a) => a.id === `ANO-${alert.id}`)
      if (!existingRecord && alert.flowData && alert.prediction) {
        const newRecord: AnomalyRecord = {
          id: `ANO-${alert.id}`,
          timestamp: new Date(),
          deviceId: alert.device,
          anomalyType: alert.message.includes("traffic")
            ? "High Traffic Volume"
            : alert.message.includes("data")
              ? "Data Transfer Anomaly"
              : alert.message.includes("duration")
                ? "Connection Pattern"
                : "Suspicious Pattern",
          signalValue: -50, // Default value
          severity: alert.severity,
          description: `ML detected: ${alert.message}`,
          resolved: false,
          mlPrediction: alert.prediction.status,
          confidence: Math.random() * 20 + 80, // Simulated confidence
          flowData: {
            packets: alert.flowData["Tot Fwd Pkts"],
            duration: alert.flowData["Flow Duration"] / 1000,
            dataSize: alert.flowData["TotLen Fwd Pkts"],
          },
        }
        setAnomalies((prev) => [newRecord, ...prev])
      }
    })
  }, [alerts])

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "bg-red-500/20 text-red-300 border-red-500/50"
      case "medium":
        return "bg-yellow-500/20 text-yellow-300 border-yellow-500/50"
      case "low":
        return "bg-blue-500/20 text-blue-300 border-blue-500/50"
      default:
        return "bg-gray-500/20 text-gray-300 border-gray-500/50"
    }
  }

  const getTimeRangeHours = (range: string) => {
    switch (range) {
      case "1h":
        return 1
      case "6h":
        return 6
      case "24h":
        return 24
      case "7d":
        return 168
      default:
        return 24
    }
  }

  const filteredAnomalies = anomalies.filter((anomaly) => {
    const matchesSearch =
      anomaly.deviceId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      anomaly.anomalyType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      anomaly.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesSeverity = severityFilter === "all" || anomaly.severity === severityFilter
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "resolved" && anomaly.resolved) ||
      (statusFilter === "unresolved" && !anomaly.resolved)

    const hoursAgo = (Date.now() - anomaly.timestamp.getTime()) / (1000 * 60 * 60)
    const matchesTimeRange = hoursAgo <= getTimeRangeHours(timeRange)

    return matchesSearch && matchesSeverity && matchesStatus && matchesTimeRange
  })

  const exportToCSV = () => {
    const headers = [
      "ID",
      "Timestamp",
      "Device ID",
      "Anomaly Type",
      "Signal Value",
      "Severity",
      "Description",
      "Status",
      "ML Prediction",
      "Confidence",
      "Packets",
      "Duration",
      "Data Size",
    ]
    const csvContent = [
      headers.join(","),
      ...filteredAnomalies.map((anomaly) =>
        [
          anomaly.id,
          anomaly.timestamp.toISOString(),
          anomaly.deviceId,
          anomaly.anomalyType,
          anomaly.signalValue,
          anomaly.severity,
          `"${anomaly.description}"`,
          anomaly.resolved ? "Resolved" : "Unresolved",
          anomaly.mlPrediction,
          anomaly.confidence.toFixed(1),
          anomaly.flowData?.packets || 0,
          anomaly.flowData?.duration || 0,
          anomaly.flowData?.dataSize || 0,
        ].join(","),
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `ml-anomaly-history-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
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
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">ML Anomaly History</h1>
                  <div className="flex items-center gap-2">
                    <p className="text-blue-300 text-sm">XGBoost prediction history and analysis</p>
                    <div className={`w-2 h-2 rounded-full ${stats.apiConnected ? "bg-green-500" : "bg-red-500"}`} />
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={exportToCSV} size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Filters */}
        <Card className="bg-black/40 border-blue-500/30 backdrop-blur-sm mb-6">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search anomalies..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-gray-800/50 border-gray-600 text-white placeholder-gray-400"
                />
              </div>

              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="bg-gray-800/50 border-gray-600 text-white">
                  <Calendar className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1h">Last Hour</SelectItem>
                  <SelectItem value="6h">Last 6 Hours</SelectItem>
                  <SelectItem value="24h">Last 24 Hours</SelectItem>
                  <SelectItem value="7d">Last 7 Days</SelectItem>
                </SelectContent>
              </Select>

              <Select value={severityFilter} onValueChange={setSeverityFilter}>
                <SelectTrigger className="bg-gray-800/50 border-gray-600 text-white">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Severity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Severities</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="bg-gray-800/50 border-gray-600 text-white">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="unresolved">Unresolved</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex items-center justify-center">
                <Badge variant="outline" className="border-blue-500/50 text-blue-300">
                  {filteredAnomalies.length} records
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Anomaly Table */}
        <Card className="bg-black/40 border-blue-500/30 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-400" />
              ML Anomaly Records
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left py-3 px-4 text-blue-300 font-medium">Timestamp</th>
                    <th className="text-left py-3 px-4 text-blue-300 font-medium">Device ID</th>
                    <th className="text-left py-3 px-4 text-blue-300 font-medium">Type</th>
                    <th className="text-left py-3 px-4 text-blue-300 font-medium">ML Prediction</th>
                    <th className="text-left py-3 px-4 text-blue-300 font-medium">Confidence</th>
                    <th className="text-left py-3 px-4 text-blue-300 font-medium">Severity</th>
                    <th className="text-left py-3 px-4 text-blue-300 font-medium">Status</th>
                    <th className="text-left py-3 px-4 text-blue-300 font-medium">Flow Data</th>
                    <th className="text-left py-3 px-4 text-blue-300 font-medium">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAnomalies.map((anomaly) => (
                    <tr key={anomaly.id} className="border-b border-gray-800 hover:bg-gray-800/30">
                      <td className="py-3 px-4 text-white">
                        <div className="text-sm">{anomaly.timestamp.toLocaleDateString()}</div>
                        <div className="text-xs text-gray-400">{anomaly.timestamp.toLocaleTimeString()}</div>
                      </td>
                      <td className="py-3 px-4 text-white font-mono text-sm">{anomaly.deviceId}</td>
                      <td className="py-3 px-4 text-white text-sm">{anomaly.anomalyType}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Badge
                            className={
                              anomaly.mlPrediction === "Anomaly"
                                ? "bg-red-500/20 text-red-300 border-red-500/50"
                                : "bg-green-500/20 text-green-300 border-green-500/50"
                            }
                          >
                            {anomaly.mlPrediction}
                          </Badge>
                          <Zap className="w-3 h-3 text-yellow-400" />
                        </div>
                      </td>
                      <td className="py-3 px-4 text-white text-sm">{anomaly.confidence.toFixed(1)}%</td>
                      <td className="py-3 px-4">
                        <Badge className={getSeverityColor(anomaly.severity)}>{anomaly.severity}</Badge>
                      </td>
                      <td className="py-3 px-4">
                        <Badge
                          className={
                            anomaly.resolved
                              ? "bg-green-500/20 text-green-300 border-green-500/50"
                              : "bg-red-500/20 text-red-300 border-red-500/50"
                          }
                        >
                          {anomaly.resolved ? "Resolved" : "Active"}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        {anomaly.flowData && (
                          <div className="text-xs text-gray-300">
                            <div>Pkts: {anomaly.flowData.packets}</div>
                            <div>Dur: {Math.round(anomaly.flowData.duration)}s</div>
                            <div>Size: {Math.round(anomaly.flowData.dataSize / 1024)}KB</div>
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-gray-300 text-sm max-w-xs truncate">{anomaly.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredAnomalies.length === 0 && (
              <div className="text-center py-12">
                <Shield className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                <h3 className="text-white text-lg font-semibold mb-2">No anomalies found</h3>
                <p className="text-gray-400">Try adjusting your search or filter criteria</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
