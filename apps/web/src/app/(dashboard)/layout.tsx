'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ThemeToggle } from '@/components/theme-toggle'
import { MultiBlastLogo } from '@/components/logo'
import { cn } from '@/lib/utils'
import {
  LayoutGrid,
  PenSquare,
  Calendar,
  MessageSquare,
  Send,
  Users,
  Settings,
  HelpCircle,
  LogOut,
  Menu,
  X,
  Search,
  Bell,
  Sparkles,
} from 'lucide-react'
import { useState, useEffect } from 'react'

const nav = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutGrid },
  { href: '/posts', label: 'Posts', icon: PenSquare },
  { href: '/schedule', label: 'Schedule', icon: Calendar },
  { href: '/auto-reply', label: 'Auto Reply', icon: MessageSquare },
  { href: '/auto-dm', label: 'Auto DM', icon: Send },
  { href: '/accounts', label: 'Accounts', icon: Users },
  { href: '/settings', label: 'Settings', icon: Settings },
  { href: '/help', label: 'Help', icon: HelpCircle },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [userEmail, setUserEmail] = useState<string>('Josiah')

  useEffect(() => {
    async function loadUser() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user?.email) {
        const namePart = user.user_metadata?.full_name || user.email.split('@')[0]
        setUserEmail(namePart.charAt(0).toUpperCase() + namePart.slice(1))
      }
    }
    loadUser()
  }, [])

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  return (
    <div className="min-h-screen bg-[#ECEEF1] dark:bg-[#0E1015] p-3 sm:p-5 lg:p-6 text-foreground antialiased transition-colors duration-200">
      {/* Outer Claymorphic Workspace Shell */}
      <div className="relative mx-auto flex min-h-[calc(100vh-1.5rem)] sm:min-h-[calc(100vh-2.5rem)] lg:min-h-[calc(100vh-3rem)] max-w-[1600px] rounded-[32px] bg-[#E3E6EB] dark:bg-[#13161C] p-3 sm:p-5 lg:p-6 shadow-[0_20px_50px_rgba(0,0,0,0.06)] dark:shadow-none border border-white/60 dark:border-white/5">

        {/* Mobile backdrop */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* Sidebar */}
        <aside
          className={cn(
            'fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-[#E3E6EB] dark:bg-[#13161C] p-4 transition-transform lg:static lg:translate-x-0 lg:p-0',
            sidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full',
          )}
        >
          {/* Logo Brand */}
          <div className="flex h-16 items-center px-2 mb-4">
            <Link href="/dashboard" className="group">
              <MultiBlastLogo className="h-10 w-10" showText={true} />
            </Link>
            <button
              className="ml-auto rounded-full p-2 text-gray-600 hover:bg-black/5 lg:hidden"
              onClick={() => setSidebarOpen(false)}
              aria-label="Close sidebar"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation Pill Items */}
          <nav className="flex-1 space-y-2.5 px-1 py-2">
            {nav.map(item => {
              const active = pathname === item.href
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    'group flex items-center gap-3.5 rounded-2xl px-4 py-3 text-sm font-semibold transition-all duration-200',
                    active
                      ? 'bg-[#D8F85D] text-black shadow-[0_6px_20px_rgba(216,248,93,0.45)] scale-[1.02]'
                      : 'bg-white/70 dark:bg-white/5 text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-white/10 hover:text-black dark:hover:text-white shadow-[0_2px_8px_rgba(0,0,0,0.02)] border border-white/60 dark:border-white/5',
                  )}
                >
                  <span
                    className={cn(
                      'flex h-7 w-7 items-center justify-center rounded-xl transition-colors',
                      active
                        ? 'bg-black text-[#D8F85D]'
                        : 'text-gray-600 dark:text-gray-400 group-hover:text-black dark:group-hover:text-white',
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </nav>

          {/* Bottom Actions */}
          <div className="pt-4 px-1 border-t border-black/5 dark:border-white/5 space-y-2">
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-2xl bg-white/50 dark:bg-white/5 px-4 py-2.5 text-xs font-semibold text-gray-600 dark:text-gray-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30 dark:hover:text-red-400 transition-all border border-transparent hover:border-red-200"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex flex-1 flex-col overflow-hidden lg:pl-6">
          {/* Top Header Bar */}
          <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 pt-2">
            <div>
              <div className="flex items-center gap-3">
                <button
                  className="rounded-xl bg-white/70 dark:bg-white/10 p-2 text-gray-700 dark:text-gray-200 lg:hidden shadow-sm"
                  onClick={() => setSidebarOpen(true)}
                  aria-label="Open sidebar"
                >
                  <Menu className="h-5 w-5" />
                </button>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
                  Welcome, {userEmail} <span className="inline-block animate-pulse">🎉</span>
                </h1>
              </div>
              <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 mt-1">
                Here&apos;s what happening across your store and social channels.
              </p>
            </div>

            {/* Header Right Pill Actions */}
            <div className="flex items-center gap-2.5 sm:gap-3 self-end sm:self-auto">
              {/* Search Pill */}
              <div className="relative hidden md:flex items-center">
                <Search className="absolute left-3.5 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search campaigns, posts..."
                  className="h-10 w-48 lg:w-64 rounded-full bg-white/80 dark:bg-white/5 pl-9 pr-4 text-xs font-medium text-gray-800 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#D8F85D] shadow-[0_2px_10px_rgba(0,0,0,0.03)] border border-white/60 dark:border-white/10"
                />
              </div>

              {/* Theme Toggle Capsule */}
              <div className="rounded-full bg-white/80 dark:bg-white/5 p-1 shadow-[0_2px_10px_rgba(0,0,0,0.03)] border border-white/60 dark:border-white/10">
                <ThemeToggle />
              </div>

              {/* Notification Bell Pill */}
              <button
                className="relative flex h-10 w-10 items-center justify-center rounded-full bg-white/80 dark:bg-white/5 text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white shadow-[0_2px_10px_rgba(0,0,0,0.03)] border border-white/60 dark:border-white/10 transition-colors"
                aria-label="Notifications"
              >
                <Bell className="h-4 w-4" />
                <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white shadow-sm">
                  2
                </span>
              </button>

              {/* User Avatar Capsule */}
              <div className="flex items-center gap-2 rounded-full bg-white/80 dark:bg-white/5 p-1.5 pr-3 shadow-[0_2px_10px_rgba(0,0,0,0.03)] border border-white/60 dark:border-white/10">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#D8F85D] text-black font-bold text-xs shadow-sm">
                  {userEmail.charAt(0)}
                </div>
                <span className="hidden xl:inline text-xs font-bold text-gray-800 dark:text-gray-200">
                  {userEmail}
                </span>
              </div>
            </div>
          </header>

          {/* Child Page Canvas Content */}
          <main className="flex-1 overflow-y-auto pr-1">
            {children}
          </main>
        </div>

      </div>
    </div>
  )
}
