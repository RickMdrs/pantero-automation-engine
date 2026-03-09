"use client"

import { useEffect, useState } from "react"
import { Terminal, CheckCircle2, AlertTriangle, Info, XCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface LogEntry {
  id: number
  type: "success" | "warning" | "info" | "error"
  message: string
  timestamp: string
}

const iconMap = {
  success: CheckCircle2,
  warning: AlertTriangle,
  info: Info,
  error: XCircle,
}

const colorMap = {
  success: "text-emerald-400",
  warning: "text-amber-400",
  info: "text-accent",
  error: "text-destructive",
}

const bgMap = {
  success: "bg-emerald-400/10",
  warning: "bg-amber-400/10",
  info: "bg-accent/10",
  error: "bg-destructive/10",
}

export function ActivityFeed() {
  const [logs, setLogs] = useState<LogEntry[]>([])

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await fetch("http://127.0.0.1:8000/logs")
        if (response.ok) {
          const data = await response.json()
          setLogs(data)
        }
      } catch (error) {
        console.error("Error fetching logs", error)
      }
    }

    fetchLogs()
    const interval = setInterval(fetchLogs, 2000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="glass rounded-xl p-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Terminal className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            System Logs
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
          </span>
          <span className="text-xs text-muted-foreground">Live</span>
        </div>
      </div>

      <div className="flex max-h-[320px] flex-col gap-1 overflow-y-auto pr-2 scrollbar-thin">
        {logs.length === 0 ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            Waiting for engine activity...
          </div>
        ) : (
          logs.map((log) => {
            const LogIcon = iconMap[log.type] || Info 
            const colorClass = colorMap[log.type] || "text-gray-400"
            const bgClass = bgMap[log.type] || "bg-gray-500/10"

            return (
              <div
                key={log.id}
                className={cn(
                  "flex items-start gap-3 rounded-lg px-3 py-2.5 transition-all duration-500 animate-in fade-in slide-in-from-top-2",
                  bgClass
                )}
              >
                <LogIcon className={cn("mt-0.5 h-4 w-4 shrink-0", colorClass)} />
                <div className="flex flex-1 flex-col gap-0.5 sm:flex-row sm:items-center sm:gap-3">
                  <span className="font-mono text-xs text-muted-foreground">
                    {log.timestamp}
                  </span>
                  <span className="text-sm text-foreground/90">{log.message}</span>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}