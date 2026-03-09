"use client"

import { useState } from "react"
import {
  LayoutDashboard,
  Settings,
  Users,
  Activity,
  ChevronLeft,
  ChevronRight,
  User 
} from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", id: "dashboard" },
  { icon: Settings, label: "Settings", id: "config" },
  { icon: Users, label: "Connections", id: "accounts" },
  { icon: Activity, label: "Analytics", id: "analytics" },
]

interface SidebarProps {
  activeView: string
  onNavigate: (view: string) => void
  user?: { username: string; full_name?: string; days_left: number; profile_pic: string }
}

export function Sidebar({ activeView, onNavigate, user }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false)

  const displayName = user?.full_name || user?.username || "Guest"

  return (
    <aside
      className={cn(
        "glass-sidebar flex h-screen flex-col transition-all duration-300",
        collapsed ? "w-[72px]" : "w-[240px]"
      )}
    >
      <div className="flex items-center gap-3 px-5 py-6">
        <div className="flex h-9 w-9 shrink-0 rounded-lg bg-primary/20 neon-border-purple overflow-hidden">
          <img 
            src="/pantero.png" 
            alt="Pantero Logo" 
            className="h-full w-full object-cover" 
          />
        </div>
        
        {!collapsed && (
          <span className="text-lg font-bold tracking-tight text-foreground">
            Pantero IA
          </span>
        )}
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-3">
        {navItems.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onNavigate(item.id)}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
              activeView === item.id
                ? "bg-primary/15 text-primary neon-glow-purple"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            )}
          >
            <item.icon className="h-5 w-5 shrink-0" />
            {!collapsed && <span>{item.label}</span>}
          </button>
        ))}
      </nav>

      <div className="px-3 pb-4">
        <button
          onClick={() => onNavigate("user_profile")}
          className={cn(
            "glass w-full rounded-lg p-3 transition-all hover:bg-secondary/80 text-left group",
            collapsed ? "flex items-center justify-center" : "",
            activeView === "user_profile" ? "neon-border-cyan bg-accent/10" : ""
          )}
        >
          <div className="flex items-center gap-3">
            <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent/20 overflow-hidden text-accent">
               {user?.profile_pic ? (
                 <img src={user.profile_pic} alt="User" className="h-full w-full object-cover" />
               ) : (
                 <User className="h-5 w-5" />
               )}
            </div>
            
            {!collapsed && (
              <div className="flex flex-col overflow-hidden">
                <span className="text-sm font-bold text-foreground truncate group-hover:text-accent transition-colors">
                    {displayName}
                </span>
                
                <span className={cn(
                    "text-xs font-medium truncate",
                    (user?.days_left || 0) > 5 ? "text-emerald-400" : "text-amber-400"
                )}>
                  {user ? `${user.days_left} days` : "Offline"}
                </span>
              </div>
            )}
          </div>
        </button>
      </div>

      <button
        type="button"
        onClick={() => setCollapsed(!collapsed)}
        className="flex items-center justify-center border-t border-border/30 py-3 text-muted-foreground transition-colors hover:text-foreground"
      >
        {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
      </button>
    </aside>
  )
}