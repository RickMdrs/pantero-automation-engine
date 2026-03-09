"use client"

import { useState } from "react"
import { 
  X, 
  Send, 
  Smartphone, 
  ShieldCheck, 
  Lock, 
  CheckCircle2, 
  Loader2, 
  ArrowRight 
} from "lucide-react"
import { cn } from "@/lib/utils"

interface TelegramModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function TelegramModal({ isOpen, onClose, onSuccess }: TelegramModalProps) {
  const [step, setStep] = useState<"phone" | "code" | "password" | "success">("phone")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  
  const [phone, setPhone] = useState("")
  const [code, setCode] = useState("")
  const [password, setPassword] = useState("")

  if (!isOpen) return null

  const handleSendPhone = async () => {
    if (phone.length < 8) return setError("Invalid phone number")
    setLoading(true); setError("")
    
    try {
      const res = await fetch("http://127.0.0.1:8000/telegram/iniciar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ telefone: phone })
      })
      const data = await res.json()
      
      if (data.status === "success") {
        if (data.step === "concluido") {
             handleSuccess()
        } else {
             setStep("code")
        }
      } else {
        setError(data.mensagem)
      }
    } catch (e) { setError("Engine connection failed (Backend offline?)") }
    setLoading(false)
  }

  const handleVerifyCode = async () => {
    if (code.length < 5) return setError("Incomplete verification code")
    setLoading(true); setError("")
    
    try {
      const res = await fetch("http://127.0.0.1:8000/telegram/codigo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ codigo: code })
      })
      const data = await res.json()
      
      if (data.status === "success") {
        if (data.step === "password") {
          setStep("password")
        } else {
          handleSuccess()
        }
      } else {
        setError(data.mensagem)
      }
    } catch (e) { setError("Connection error") }
    setLoading(false)
  }

  const handleVerifyPassword = async () => {
    setLoading(true); setError("")
    try {
      const res = await fetch("http://127.0.0.1:8000/telegram/senha", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ senha: password })
      })
      const data = await res.json()
      
      if (data.status === "success") {
        handleSuccess()
      } else {
        setError(data.mensagem)
      }
    } catch (e) { setError("Connection error") }
    setLoading(false)
  }

  const handleSuccess = () => {
    setStep("success")
    setTimeout(() => {
        onSuccess() 
        setTimeout(() => {
            setStep("phone")
            setPhone("")
            setCode("")
            setPassword("")
        }, 500)
    }, 2000)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-[#0a0a0a] shadow-2xl animate-in zoom-in-95 duration-200">
        
        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[200px] w-[200px] rounded-full bg-sky-500/10 blur-[80px]" />

        <div className="relative flex items-center justify-between border-b border-white/5 p-5">
          <div className="flex items-center gap-2">
            <Send className="h-5 w-5 text-sky-400" />
            <span className="font-semibold text-white tracking-wide">Connect Telegram</span>
          </div>
          <button onClick={onClose} className="rounded-full p-1 text-zinc-500 hover:bg-white/5 hover:text-white transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="relative p-6">
          {error && (
            <div className="mb-6 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-center text-sm font-medium text-red-400 animate-in slide-in-from-top-2">
              {error}
            </div>
          )}

          {step === "phone" && (
            <div className="flex flex-col gap-6 animate-in slide-in-from-right-4 duration-300">
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-sky-500/10 ring-1 ring-sky-500/20">
                  <Smartphone className="h-8 w-8 text-sky-400" />
                </div>
                <h3 className="text-xl font-bold text-white">Enter your phone number</h3>
                <p className="text-sm text-zinc-400 mt-1">Include country code (e.g., +1 or +55)</p>
              </div>

              <div className="space-y-4">
                <input
                  autoFocus
                  type="text"
                  placeholder="+1 555 000-0000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 p-4 text-center text-xl font-mono text-white placeholder:text-zinc-600 focus:border-sky-500/50 focus:bg-sky-500/5 focus:outline-none transition-all"
                  onKeyDown={(e) => e.key === "Enter" && handleSendPhone()}
                />
                <button
                  onClick={handleSendPhone}
                  disabled={loading || phone.length < 8}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-sky-500 py-3.5 font-bold text-black hover:bg-sky-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
                >
                  {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <>Send Code <ArrowRight className="h-4 w-4" /></>}
                </button>
              </div>
            </div>
          )}

          {step === "code" && (
            <div className="flex flex-col gap-6 animate-in slide-in-from-right-4 duration-300">
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 ring-1 ring-emerald-500/20">
                  <ShieldCheck className="h-8 w-8 text-emerald-400" />
                </div>
                <h3 className="text-xl font-bold text-white">Verification Code</h3>
                <p className="text-sm text-zinc-400 mt-1">Sent securely to your Telegram app</p>
              </div>

              <div className="space-y-4">
                <input
                  autoFocus
                  type="text"
                  placeholder="1 2 3 4 5"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 p-4 text-center text-2xl font-mono tracking-[0.5em] text-white placeholder:text-zinc-700 focus:border-emerald-500/50 focus:bg-emerald-500/5 focus:outline-none transition-all"
                  onKeyDown={(e) => e.key === "Enter" && handleVerifyCode()}
                />
                <button
                  onClick={handleVerifyCode}
                  disabled={loading || code.length < 3}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-500 py-3.5 font-bold text-black hover:bg-emerald-400 disabled:opacity-50 transition-all active:scale-[0.98]"
                >
                  {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Verify & Connect"}
                </button>
                <button 
                  onClick={() => setStep("phone")}
                  className="w-full text-xs text-zinc-500 hover:text-zinc-300"
                >
                  Wrong number? Go back
                </button>
              </div>
            </div>
          )}

          {step === "password" && (
            <div className="flex flex-col gap-6 animate-in slide-in-from-right-4 duration-300">
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-purple-500/10 ring-1 ring-purple-500/20">
                  <Lock className="h-8 w-8 text-purple-400" />
                </div>
                <h3 className="text-xl font-bold text-white">Two-Step Verification</h3>
                <p className="text-sm text-zinc-400 mt-1">Your account requires an additional password</p>
              </div>

              <div className="space-y-4">
                <input
                  autoFocus
                  type="password"
                  placeholder="Cloud password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 p-4 text-center text-lg text-white placeholder:text-zinc-600 focus:border-purple-500/50 focus:bg-purple-500/5 focus:outline-none transition-all"
                  onKeyDown={(e) => e.key === "Enter" && handleVerifyPassword()}
                />
                <button
                  onClick={handleVerifyPassword}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-purple-500 py-3.5 font-bold text-white hover:bg-purple-600 disabled:opacity-50 transition-all active:scale-[0.98]"
                >
                  {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Unlock Account"}
                </button>
              </div>
            </div>
          )}

          {step === "success" && (
            <div className="flex flex-col items-center justify-center py-8 text-center animate-in zoom-in duration-300">
              <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-emerald-500/20 ring-1 ring-emerald-500/40">
                <CheckCircle2 className="h-12 w-12 text-emerald-400 animate-bounce" />
              </div>
              <h3 className="text-2xl font-bold text-white">Connected!</h3>
              <p className="mt-2 text-zinc-400">The engine now has secure access to Telegram.</p>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}