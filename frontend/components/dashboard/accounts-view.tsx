"use client"

import { useState, useEffect } from "react"
import { MessageCircle, Send, ShoppingBag, ShoppingCart, CheckCircle2, AlertCircle, LogOut, Loader2, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { TelegramModal } from "./telegram-modal" 

export function AccountsView() {
  const [status, setStatus] = useState({
    whatsapp: false,
    telegram: false,
    amazon: false,
    mercadolivre: false
  })
  const [loading, setLoading] = useState(true)
  const [connecting, setConnecting] = useState<string | null>(null)
  const [showTelModal, setShowTelModal] = useState(false)

  const fetchStatus = async () => {
    try {
      const res = await fetch("http://127.0.0.1:8000/contas/status")
      if (res.ok) setStatus(await res.json())
    } catch (e) {
      console.error("Error fetching account status")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStatus()
    const interval = setInterval(fetchStatus, 5000)
    return () => clearInterval(interval)
  }, [])

  const handleAction = async (service: string, isConnected: boolean) => {
    if (service === 'telegram' && !isConnected) {
        setShowTelModal(true)
        return
    }

    setConnecting(service)
    const endpoint = isConnected ? "desconectar" : "conectar"
    
    try {
        await fetch(`http://127.0.0.1:8000/contas/${endpoint}/${service}`, { method: "POST" })
        setTimeout(fetchStatus, 2000) 
    } catch (e) {} 
    
    setTimeout(() => setConnecting(null), 1000)
  }
  
  const accounts = [
    {
      id: "whatsapp",
      label: "WhatsApp",
      icon: MessageCircle,
      description: "Message automation and group management.",
      connected: status.whatsapp,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20"
    },
    {
      id: "telegram",
      label: "Telegram",
      icon: Send,
      description: "Bot management and channel posting.",
      connected: status.telegram,
      color: "text-sky-400",
      bg: "bg-sky-500/10",
      border: "border-sky-500/20"
    },
    {
      id: "mercadolivre",
      label: "Mercado Livre",
      icon: ShoppingBag,
      description: "Automatic affiliate link conversion.",
      connected: status.mercadolivre,
      color: "text-yellow-400",
      bg: "bg-yellow-500/10",
      border: "border-yellow-500/20"
    },
    {
      id: "amazon",
      label: "Amazon",
      icon: ShoppingCart,
      description: "Automatic affiliate link conversion.",
      connected: status.amazon,
      color: "text-orange-400",
      bg: "bg-orange-500/10",
      border: "border-orange-500/20"
    }
  ]

  return (
    <div className="flex flex-col gap-6 p-6 lg:p-8 animate-in fade-in duration-500">
      <TelegramModal isOpen={showTelModal} onClose={() => setShowTelModal(false)} onSuccess={() => { setShowTelModal(false); fetchStatus(); }} />

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {accounts.map((acc) => (
          <div key={acc.id} className={cn("glass group relative flex flex-col justify-between overflow-hidden rounded-2xl border p-6 transition-all duration-300 hover:shadow-2xl", acc.connected ? `border-white/10` : "border-white/5 hover:border-white/10")}>
            <div className={cn("absolute -right-10 -top-10 h-32 w-32 rounded-full blur-[60px] transition-opacity duration-500 opacity-0 group-hover:opacity-20", acc.bg.replace("/10", ""))} />

            <div>
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                        <div className={cn("flex h-12 w-12 items-center justify-center rounded-xl transition-transform group-hover:scale-110", acc.bg, acc.color)}>
                            <acc.icon className="h-6 w-6" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-foreground">{acc.label}</h3>
                            <div className="flex items-center gap-1.5 mt-0.5">
                                <div className={cn("h-1.5 w-1.5 rounded-full animate-pulse", acc.connected ? "bg-emerald-500" : "bg-red-500")} />
                                <span className={cn("text-xs font-medium", acc.connected ? "text-emerald-400" : "text-muted-foreground")}>
                                    {acc.connected ? (acc.id === 'telegram' ? "Bot Online" : "Linked") : "Disconnected"}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
                <p className="mt-4 text-sm text-muted-foreground leading-relaxed">{acc.description}</p>
            </div>

            <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
                <button
                    onClick={() => handleAction(acc.id, acc.connected)}
                    disabled={loading || connecting === acc.id}
                    className={cn("flex-1 flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-bold transition-all active:scale-95", acc.connected ? "bg-secondary/30 text-muted-foreground hover:bg-destructive/10 hover:text-destructive" : "bg-white/5 text-foreground hover:bg-white/10 border border-white/5")}
                >
                    {connecting === acc.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : acc.connected ? (
                        <><LogOut className="h-4 w-4" /> Disconnect</>
                    ) : (
                        <>Connect <ArrowRight className="h-4 w-4" /></>
                    )}
                </button>
                <div className="ml-3">
                    {acc.connected ? <CheckCircle2 className="h-5 w-5 text-emerald-500" /> : <AlertCircle className="h-5 w-5 text-muted-foreground/30" />}
                </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}