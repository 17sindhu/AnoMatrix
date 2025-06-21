"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Wifi, Search, Zap, Activity } from "lucide-react"
import Link from "next/link"
import { useAnomalyDetection } from "@/hooks/useAnomalyDetection"

export default function CurrentDevices() {
  const { devices, stats, isMonitoring } = useAnomalyDetection()
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  const getStatusColor = (status: string) => {
    switch (status) {
      case "normal":
        return "bg-green-500"
      case "suspicious":
        return "bg-yellow-500"
      case "critical":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "normal":
        return "bg-green-500/20 text-green-300 border-green-500/50"
      case "suspicious":
        return "bg-yellow-500/20 text-yellow-300 border-yellow-500/50"
      case "critical":
        return "bg-red-500/20 text-red-300 border-red-500/50"
      default:
        return "bg-gray-500/20 text-gray-300 border-gray-500/50"
    }
  }

  const filteredDevices = devices.filter((device) => {
    const matchesSearch =
      device.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      device.mac.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || device.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000)
    if (seconds < 60) return `${seconds}s ago`
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    return `${hours}h ago`
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
                  <h1 className="text-xl font-bold text-white">Connected Devices</h1>
                  <div className="flex items-center gap-2">
                    <p className="text-blue-300 text-sm">ML-powered device monitoring</p>
                    <div className={`w-2 h-2 rounded-full ${stats.apiConnected ? "bg-green-500" : "bg-red-500"}`} />
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="border-blue-500/50 text-blue-300">
                {filteredDevices.length} devices
              </Badge>
              <Badge
                variant="outline"
                className={isMonitoring ? "border-green-500/50 text-green-300" : "border-yellow-500/50 text-yellow-300"}
              >
                {isMonitoring ? "Monitoring" : "Paused"}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Filters */}
        <Card className="bg-black/40 border-blue-500/30 backdrop-blur-sm mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search devices by ID or MAC address..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-gray-800/50 border-gray-600 text-white placeholder-gray-400"
                />
              </div>
              <div className="flex gap-2">
                {["all", "normal", "suspicious", "critical"].map((status) => (
                  <Button
                    key={status}
                    variant={statusFilter === status ? "default" : "outline"}
                    size="sm"
                    onClick={() => setStatusFilter(status)}
                    className={
                      statusFilter === status
                        ? "bg-blue-600 hover:bg-blue-700 text-white"
                        : "border-blue-500/50 text-blue-300 hover:bg-blue-600/20"
                    }
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Devices Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDevices.map((device) => (
            <Card
              key={device.id}
              className="bg-black/40 border-blue-500/30 backdrop-blur-sm hover:border-blue-400/50 transition-colors"
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white text-lg">{device.id}</CardTitle>
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${getStatusColor(device.status)}`} />
                    {device.lastPrediction && (
                      <Zap className="w-4 h-4 text-yellow-400" title="ML Prediction Available" />
                    )}
                  </div>
                </div>
                <p className="text-gray-400 text-sm font-mono">{device.mac}</p>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-blue-300 text-sm">Signal Strength</span>
                  <span
                    className={`font-bold ${
                      device.signalStrength > -60
                        ? "text-green-400"
                        : device.signalStrength > -80
                          ? "text-yellow-400"
                          : "text-red-400"
                    }`}
                  >
                    {Math.round(device.signalStrength)} dBm
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-blue-300 text-sm">Status</span>
                  <Badge className={getStatusBadge(device.status)}>{device.status}</Badge>
                </div>

                {device.lastPrediction && (
                  <div className="flex items-center justify-between">
                    <span className="text-blue-300 text-sm">ML Prediction</span>
                    <Badge
                      className={
                        device.lastPrediction.status === "Anomaly"
                          ? "bg-red-500/20 text-red-300 border-red-500/50"
                          : "bg-green-500/20 text-green-300 border-green-500/50"
                      }
                    >
                      {device.lastPrediction.status}
                    </Badge>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span className="text-blue-300 text-sm">Device Type</span>
                  <span className="text-white text-sm">{device.deviceType}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-blue-300 text-sm">Last Active</span>
                  <span className="text-gray-300 text-sm">{getTimeAgo(device.lastActive)}</span>
                </div>

                {/* Signal Strength Bar */}
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>Signal Quality</span>
                    <span>{Math.round(((device.signalStrength + 100) / 70) * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        device.signalStrength > -60
                          ? "bg-green-500"
                          : device.signalStrength > -80
                            ? "bg-yellow-500"
                            : "bg-red-500"
                      }`}
                      style={{ width: `${Math.max(0, Math.min(100, ((device.signalStrength + 100) / 70) * 100))}%` }}
                    />
                  </div>
                </div>

                {/* Network Flow Data Preview */}
                {device.flowData && (
                  <div className="mt-3 p-2 bg-gray-800/30 rounded border border-gray-700/50">
                    <div className="flex items-center gap-2 mb-2">
                      <Activity className="w-3 h-3 text-blue-400" />
                      <span className="text-xs text-blue-300 font-medium">Network Flow Data</span>
                    </div>
                    <div className="grid grid-cols-2 gap-1 text-xs">
                      <div className="text-gray-400">
                        Packets: <span className="text-white">{device.flowData["Tot Fwd Pkts"]}</span>
                      </div>
                      <div className="text-gray-400">
                        Duration:{" "}
                        <span className="text-white">{Math.round(device.flowData["Flow Duration"] / 1000)}s</span>
                      </div>
                      <div className="text-gray-400">
                        Data:{" "}
                        <span className="text-white">{Math.round(device.flowData["TotLen Fwd Pkts"] / 1024)}KB</span>
                      </div>
                      <div className="text-gray-400">
                        Avg IAT: <span className="text-white">{Math.round(device.flowData["Flow IAT Mean"])}μs</span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredDevices.length === 0 && (
          <Card className="bg-black/40 border-blue-500/30 backdrop-blur-sm">
            <CardContent className="text-center py-12">
              <Wifi className="w-12 h-12 text-gray-500 mx-auto mb-4" />
              <h3 className="text-white text-lg font-semibold mb-2">No devices found</h3>
              <p className="text-gray-400">Try adjusting your search or filter criteria</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
