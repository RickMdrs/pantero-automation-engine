"use client"

import { useState } from "react"
import { User, CreditCard, Save, Crown, Loader2, LogOut } from "lucide-react"
import { cn } from "@/lib/utils"
import { open } from '@tauri-apps/plugin-shell'

interface UserProfileProps {
  userData?: {
    username: string
    full_name?: string
    days_left: number
    profile_pic: string
  }
  onProfileUpdate: (newName: string) => void 
  onLogout: () => void 
}

export function UserProfileView({ userData, onProfileUpdate, onLogout }: UserProfileProps) {
  const [fullName, setFullName] = useState(userData?.full_name || userData?.username || "")
  const [loading, setLoading] = useState(false)

  const handleSave = async () => {
    setLoading(true)
    try {
      await fetch("http://127.0.0.1:8000/profile/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ full_name: fullName })
      })
      
      onProfileUpdate(fullName)
      alert("Display name updated!")
    } catch (e) {
      alert("Error saving configuration.")
    } finally {
      setLoading(false)
    }
  }

  const dias = userData?.days_left || 0
  const isVip = dias > 5

  return (
    <div className="flex flex-col gap-6 p-6 lg:p-8 animate-in fade-in duration-500">
      
      <div className="flex items-center gap-3 mb-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/20 neon-border-purple">
          <User className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground">My Profile</h2>
          <p className="text-sm text-muted-foreground">Customize your dashboard appearance</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        
        <div className="glass relative overflow-hidden rounded-xl p-8 flex flex-col justify-between min-h-[280px]">
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
          
          <div>
            <div className="flex items-center justify-between mb-6">
                <span className="flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-xs font-bold text-primary border border-primary/20">
                    <Crown className="h-4 w-4" /> PRO LICENSE
                </span>
                
                <span className={cn(
                    "text-xs font-bold uppercase tracking-wider",
                    isVip ? "text-emerald-500" : "text-red-500 animate-pulse"
                )}>
                    {isVip ? "ACTIVE" : "EXPIRING"}
                </span>
            </div>
            
            <div className="text-center py-6">
                <span className={cn(
                    "text-7xl font-bold tracking-tighter",
                    !isVip && "text-red-500 neon-text-red"
                )}>
                    {dias}
                </span>
                <p className="text-sm text-muted-foreground mt-2">Days Remaining</p>
            </div>
          </div>

          <div className="mt-4 pt-6 border-t border-border/30">
             <button 
                onClick={() => open('https://beacons.ai/pantero.ia')}
                className={cn(
                    "flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold text-white shadow-lg transition-all active:scale-[0.98]",
                    isVip 
                        ? "bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20" 
                        : "bg-red-500 hover:bg-red-600 shadow-red-500/20"
                )}
             >
                <CreditCard className="h-4 w-4" />
                VIEW RENEWAL PLANS
             </button>
          </div>
        </div>

        <div className="glass rounded-xl p-8 flex flex-col gap-6">
            <div className="flex items-center gap-4">
                <div className="relative h-16 w-16 rounded-full overflow-hidden border-2 border-primary/50">
                    <img src={userData?.profile_pic} alt="User" className="h-full w-full object-cover" />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-foreground">{userData?.username}</h3>
                    <p className="text-xs text-muted-foreground">Login Username (Immutable)</p>
                </div>
            </div>

            <div className="space-y-4 mt-2">
                <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Display Name
                    </label>
                    <input 
                        type="text" 
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full rounded-lg border border-border/50 bg-secondary/30 px-4 py-3 text-sm text-foreground outline-none focus:border-primary/50 transition-all"
                        placeholder="e.g., John Doe"
                    />
                </div>

                <div className="flex flex-col gap-3 pt-2">
                    <button 
                        onClick={handleSave}
                        disabled={loading}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-sm font-bold text-white shadow-md hover:bg-primary/90 disabled:opacity-70 transition-all active:scale-[0.98]"
                    >
                        {loading ? <Loader2 className="h-4 w-4 animate-spin"/> : <Save className="h-4 w-4" />}
                        SAVE CHANGES
                    </button>
                    
                    <button 
                        onClick={onLogout}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-500/10 border border-red-500/20 py-3.5 text-sm font-bold text-red-500 hover:bg-red-500/20 hover:text-red-400 transition-all active:scale-[0.98]"
                    >
                        <LogOut className="h-4 w-4" />
                        LOG OUT
                    </button>
                </div>
            </div>
        </div>

      </div>
    </div>
  )
}