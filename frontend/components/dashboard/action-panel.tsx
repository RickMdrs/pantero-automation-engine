"use client"

import { useState, useEffect, useRef } from "react"
import { Play, Square, Loader2, Power } from "lucide-react"
import { cn } from "@/lib/utils"
import { TelegramModal } from "./telegram-modal"

export function ActionPanel() {
  const [isRunning, setIsRunning] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showTelegramModal, setShowTelegramModal] = useState(false)
  const isRunningRef = useRef(false) 

  useEffect(() => {
    const checkStatusInicial = async () => {
      try {
        const res = await fetch("http://127.0.0.1:8000/stats")
        if (res.ok) {
          const data = await res.json()
          if (data.status_robo === 1) {
            setIsRunning(true)
            isRunningRef.current = true
          }
        }
      } catch (e) { console.error("Sync error", e) }
    }
    checkStatusInicial()
  }, []) 

  useEffect(() => {
    let interval: NodeJS.Timeout

    const checkLogs = async () => {
      try {
        const res = await fetch("http://127.0.0.1:8000/logs")
        if (res.ok) {
          const logs = await res.json()
          const ultimoLog = logs[0] 
          
          if (ultimoLog && ultimoLog.message.includes("AGUARDANDO_LOGIN_TELEGRAM")) {
            if (!showTelegramModal) setShowTelegramModal(true)
          }
        }
      } catch (e) { }
    }

    interval = setInterval(checkLogs, 1500)
    return () => clearInterval(interval)
  }, [showTelegramModal])

  const handleStart = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("http://127.0.0.1:8000/iniciar", { method: "POST" })
      const data = await response.json() 
      
      if (response.ok && data.tipo !== "erro") {
        setIsRunning(true)
        isRunningRef.current = true
      } else {
        alert(`System rejected: ${data.mensagem}`)
      }
    } catch (error) {
      alert("Failed to connect to the Engine (API offline?).")
    } finally {
      setIsLoading(false)
    }
  }

  const handleStop = async () => {
    setIsLoading(true)
    try {
      await fetch("http://127.0.0.1:8000/parar", { method: "POST" })
      setIsRunning(false)
      isRunningRef.current = false
    } catch (error) { console.error(error) } 
    finally { setIsLoading(false) }
  }

  return (
    <>
      <TelegramModal 
        isOpen={showTelegramModal}
        onClose={() => {
            if (!isRunning) handleStop() 
            setShowTelegramModal(false)
        }}
        onSuccess={() => setShowTelegramModal(false)}
      />

      <div className="glass rounded-xl p-6">
        <div className="mb-4 flex items-center gap-2">
          <Power className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            System Control
          </h3>
        </div>

        <div className="flex flex-col items-center gap-4 sm:flex-row">
          <button
            type="button"
            onClick={handleStart}
            disabled={isRunning || isLoading}
            className={cn(
              "group relative flex flex-1 items-center justify-center gap-3 rounded-xl px-8 py-4 text-base font-semibold transition-all duration-300",
              isRunning
                ? "cursor-not-allowed bg-primary/10 text-primary/50"
                : "bg-gradient-to-r from-primary to-accent text-white shadow-lg hover:shadow-primary/25 hover:brightness-110"
            )}
          >
            {isLoading && !isRunning ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Play className="h-5 w-5" />
            )}
            <span>{isLoading && !isRunning ? "Starting Engine..." : "START ENGINE"}</span>
            {!isRunning && !isLoading && (
              <span className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary to-accent opacity-0 blur-xl transition-opacity duration-300 group-hover:opacity-30" />
            )}
          </button>

          <button
            type="button"
            onClick={handleStop}
            disabled={!isRunning || isLoading}
            className={cn(
              "flex items-center justify-center gap-3 rounded-xl border px-8 py-4 text-base font-semibold transition-all duration-300",
              !isRunning
                ? "cursor-not-allowed border-border/30 bg-secondary/30 text-muted-foreground/50"
                : "border-destructive/30 bg-destructive/10 text-destructive hover:bg-destructive/20"
            )}
          >
            {isLoading && isRunning ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Square className="h-4 w-4" />
            )}
            <span>{isLoading && isRunning ? "Stopping..." : "STOP"}</span>
          </button>
        </div>

        {isRunning && (
          <div className="mt-4 flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
            </span>
            <span className="text-sm font-medium text-emerald-400">
              Engine is active and monitoring
            </span>
          </div>
        )}
      </div>
    </>
  )
}