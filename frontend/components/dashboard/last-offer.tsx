"use client"

import { useEffect, useState } from "react"
import { ShoppingBag, ShoppingCart, ExternalLink, Clock, Package } from "lucide-react"
import { cn } from "@/lib/utils"
import { open } from '@tauri-apps/plugin-shell' 

interface Envio {
  id: number
  data_hora: string
  plataforma: string
  produto_resumo: string
  link_gerado: string
}

export function LastOffer() {
  const [last, setLast] = useState<Envio | null>(null)

  useEffect(() => {
    const fetchLast = async () => {
      try {
        const res = await fetch("http://127.0.0.1:8000/analytics/history")
        if (res.ok) {
          const data = await res.json()
          if (data && data.length > 0) {
            setLast(data[0]) 
          }
        }
      } catch (e) { console.error(e) }
    }

    fetchLast()
    const interval = setInterval(fetchLast, 5000)
    return () => clearInterval(interval)
  }, [])

  if (!last) return (
    <div className="glass flex h-full min-h-[140px] flex-col items-center justify-center gap-2 rounded-xl p-6 text-sm text-muted-foreground border-dashed border border-border/30">
      <Package className="h-8 w-8 opacity-20" />
      <span>Waiting for the first deal...</span>
    </div>
  )

  const isAmazon = last.plataforma === 'Amazon'
  const hora = last.data_hora.split(' ')[1].slice(0, 5)

  return (
    <div className="glass relative flex h-full flex-col justify-between overflow-hidden rounded-xl p-6 transition-all hover:neon-border-purple group">
      <div className={cn(
        "absolute -right-6 -top-6 h-24 w-24 rounded-full blur-3xl opacity-20 transition-all group-hover:opacity-40",
        isAmazon ? "bg-orange-500" : "bg-yellow-500"
      )} />

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
           <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Last Dispatch
            </span>
        </div>
        <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-mono bg-secondary/30 px-2 py-1 rounded">
            <Clock className="h-3 w-3" />
            {hora}
        </div>
      </div>

      <div className="flex-1">
        <h3 className="line-clamp-2 text-sm font-bold leading-relaxed text-foreground" title={last.produto_resumo}>
            {last.produto_resumo}
        </h3>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-border/30 pt-4">
         <div className={cn(
            "flex items-center gap-1.5 rounded-md px-2 py-1 text-[10px] font-bold uppercase tracking-wide border",
            isAmazon 
              ? "bg-orange-500/10 text-orange-400 border-orange-500/20" 
              : "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
         )}>
            {isAmazon ? <ShoppingCart className="h-3 w-3" /> : <ShoppingBag className="h-3 w-3" />}
            {last.plataforma}
         </div>

         <button 
            onClick={() => open(last.link_gerado)}
            className="flex items-center gap-1 text-[10px] font-medium text-muted-foreground hover:text-accent transition-colors cursor-pointer"
         >
            View Link <ExternalLink className="h-3 w-3" />
         </button>
      </div>
    </div>
  )
}