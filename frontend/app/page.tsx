"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "@/components/dashboard/sidebar"
import { MetricCards } from "@/components/dashboard/metric-cards"
import { ActionPanel } from "@/components/dashboard/action-panel"
import { ActivityFeed } from "@/components/dashboard/activity-feed"
import { StatusBar } from "@/components/dashboard/status-bar"
import { ConfigView } from "@/components/dashboard/config-view"
import { AccountsView } from "@/components/dashboard/accounts-view"
import { AnalyticsView } from "@/components/dashboard/analytics-view"
import { Bell, AlertTriangle, CreditCard, LogOut } from "lucide-react"
import { open } from '@tauri-apps/plugin-shell'
import { LastOffer } from "@/components/dashboard/last-offer"
import { LoginView } from "@/components/dashboard/login-view"
import { UserProfileView } from "@/components/dashboard/user-profile-view"
import { NotificationsPanel } from "@/components/dashboard/notifications-panel"

const viewMeta: Record<string, { title: string; description: string }> = {
  dashboard: { title: "Dashboard", description: "Engine overview and live stats" },
  config: { title: "Settings", description: "Manage dispatch protocols and system" },
  accounts: { title: "Connections", description: "Manage Amazon & Mercado Livre sessions" },
  analytics: { title: "Analytics", description: "Historical performance and insights" },
  user_profile: { title: "My Profile", description: "Subscription & Account Data" },
}

export default function Page() {
  const [isAuthenticated, setIsAuthenticated] = useState(false) 
  const [userData, setUserData] = useState<any>(null)

  const [activeView, setActiveView] = useState("dashboard")
  
  const [showNotifications, setShowNotifications] = useState(false)
  const [notifications, setNotifications] = useState<any[]>([])
  const [unreadCount, setUnreadCount] = useState(0)

  const meta = viewMeta[activeView] ?? viewMeta.dashboard

  const handleLoginSuccess = (data: any) => {
    setUserData(data)
    setIsAuthenticated(true)
  }

  const handleUpdateProfile = (newName: string) => {
    setUserData((prev: any) => ({
        ...prev,
        full_name: newName,
        profile_pic: `https://ui-avatars.com/api/?name=${newName}&background=7C3AED&color=fff`
    }))
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    setUserData(null)
    setActiveView("dashboard") 
  }

  const handleBellClick = async () => {
    if (!showNotifications) {
        try {
            const res = await fetch("http://127.0.0.1:8000/notifications")
            if (res.ok) {
                const data = await res.json()
                setNotifications(data.items || [])
            }
            await fetch("http://127.0.0.1:8000/notifications/read", { method: "POST" })
            setUnreadCount(0)
        } catch (e) {}
    }
    setShowNotifications(!showNotifications)
  }

  if (!isAuthenticated) {
    return <LoginView onLoginSuccess={handleLoginSuccess} />
  }

  if (userData?.is_expired) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background/95 p-4 animate-in fade-in duration-500">
         <div className="glass max-w-md w-full rounded-2xl p-8 text-center flex flex-col items-center relative overflow-hidden shadow-2xl border border-red-500/20">
             <div className="absolute -top-10 -right-10 h-32 w-32 bg-red-500/20 rounded-full blur-3xl pointer-events-none" />
             <div className="absolute -bottom-10 -left-10 h-32 w-32 bg-primary/20 rounded-full blur-3xl pointer-events-none" />

             <div className="h-20 w-20 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mb-6 border border-red-500/20 shadow-[0_0_30px_rgba(239,68,68,0.2)]">
                 <AlertTriangle className="h-10 w-10" />
             </div>
             <h1 className="text-2xl font-bold text-foreground mb-2">Subscription Expired</h1>
             <p className="text-muted-foreground text-sm mb-8 leading-relaxed px-2">
                 Your access to <b>Pantero IA</b> has ended. Renew now to reactivate your engine and keep generating automated deals!
             </p>

             <button 
                onClick={() => open('https://beacons.ai/pantero.ia')}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-red-600 to-red-500 hover:brightness-110 text-white font-bold py-4 rounded-xl shadow-lg shadow-red-500/25 transition-all active:scale-95 mb-4"
             >
                 <CreditCard className="h-5 w-5" />
                 RENEW SUBSCRIPTION NOW
             </button>

             <button 
                onClick={handleLogout}
                className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
             >
                 <LogOut className="h-4 w-4" />
                 Log Out
             </button>
         </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background animate-in fade-in duration-700">
      <Sidebar activeView={activeView} onNavigate={setActiveView} user={userData} />
      <main className="flex flex-1 flex-col overflow-y-auto scrollbar-thin relative">
        <header className="flex items-center justify-between border-b border-border/30 px-8 py-4">
          <div>
            <h1 className="text-xl font-bold text-foreground">{meta.title}</h1>
            <p className="text-sm text-muted-foreground">{meta.description}</p>
          </div>
          
          <div className="flex items-center gap-3 relative">
            <button 
              onClick={handleBellClick}
              className="glass relative flex h-9 w-9 items-center justify-center rounded-lg hover:bg-secondary transition-all active:scale-95"
            >
              <Bell className="h-4 w-4 text-muted-foreground" />
              {unreadCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-3 w-3 items-center justify-center rounded-full bg-red-500 text-[8px] font-bold text-white shadow-lg animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
                <NotificationsPanel 
                    notifications={notifications} 
                    onClose={() => setShowNotifications(false)} 
                />
            )}
          </div>
        </header>

        {activeView === "dashboard" && (
          <div className="flex flex-col gap-5 p-6 lg:p-8">
            <StatusBar />
            <MetricCards />
            <div className="grid gap-6 md:grid-cols-3">
                <div className="md:col-span-2"><ActionPanel /></div>
                <div className="md:col-span-1"><LastOffer /></div>
            </div>
            <ActivityFeed />
          </div>
        )}

        {activeView === "config" && <ConfigView />}
        {activeView === "accounts" && <AccountsView />} 
        {activeView === "analytics" && <AnalyticsView />}
        {activeView === "user_profile" && (
            <UserProfileView 
                userData={userData} 
                onProfileUpdate={handleUpdateProfile} 
                onLogout={handleLogout} 
            />
        )}
      </main>
    </div>
  )
}