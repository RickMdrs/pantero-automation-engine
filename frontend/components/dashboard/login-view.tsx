"use client"

import { useState } from "react"
import { Lock, User, Loader2, ArrowRight, Eye } from "lucide-react"
import { cn } from "@/lib/utils"

interface LoginViewProps {
  onLoginSuccess: (userData: any) => void
}

export function LoginView({ onLoginSuccess }: LoginViewProps) {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    // --- MODO DEMONSTRAÇÃO (PORTFÓLIO BYPASS) ---
    // Se o recrutador digitar demo/demo, ele entra sem API!
    if (username.toLowerCase() === "demo" && password === "demo") {
      setTimeout(() => {
        onLoginSuccess({
          success: true,
          username: "demo_user",
          full_name: "Tech Recruiter",
          days_left: 99,
          is_expired: false,
          profile_pic: "https://ui-avatars.com/api/?name=Tech+Recruiter&background=7C3AED&color=fff"
        })
        setIsLoading(false)
      }, 1000)
      return
    }

    // --- FLUXO REAL (SEU USO DIÁRIO) ---
    try {
      const res = await fetch("http://127.0.0.1:8000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      })

      const data = await res.json()

      if (data.success) {
        onLoginSuccess(data)
      } else {
        setError(data.message || "Invalid credentials.")
      }
    } catch (err) {
      setError("Server connection error. Check if the engine is running.")
    } finally {
      setIsLoading(false)
    }
  }

  // Função rápida para o recrutador não precisar digitar
  const handleDemoClick = () => {
    setUsername("demo")
    setPassword("demo")
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background p-4 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background" />
      
      <div className="glass relative z-10 w-full max-w-md overflow-hidden rounded-2xl border border-border/50 shadow-2xl animate-in fade-in zoom-in-95 duration-500">
        <div className="flex flex-col items-center justify-center border-b border-border/30 bg-secondary/30 p-8 pb-6">
          <div className="flex h-20 w-20 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 neon-border-purple shadow-lg mb-4 overflow-hidden">
             <img src="/pantero.png" alt="Pantero Logo" className="h-full w-full object-cover" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Pantero IA</h1>
          <p className="mt-2 text-center text-sm text-muted-foreground">Dashboard Access</p>
        </div>

        <div className="p-8 pt-6">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1">Username</label>
              <div className="relative group">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" />
                <input 
                  type="text" 
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  className="w-full rounded-xl border border-border/50 bg-secondary/30 pl-10 pr-4 py-3 text-sm text-foreground outline-none transition-all focus:border-primary/50 focus:bg-secondary/50 focus:ring-1 focus:ring-primary/30"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1">Password</label>
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" />
                <input 
                  type="password" 
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-border/50 bg-secondary/30 pl-10 pr-4 py-3 text-sm text-foreground outline-none transition-all focus:border-primary/50 focus:bg-secondary/50 focus:ring-1 focus:ring-primary/30"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="rounded-lg bg-destructive/10 p-3 text-center text-xs font-medium text-destructive animate-in fade-in slide-in-from-top-1">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className={cn(
                "group relative mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-accent py-3.5 text-sm font-bold text-white shadow-lg transition-all hover:brightness-110 hover:shadow-primary/25 disabled:opacity-70 disabled:cursor-not-allowed"
              )}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </button>
            
            {/* BOTÃO MÁGICO PARA O PORTFÓLIO */}
            <button
              type="button"
              onClick={handleDemoClick}
              className="mt-2 flex w-full items-center justify-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <Eye className="h-3 w-3" />
              Recruiter? Auto-fill Demo Account
            </button>

          </form>
        </div>
      </div>
    </div>
  )
}