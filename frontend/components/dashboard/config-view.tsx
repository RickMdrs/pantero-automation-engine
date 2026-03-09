"use client"

import { useState, useEffect } from "react"
import { Settings, Save, MessageSquare, Ghost, Loader2, CheckCircle2, Shield, Plus, Trash2, Users } from "lucide-react"
import { cn } from "@/lib/utils"

export function ConfigView() {
  const [whatsappGroups, setWhatsappGroups] = useState<string[]>([])
  const [newGroupInput, setNewGroupInput] = useState("") 
  
  const [ghostMode, setGhostMode] = useState(false)
  
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const carregarConfig = async () => {
      try {
        const res = await fetch("http://127.0.0.1:8000/config")
        if (res.ok) {
          const data = await res.json()
          setWhatsappGroups(data.whatsapp_groups || [])
          setGhostMode(data.ghost_mode || false)
        }
      } catch (error) {
        console.error("Error loading config:", error)
      } finally {
        setIsLoading(false)
      }
    }
    carregarConfig()
  }, [])

  const addGroup = () => {
    if (!newGroupInput.trim()) return
    if (whatsappGroups.includes(newGroupInput.trim())) {
        alert("This group is already on the list!")
        return
    }
    setWhatsappGroups([...whatsappGroups, newGroupInput.trim()])
    setNewGroupInput("")
  }

  const removeGroup = (index: number) => {
    const newList = whatsappGroups.filter((_, i) => i !== index)
    setWhatsappGroups(newList)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
        e.preventDefault()
        addGroup()
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    setSaved(false)
    
    try {
      const res = await fetch("http://127.0.0.1:8000/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          whatsapp_groups: whatsappGroups,
          license_key: "", 
          ghost_mode: ghostMode
        })
      })

      if (res.ok) {
        setSaved(true)
        setTimeout(() => setSaved(false), 2500)
      } else {
        alert("Error saving configuration!")
      }
    } catch (error) {
      alert("Engine connection error.")
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-5 p-6 lg:p-8">
      <div className="glass flex items-center gap-3 rounded-xl px-5 py-3">
        <Shield className="h-4 w-4 text-primary" />
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Secure Configuration Panel
        </span>
        <div className="ml-auto flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-50" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
          </span>
          <span className="text-xs text-muted-foreground">Encrypted</span>
        </div>
      </div>

      <div className="glass rounded-xl p-6 neon-glow-purple lg:p-8">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15 neon-border-purple">
            <Settings className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">System Configuration</h2>
            <p className="text-sm text-muted-foreground">Manage your dispatch protocols</p>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-3">
            <label className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Users className="h-4 w-4 text-accent" />
              Target Groups (WhatsApp)
            </label>
            
            <div className="flex gap-2">
              <div className="relative flex-1">
                <MessageSquare className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  value={newGroupInput}
                  onChange={(e) => setNewGroupInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Enter group name and press Enter..."
                  className="w-full rounded-lg border border-border/50 bg-secondary/40 pl-9 pr-4 py-3 text-sm text-foreground placeholder-muted-foreground/60 outline-none transition-all focus:border-accent/50 focus:ring-1 focus:ring-accent/30"
                />
              </div>
              <button 
                onClick={addGroup}
                className="flex items-center justify-center rounded-lg bg-accent/20 px-4 text-accent hover:bg-accent/30 transition-colors"
              >
                <Plus className="h-5 w-5" />
              </button>
            </div>

            <div className="flex flex-col gap-2 mt-1">
                {whatsappGroups.length === 0 && (
                    <span className="text-xs text-muted-foreground italic px-1">No groups configured. The engine will not dispatch any messages.</span>
                )}
                {whatsappGroups.map((group, idx) => (
                    <div key={idx} className="flex items-center justify-between rounded-lg border border-border/30 bg-secondary/20 p-3 animate-in fade-in slide-in-from-left-2">
                        <div className="flex items-center gap-3">
                            <div className="h-2 w-2 rounded-full bg-emerald-500" />
                            <span className="text-sm font-medium">{group}</span>
                        </div>
                        <button 
                            onClick={() => removeGroup(idx)}
                            className="text-muted-foreground hover:text-destructive transition-colors p-1"
                        >
                            <Trash2 className="h-4 w-4" />
                        </button>
                    </div>
                ))}
            </div>
          </div>

          <div className="border-t border-border/30" />

          <div className="flex items-center justify-between rounded-lg border border-border/30 bg-secondary/20 px-5 py-4">
            <div className="flex items-center gap-3">
              <div className={cn("flex h-9 w-9 items-center justify-center rounded-lg transition-all duration-300", ghostMode ? "bg-accent/20 neon-border-cyan neon-glow-cyan" : "bg-secondary/40 border border-border/30")}>
                <Ghost className={cn("h-5 w-5 transition-colors duration-300", ghostMode ? "text-accent" : "text-muted-foreground")} />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-foreground">Ghost Mode</span>
                <span className="text-xs text-muted-foreground">Runs the browser hidden in the background.</span>
              </div>
            </div>

            <button
              type="button"
              role="switch"
              aria-checked={ghostMode}
              onClick={() => setGhostMode(!ghostMode)}
              className={cn("relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full transition-all duration-300", ghostMode ? "bg-accent neon-glow-cyan" : "bg-secondary")}
            >
              <span className={cn("pointer-events-none inline-block h-5 w-5 rounded-full shadow-md transition-transform duration-300", ghostMode ? "translate-x-6 bg-accent-foreground" : "translate-x-1 bg-muted-foreground")} />
            </button>
          </div>

          <div className="border-t border-border/30" />

          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className={cn(
                "group relative flex items-center justify-center gap-3 rounded-xl px-8 py-3.5 text-sm font-semibold transition-all duration-300",
                saved ? "bg-emerald-500/20 text-emerald-400 neon-border-cyan" : "bg-gradient-to-r from-primary to-accent text-white shadow-lg hover:shadow-primary/25 hover:brightness-110"
              )}
            >
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : saved ? <CheckCircle2 className="h-4 w-4" /> : <Save className="h-4 w-4" />}
              <span>{isSaving ? "Saving..." : saved ? "Configuration Saved" : "Save Changes"}</span>
              {!saved && !isSaving && <span className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary to-accent opacity-0 blur-xl transition-opacity duration-300 group-hover:opacity-30" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}