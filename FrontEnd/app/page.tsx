"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Wifi, Activity, Shield, Clock, ArrowRight, AlertTriangle, Play, Pause, Trash2, Zap } from "lucide-react"
import Link from "next/link"
import { useAnomalyDetection } from "@/hooks/useAnomalyDetection"

export default function HomePage() {
  const { stats, alerts, isMonitoring, toggleMonitoring, clearAlerts } = useAnomalyDetection()

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
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Wifi className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">WiFi Anomaly Detection System</h1>
                <div className="flex items-center gap-2">
                  <p className="text-blue-300">Real-time ML-powered network monitoring</p>
                  <div className="flex items-center gap-1">
                    <div className={`w-2 h-2 rounded-full ${stats.apiConnected ? "bg-green-500" : "bg-red-500"}`} />
                    <span className={`text-xs ${stats.apiConnected ? "text-green-300" : "text-red-300"}`}>
                      {stats.apiConnected ? "API Connected" : "API Offline"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={toggleMonitoring}
                variant={isMonitoring ? "default" : "outline"}
                size="sm"
                className={
                  isMonitoring
                    ? "bg-green-600 hover:bg-green-700"
                    : "border-blue-500/50 text-blue-300 hover:bg-blue-600/20"
                }
              >
                {isMonitoring ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                {isMonitoring ? "Monitoring" : "Paused"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-black/40 border-blue-500/30 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-300">Connected Devices</CardTitle>
              <Wifi className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{stats.connectedDevices}</div>
              <p className="text-xs text-blue-400 mt-1">Active connections</p>
            </CardContent>
          </Card>

          <Card className="bg-black/40 border-blue-500/30 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-300">Current Anomalies</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{stats.currentAnomalies}</div>
              <p className="text-xs text-red-400 mt-1">ML detected threats</p>
            </CardContent>
          </Card>

          <Card className="bg-black/40 border-blue-500/30 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-300">System Uptime</CardTitle>
              <Activity className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{stats.uptime}</div>
              <p className="text-xs text-green-400 mt-1">Operational status</p>
            </CardContent>
          </Card>

          <Card className="bg-black/40 border-blue-500/30 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-300">Last Updated</CardTitle>
              <Clock className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold text-white">{stats.lastUpdated.toLocaleTimeString()}</div>
              <p className="text-xs text-blue-400 mt-1">{isMonitoring ? "Auto-refresh active" : "Monitoring paused"}</p>
            </CardContent>
          </Card>
        </div>

        {/* API Status Banner */}
        {!stats.apiConnected && (
          <Card className="bg-yellow-500/10 border-yellow-500/30 backdrop-blur-sm mb-6">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-yellow-400" />
                <div>
                  <h3 className="text-yellow-300 font-semibold">Flask API Unavailable</h3>
                  <p className="text-yellow-400 text-sm">
                    The ML prediction service is not responding. System is running with intelligent simulation mode. To
                    enable real ML predictions, ensure your Flask server is running on{" "}
                    {process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Link href="/dashboard">
            <Card className="bg-gradient-to-br from-blue-600/20 to-blue-800/20 border-blue-500/40 backdrop-blur-sm hover:from-blue-600/30 hover:to-blue-800/30 transition-all cursor-pointer group">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Live Dashboard
                  <ArrowRight className="w-4 h-4 ml-auto group-hover:translate-x-1 transition-transform" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-blue-300">Real-time ML predictions, monitoring, and alert panels</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/devices">
            <Card className="bg-gradient-to-br from-blue-600/20 to-blue-800/20 border-blue-500/40 backdrop-blur-sm hover:from-blue-600/30 hover:to-blue-800/30 transition-all cursor-pointer group">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Wifi className="w-5 h-5" />
                  Connected Devices
                  <ArrowRight className="w-4 h-4 ml-auto group-hover:translate-x-1 transition-transform" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-blue-300">View devices with ML-based anomaly detection status</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/history">
            <Card className="bg-gradient-to-br from-blue-600/20 to-blue-800/20 border-blue-500/40 backdrop-blur-sm hover:from-blue-600/30 hover:to-blue-800/30 transition-all cursor-pointer group">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Anomaly History
                  <ArrowRight className="w-4 h-4 ml-auto group-hover:translate-x-1 transition-transform" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-blue-300">Browse ML prediction history and export analysis data</p>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Recent ML Alerts */}
        <Card className="bg-black/40 border-blue-500/30 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-400" />
                Recent ML Alerts
              </CardTitle>
              {alerts.length > 0 && (
                <Button
                  onClick={clearAlerts}
                  variant="outline"
                  size="sm"
                  className="border-red-500/50 text-red-300 hover:bg-red-600/20"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {alerts.length > 0 ? (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg border border-gray-700/50"
                  >
                    <div className={`w-2 h-2 rounded-full ${getSeverityColor(alert.severity)}`} />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-white font-medium">{alert.device}</span>
                        <Badge variant="outline" className="text-xs border-blue-500/50 text-blue-300">
                          {alert.severity}
                        </Badge>
                        <Badge variant="outline" className="text-xs border-yellow-500/50 text-yellow-300">
                          ML: {alert.prediction.status}
                        </Badge>
                      </div>
                      <p className="text-gray-300 text-sm">{alert.message}</p>
                      {alert.flowData && (
                        <div className="text-xs text-gray-400 mt-1">
                          Packets: {alert.flowData["Tot Fwd Pkts"]} | Duration:{" "}
                          {Math.round(alert.flowData["Flow Duration"] / 1000)}s | Data:{" "}
                          {Math.round(alert.flowData["TotLen Fwd Pkts"] / 1024)}KB
                        </div>
                      )}
                    </div>
                    <span className="text-blue-400 text-sm">{alert.time}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Zap className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                <h3 className="text-white text-lg font-semibold mb-2">No recent alerts</h3>
                <p className="text-gray-400">
                  {isMonitoring ? "System is monitoring for anomalies..." : "Start monitoring to detect anomalies"}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
