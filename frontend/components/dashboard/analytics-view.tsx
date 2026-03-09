"use client"

import { useState, useEffect } from "react"
import { ShoppingBag, ShoppingCart, Search, Copy, ExternalLink, BarChart3, PieChart, Clock, Filter } from "lucide-react"
import { cn } from "@/lib/utils"
import { open } from '@tauri-apps/plugin-shell'

interface Envio {
  id: number
  data_hora: string
  plataforma: string
  produto_resumo: string
  link_gerado: string
}

interface StatsAvancados {
  share: { Amazon: number, "Mercado Livre": number }
  total: number
  pico: string
}

export function AnalyticsView() {
  const [envios, setEnvios] = useState<Envio[]>([])
  const [stats, setStats] = useState<StatsAvancados | null>(null)
  const [loading, setLoading] = useState(true)
  const [filtro, setFiltro] = useState("")

  useEffect(() => {
    const fetchData = async () => {
      try {
        const resHistory = await fetch("http://127.0.0.1:8000/analytics/history")
        if (resHistory.ok) setEnvios(await resHistory.json())

        const resStats = await fetch("http://127.0.0.1:8000/analytics/stats")
        if (resStats.ok) setStats(await resStats.json())
      } catch (error) {
        console.error("Analytics error", error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const total = stats?.total || 1
  const pctAmz = stats ? Math.round((stats.share.Amazon / total) * 100) : 0
  const pctMl = stats ? Math.round((stats.share["Mercado Livre"] / total) * 100) : 0

  const gerarUltimos7Dias = () => {
    const dias = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const ano = d.getFullYear()
      const mes = String(d.getMonth() + 1).padStart(2, '0')
      const dia = String(d.getDate()).padStart(2, '0')
      dias.push({ label: `${mes}/${dia}`, key: `${ano}-${mes}-${dia}`, valor: 0 })
    }
    return dias
  }

  const dadosGrafico = gerarUltimos7Dias()
  let maxValor = 1 

  envios.forEach(envio => {
    if (!envio.data_hora) return
    const dataEnvio = envio.data_hora.split(' ')[0]
    const diaEncontrado = dadosGrafico.find(d => d.key === dataEnvio)
    if (diaEncontrado) diaEncontrado.valor += 1
  })
  maxValor = Math.max(...dadosGrafico.map(d => d.valor), 1)

  const enviosFiltrados = envios.filter(e => 
    e.produto_resumo.toLowerCase().includes(filtro.toLowerCase()) ||
    e.plataforma.toLowerCase().includes(filtro.toLowerCase())
  )

  return (
    <div className="flex flex-col gap-6 p-6 lg:p-8">
      <div className="grid gap-6 md:grid-cols-4">
        
        <div className="glass md:col-span-2 rounded-xl p-6 relative overflow-hidden">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                    <PieChart className="h-4 w-4 text-accent" />
                    <span className="text-xs font-bold uppercase tracking-wider">Distribution</span>
                </div>
                <span className="text-xs font-mono text-muted-foreground">{total} Total</span>
            </div>
            <div className="flex h-4 w-full overflow-hidden rounded-full bg-secondary/30 mb-2">
                <div style={{ width: `${pctMl}%` }} className="bg-yellow-400 transition-all duration-1000" />
                <div style={{ width: `${pctAmz}%` }} className="bg-orange-500 transition-all duration-1000" />
            </div>
            <div className="flex justify-between text-xs font-medium">
                <div className="flex items-center gap-1.5 text-yellow-400">
                    <ShoppingBag className="h-3 w-3" /> 
                    Mercado Livre ({pctMl}%)
                </div>
                <div className="flex items-center gap-1.5 text-orange-500">
                    Amazon ({pctAmz}%)
                    <ShoppingCart className="h-3 w-3" /> 
                </div>
            </div>
        </div>

        <div className="glass rounded-xl p-6 flex flex-col justify-between neon-glow-purple">
             <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <Clock className="h-4 w-4 text-purple-400" />
                <span className="text-xs font-bold uppercase tracking-wider">Peak Hour</span>
            </div>
            <div>
                <span className="text-4xl font-bold text-foreground">{stats?.pico || "--"}</span>
                <p className="text-xs text-muted-foreground mt-1">Hour with highest deal volume.</p>
            </div>
        </div>

        <div className="glass rounded-xl p-6 flex flex-col justify-end">
           <div className="flex items-center gap-2 text-muted-foreground mb-auto">
               <BarChart3 className="h-4 w-4 text-emerald-400" />
               <span className="text-xs font-bold uppercase tracking-wider">Trend (7d)</span>
           </div>
           
           <div className="flex h-16 items-end gap-1 mt-4">
              {dadosGrafico.map((dia) => (
                  <div key={dia.label} className="flex-1 bg-secondary/30 hover:bg-emerald-500/50 transition-colors rounded-sm relative group" style={{ height: `${Math.max((dia.valor/maxValor)*100, 10)}%` }}>
                      <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[9px] bg-black px-1 rounded opacity-0 group-hover:opacity-100">{dia.valor}</div>
                  </div>
              ))}
           </div>
        </div>
      </div>

      <div className="glass flex flex-1 flex-col rounded-xl overflow-hidden">
        <div className="flex items-center gap-3 border-b border-border/30 px-6 py-4 bg-secondary/10">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Search history..." 
            className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground/50 text-foreground"
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
          />
          <Filter className="h-4 w-4 text-muted-foreground opacity-50" />
        </div>

        <div className="flex-1 overflow-auto max-h-[500px] scrollbar-thin">
          <table className="w-full text-left text-sm">
            <thead className="sticky top-0 bg-background/95 backdrop-blur z-10 text-xs font-bold uppercase text-muted-foreground border-b border-border/30">
              <tr>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Store</th>
                <th className="px-6 py-4 w-full">Product</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/10">
              {loading ? (
                 <tr><td colSpan={4} className="p-8 text-center text-muted-foreground animate-pulse">Loading data...</td></tr>
              ) : enviosFiltrados.length === 0 ? (
                 <tr><td colSpan={4} className="p-8 text-center text-muted-foreground">Empty history.</td></tr>
              ) : (
                enviosFiltrados.map((envio) => (
                  <tr key={envio.id} className="group transition-colors hover:bg-white/5">
                    <td className="whitespace-nowrap px-6 py-4 font-mono text-xs text-muted-foreground">
                      {envio.data_hora.split(' ')[1].slice(0,5)} <span className="opacity-40">|</span> {envio.data_hora.split(' ')[0].split('-').reverse().slice(0,2).join('/')}
                    </td>
                    <td className="px-6 py-4">
                      <div className={cn(
                        "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide border",
                        envio.plataforma === 'Amazon' 
                          ? "bg-orange-500/10 text-orange-400 border-orange-500/20" 
                          : "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
                      )}>
                        {envio.plataforma === 'Amazon' ? <ShoppingCart className="h-3 w-3" /> : <ShoppingBag className="h-3 w-3" />}
                        {envio.plataforma}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium text-foreground/80 truncate max-w-[300px]">
                      {envio.produto_resumo}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => navigator.clipboard.writeText(envio.link_gerado)}
                          className="rounded-md p-2 hover:bg-primary/20 hover:text-primary transition-colors"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => open(envio.link_gerado)}
                          className="rounded-md p-2 hover:bg-accent/20 hover:text-accent transition-colors"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}