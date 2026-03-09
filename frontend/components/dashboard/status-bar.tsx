"use client"

import { Wifi, Cpu, HardDrive, Clock, Activity } from "lucide-react"
import { useEffect, useState } from "react"

export function StatusBar() {
  const [time, setTime] = useState("")
  const [system, setSystem] = useState({
    cpu: 0,
    ram: 0,
    conexao: "Connecting..."
  })

  useEffect(() => {
    const updateTime = () =>
      setTime(
        new Date().toLocaleTimeString("en-US", {
          hour12: false,
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      )
    updateTime()
    const interval = setInterval(updateTime, 1000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const fetchSystem = async () => {
      try {
        const res = await fetch("http://127.0.0.1:8000/stats")
        if (res.ok) {
          const data = await res.json()
          setSystem({
            cpu: data.sistema?.cpu || 0,
            ram: data.sistema?.ram || 0,
            conexao: "Connected"
          })
        }
      } catch {
        setSystem(prev => ({ ...prev, conexao: "Offline" }))
      }
    }
    
    fetchSystem()
    const interval = setInterval(fetchSystem, 2000)
    return () => clearInterval(interval)
  }, [])

  const statusColor = system.conexao === "Connected" ? "text-emerald-400" : "text-red-400"

  return (
    <div className="glass flex items-center justify-between rounded-xl px-5 py-3">
      <div className="flex items-center gap-6">
        
        <div className="flex items-center gap-2">
          <Wifi className={`h-3.5 w-3.5 ${statusColor}`} />
          <span className={`text-xs font-medium ${statusColor}`}>
            {system.conexao}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Cpu className="h-3.5 w-3.5 text-accent" />
          <span className="text-xs text-muted-foreground">
            CPU: <span className="text-foreground font-mono">{system.cpu}%</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <HardDrive className="h-3.5 w-3.5 text-primary" />
          <span className="text-xs text-muted-foreground">
            RAM: <span className="text-foreground font-mono">{system.ram} GB</span>
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Clock className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="font-mono text-xs text-muted-foreground">{time}</span>
      </div>
    </div>
  )
}