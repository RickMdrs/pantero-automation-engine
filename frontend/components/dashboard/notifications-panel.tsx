"use client"

import { Bell, AlertTriangle, Info, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface Notification {
  id: number
  titulo: string
  mensagem: string
  tipo: string
  lida: number
  data_hora: string
}

interface NotificationsPanelProps {
  notifications: Notification[]
  onClose: () => void
}

export function NotificationsPanel({ notifications, onClose }: NotificationsPanelProps) {
  if (notifications.length === 0) {
    return (
      <div className="absolute right-0 top-12 z-50 w-80 rounded-xl border border-border/50 bg-background/95 p-4 shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-top-2">
        <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold">Notifications</h3>
            <button onClick={onClose}><X className="h-4 w-4 text-muted-foreground"/></button>
        </div>
        <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
          <Bell className="h-8 w-8 mb-2 opacity-20" />
          <span className="text-xs">No recent alerts.</span>
        </div>
      </div>
    )
  }

  return (
    <div className="absolute right-0 top-12 z-50 w-96 rounded-xl border border-border/50 bg-[#0a0a0a] p-0 shadow-2xl animate-in fade-in slide-in-from-top-2 overflow-hidden ring-1 ring-white/10">
      <div className="flex items-center justify-between border-b border-white/10 bg-white/5 px-4 py-3">
        <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-bold text-foreground">Alert Center</h3>
        </div>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-4 w-4" />
        </button>
      </div>
      <div className="max-h-[300px] overflow-y-auto scrollbar-thin">
        {notifications.map((notif) => (
          <div key={notif.id} className={cn("flex gap-3 border-b border-white/5 p-4 hover:bg-white/5", notif.lida === 0 ? "bg-primary/5" : "")}>
            <div className="mt-1">
                {notif.tipo === 'warning' ? <AlertTriangle className="h-5 w-5 text-amber-500" /> : <Info className="h-5 w-5 text-blue-500" />}
            </div>
            <div>
                <h4 className="text-xs font-bold text-foreground">{notif.titulo}</h4>
                <p className="mt-1 text-xs text-muted-foreground">{notif.mensagem}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}