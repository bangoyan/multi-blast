'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mode, setMode] = useState<'login' | 'signup'>('login')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()

    const { data, error: authError } = mode === 'login'
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/api/auth/callback` },
        })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    if (mode === 'signup' && !data?.session) {
      setError('Check your email to confirm your account')
      setLoading(false)
      return
    }

    window.location.href = '/dashboard'
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#ECEEF1] dark:bg-[#0E1015] p-4 text-foreground">
      {/* Claymorphic Rounded Card */}
      <div className="w-full max-w-md rounded-[32px] bg-[#E3E6EB] dark:bg-[#13161C] p-7 sm:p-9 shadow-[0_20px_50px_rgba(0,0,0,0.06)] dark:shadow-none border border-white/60 dark:border-white/5">

        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-black dark:bg-white text-white dark:text-black shadow-lg mb-4">
            {/* 8-Point Geometric Star */}
            <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0L13.8 8.2L22 6.4L15.8 12L22 17.6L13.8 15.8L12 24L10.2 15.8L2 17.6L8.2 12L2 6.4L10.2 8.2L12 0Z" />
            </svg>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-gray-900 dark:text-white">
            MultiBlast
          </h1>
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mt-1">
            {mode === 'login' ? 'Sign in to access your omnichannel command center' : 'Create an account to automate your marketing'}
          </p>
        </div>

        {/* Inner White Form Container */}
        <div className="rounded-[24px] bg-white dark:bg-card p-6 shadow-sm border border-white/80 dark:border-white/5">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-bold text-gray-700 dark:text-gray-300">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="h-11 rounded-xl bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-white/10 text-sm focus:ring-2 focus:ring-[#D8F85D]"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-xs font-bold text-gray-700 dark:text-gray-300">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                minLength={6}
                className="h-11 rounded-xl bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-white/10 text-sm focus:ring-2 focus:ring-[#D8F85D]"
              />
            </div>

            {error && (
              <div className="rounded-xl bg-red-50 dark:bg-red-950/30 p-3 text-xs font-semibold text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/30">
                {error}
              </div>
            )}

            {/* Neon Lime CTA Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 flex items-center justify-center rounded-2xl bg-[#D8F85D] hover:bg-[#CCF046] text-black font-extrabold text-sm transition-all shadow-[0_4px_16px_rgba(216,248,93,0.4)] disabled:opacity-50"
            >
              {loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Sign Up'}
            </button>

            <div className="text-center pt-2">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
                <button
                  type="button"
                  className="font-bold text-black dark:text-white underline underline-offset-4 hover:text-[#7C4DFF]"
                  onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(null) }}
                >
                  {mode === 'login' ? 'Sign Up' : 'Sign In'}
                </button>
              </p>
            </div>
          </form>
        </div>

        {/* Footer info */}
        <p className="text-center text-[11px] font-medium text-gray-400 mt-6">
          MultiBlast &bull; Automated Social Posting, Comments &amp; Funnel DMs
        </p>

      </div>
    </div>
  )
}
