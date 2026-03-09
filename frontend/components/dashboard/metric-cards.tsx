"use client"

import { useEffect, useState } from "react"
import { ProgressRing } from "./progress-ring"
import { Zap, ShoppingBag, Activity } from "lucide-react"

export function MetricCards() {
  const [data, setData] = useState({
    hoje: 0,
    amazon: 0,
    ml: 0,
    total_geral: 0,
    status_robo: 0
  })

  useEffect(() => {
    const buscarDados = async () => {
      try {
        const res = await fetch("http://127.0.0.1:8000/stats")
        if (res.ok) {
          const json = await res.json()
          setData({ ...json.stats, status_robo: json.status_robo })
        }
      } catch (e) {
        console.error("API Offline")
      }
    }
    buscarDados()
    const interval = setInterval(buscarDados, 2000)
    return () => clearInterval(interval)
  }, [])

  const totalLojas = data.amazon + data.ml;
  let lojaDominante = "Amazon";
  let pctDominante = 0;
  let corLoja = "hsl(35, 90%, 50%)"; 
  let brilhoLoja = "hsla(35, 90%, 50%, 0.5)";

  if (totalLojas > 0) {
    if (data.ml > data.amazon) {
      lojaDominante = "Mercado Livre";
      pctDominante = Math.round((data.ml / totalLojas) * 100);
      corLoja = "hsl(45, 100%, 50%)"; 
      brilhoLoja = "hsla(45, 100%, 50%, 0.5)";
    } else {
      lojaDominante = "Amazon";
      pctDominante = Math.round((data.amazon / totalLojas) * 100);
    }
  }
  
  const metrics = [
    {
      label: "Dispatches", 
      value: data.hoje.toString(),
      sublabel: "Processed", 
      percentage: data.hoje > 0 ? 100 : 0,
      color: "hsl(263, 70%, 58%)",
      glowColor: "hsla(263, 70%, 58%, 0.5)",
      icon: Zap,
      change: "Today", 
      changePositive: true,
    },
    {
      label: "Market Share", 
      value: `${pctDominante}%`, 
      sublabel: lojaDominante, 
      percentage: pctDominante,
      color: corLoja, 
      glowColor: brilhoLoja,
      icon: ShoppingBag,
      change: `AMZ: ${data.amazon} | ML: ${data.ml}`, 
      changePositive: true,
    },
    {
      label: "System Status",
      value: data.status_robo === 1 ? "ACTIVE" : "IDLE",
      sublabel: "Engine",
      percentage: data.status_robo === 1 ? 100 : 0,
      color: data.status_robo === 1 ? "hsl(142, 70%, 50%)" : "hsl(0, 70%, 50%)",
      glowColor: data.status_robo === 1 ? "hsla(142, 70%, 50%, 0.5)" : "hsla(0, 70%, 50%, 0.2)",
      icon: Activity,
      change: data.status_robo === 1 ? "Online" : "Offline",
      changePositive: data.status_robo === 1,
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {metrics.map((metric) => (
        <div
          key={metric.label}
          className="glass rounded-xl p-5 transition-all duration-300 hover:neon-glow-purple"
        >
          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-1 pr-2">
              <div className="flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-md bg-secondary/50">
                   <metric.icon className="h-3.5 w-3.5 text-muted-foreground" />
                </div>
                <span className="text-sm font-semibold text-muted-foreground">
                  {metric.label}
                </span>
              </div>
              
              {metric.change && (
                <span
                    className={`mt-2 inline-flex w-fit items-center rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                    metric.changePositive
                        ? "bg-emerald-500/10 text-emerald-500"
                        : "bg-red-500/10 text-red-500"
                    }`}
                >
                    {metric.change}
                </span>
              )}
            </div>
            
            <div className="flex flex-col items-center">
                <ProgressRing
                percentage={metric.percentage}
                size={90}
                strokeWidth={6}
                color={metric.color}
                glowColor={metric.glowColor}
                label=""
                value={metric.value}
                sublabel={metric.sublabel}
                />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}