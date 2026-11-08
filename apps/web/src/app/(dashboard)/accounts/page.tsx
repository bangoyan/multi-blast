'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { SocialIcon, SOCIAL_META, type SocialPlatform } from '@/components/social-icons'
import {
  CheckCircle2,
  Plus,
  Trash2,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  AlertCircle,
  Key,
  ArrowRight,
} from 'lucide-react'

const PLATFORMS: SocialPlatform[] = ['instagram', 'tiktok', 'facebook', 'youtube']

function AccountsContent() {
  const searchParams = useSearchParams()
  const [accounts, setAccounts] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [activePlatformModal, setActivePlatformModal] = useState<SocialPlatform | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'warning'; text: string; link?: string } | null>(null)

  // Form states
  const [username, setUsername] = useState('')
  const [platformUserId, setPlatformUserId] = useState('')
  const [accessToken, setAccessToken] = useState('')

  useEffect(() => {
    fetchAccounts()

    // Handle OAuth callback status from URL
    const err = searchParams.get('error')
    const success = searchParams.get('success')
    const platform = searchParams.get('platform')

    if (success === 'connected' && platform) {
      setMessage({
        type: 'success',
        text: `Berhasil menghubungkan ${SOCIAL_META[platform as SocialPlatform]?.name || platform} via OAuth 2.0!`,
      })
    } else if (err === 'no_instagram_business_found') {
      setMessage({
        type: 'error',
        text: 'Akun Instagram Bisnis/Kreator tidak ditemukan pada Halaman Facebook Anda. Pastikan: 1) Akun IG sudah diubah ke tipe Profesional (Bisnis/Kreator), 2) Akun IG sudah ditautkan ke Facebook Page di Pengaturan Instagram.',
      })
    } else if (err === 'missing_keys' && platform) {
      const platName = SOCIAL_META[platform as SocialPlatform]?.name || platform
      setMessage({
        type: 'warning',
        text: `OAuth API keys for ${platName} are not set in the VPS .env yet. Configure them in Settings or use 1-Click Connect for testing.`,
        link: '/settings',
      })
    } else if (err) {
      setMessage({
        type: 'error',
        text: `OAuth authentication notice: ${decodeURIComponent(err)}`,
      })
    }
  }, [searchParams])

  async function fetchAccounts() {
    try {
      const res = await fetch('/api/social-accounts')
      if (res.ok) {
        const data = await res.json()
        setAccounts(data)
      }
    } catch (err) {
      console.error(err)
    }
  }

  function openConnectModal(p: SocialPlatform) {
    setActivePlatformModal(p)
    setMessage(null)
    const existing = accounts.find((a: any) => a.platform === p)
    if (existing) {
      setUsername(existing.username)
      setPlatformUserId(existing.platform_user_id || '')
      setAccessToken('')
    } else {
      setUsername('')
      setPlatformUserId('')
      setAccessToken('')
    }
  }

  async function handleQuickConnect(p: SocialPlatform) {
    setLoading(true)
    setMessage(null)

    const existingCount = accounts.filter((a: any) => a.platform === p).length
    const suffix = existingCount > 0 ? `_${existingCount + 1}` : ''

    const defaultNames: Record<SocialPlatform, string> = {
      instagram: `brand_multiblast${suffix}`,
      tiktok: `creator_multiblast${suffix}`,
      facebook: `MultiBlast Marketing HQ${suffix ? ' #' + (existingCount + 1) : ''}`,
      youtube: `MultiBlast Omnichannel${suffix ? ' #' + (existingCount + 1) : ''}`,
    }

    try {
      const res = await fetch('/api/social-accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform: p,
          username: defaultNames[p],
          platformUserId: `${p}_uid_${Date.now()}_${existingCount + 1}`,
          accessToken: `token_demo_${p}_${Math.random().toString(36).substring(2)}`,
        }),
      })

      if (res.ok) {
        setMessage({ type: 'success', text: `${SOCIAL_META[p].name} account #${existingCount + 1} connected!` })
        setActivePlatformModal(null)
        fetchAccounts()
      } else {
        const err = await res.json()
        setMessage({ type: 'error', text: err.error || 'Failed to connect account' })
      }
    } catch {
      setMessage({ type: 'error', text: 'Connection failed' })
    }
    setLoading(false)
  }

  async function handleManualSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!activePlatformModal || !username || !platformUserId || !accessToken) {
      setMessage({ type: 'error', text: 'All fields are required' })
      return
    }

    setLoading(true)
    setMessage(null)

    try {
      const res = await fetch('/api/social-accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform: activePlatformModal,
          username,
          platformUserId,
          accessToken,
        }),
      })

      if (res.ok) {
        setMessage({ type: 'success', text: `${SOCIAL_META[activePlatformModal].name} connected!` })
        setActivePlatformModal(null)
        setUsername('')
        setPlatformUserId('')
        setAccessToken('')
        fetchAccounts()
      } else {
        const err = await res.json()
        setMessage({ type: 'error', text: err.error || 'Failed to save account' })
      }
    } catch {
      setMessage({ type: 'error', text: 'Connection failed' })
    }
    setLoading(false)
  }

  async function handleDelete(id: string) {
    if (!confirm('Disconnect this account?')) return
    await fetch(`/api/social-accounts?id=${id}`, { method: 'DELETE' })
    fetchAccounts()
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
            Social Media Channels
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1 font-medium">
            Connect via OAuth 2.0 to Facebook, Instagram, TikTok, and YouTube for automated posting, comment replies, and funnel DMs.
          </p>
        </div>
        <Link href="/settings">
          <Button variant="outline" className="rounded-2xl text-xs font-bold gap-1.5 shadow-sm">
            <Key className="h-3.5 w-3.5" />
            OAuth &amp; Redirect URIs
          </Button>
        </Link>
      </div>

      {message && (
        <div
          className={`p-4 rounded-2xl flex items-center justify-between gap-3 text-xs sm:text-sm font-semibold ${
            message.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/40'
              : message.type === 'warning'
              ? 'bg-amber-50 text-amber-800 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/40'
              : 'bg-rose-50 text-rose-800 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/40'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {message.type === 'success' ? (
              <CheckCircle2 className="h-5 w-5 shrink-0" />
            ) : (
              <AlertCircle className="h-5 w-5 shrink-0" />
            )}
            <span>{message.text}</span>
          </div>
          {message.link && (
            <Link
              href={message.link}
              className="inline-flex items-center gap-1 font-bold underline underline-offset-4 shrink-0 hover:opacity-80"
            >
              <span>View Settings</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          )}
        </div>
      )}

      {/* 4 Bento Channel Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
        {PLATFORMS.map(platform => {
          const meta = SOCIAL_META[platform]
          const platformAccounts = accounts.filter((a: any) => a.platform === platform)
          const isConnected = platformAccounts.length > 0

          return (
            <div
              key={platform}
              className={`rounded-[28px] p-6 border transition-all duration-200 ${
                isConnected
                  ? 'bg-white dark:bg-[#15181E] border-gray-200/80 dark:border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.04)] ring-1 ring-black/5'
                  : 'bg-white/70 dark:bg-[#121418] border-gray-100 dark:border-white/5 shadow-sm hover:shadow-md'
              }`}
            >
              {/* Header: Platform Icon + Badge */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3.5">
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-2xl ${meta.badgeBg} shadow-sm`}
                  >
                    <SocialIcon platform={platform} className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                      {meta.name}
                      {isConnected && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                          <CheckCircle2 className="h-3 w-3" /> {platformAccounts.length} Connected
                        </span>
                      )}
                    </h3>
                    <p className="text-xs text-gray-500 font-medium mt-0.5">
                      {isConnected
                        ? `${platformAccounts.length} account${platformAccounts.length > 1 ? 's' : ''} linked to this channel`
                        : 'Ready for 1-Click OAuth connection'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Connected Accounts List */}
              {isConnected && (
                <div className="mt-4 space-y-2">
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                    Linked Accounts
                  </p>
                  <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                    {platformAccounts.map((acc: any) => {
                      const followers = acc.metadata?.followers_count || acc.metadata?.subscriber_count
                      return (
                        <div
                          key={acc.id}
                          className="flex items-center justify-between p-3 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 hover:border-gray-200 transition-colors"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="h-7 w-7 rounded-xl bg-gray-200 dark:bg-white/10 flex items-center justify-center font-bold text-xs shrink-0">
                              {acc.username.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-gray-900 dark:text-white truncate">
                                @{acc.username}
                              </p>
                              <p className="text-[10px] text-gray-500 truncate">
                                {followers ? `${Number(followers).toLocaleString()} followers • ` : ''}ID: {acc.platform_user_id.slice(-8)}
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(acc.id)}
                            className="h-7 w-7 text-gray-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 shrink-0"
                            title="Disconnect account"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Description */}
              {!isConnected && (
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-4 leading-relaxed font-normal">
                  {meta.description}
                </p>
              )}

              {/* Capabilities Pills */}
              <div className="mt-4 flex flex-wrap gap-1.5">
                {meta.capabilities.map((cap, i) => (
                  <span
                    key={i}
                    className="text-[11px] font-semibold px-2.5 py-1 rounded-xl bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300 border border-gray-200/50 dark:border-white/5"
                  >
                    {cap}
                  </span>
                ))}
              </div>

              {/* Actions */}
              <div className="mt-6 pt-4 border-t border-gray-100 dark:border-white/5 flex flex-col gap-2.5">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <a href={`/api/oauth/${platform}`} className="flex-1">
                      <Button
                        size="sm"
                        className="w-full rounded-xl bg-black dark:bg-white text-white dark:text-black hover:bg-black/80 font-bold text-xs shadow-sm"
                      >
                        <Key className="h-3.5 w-3.5 mr-1.5" />
                        {isConnected ? `+ Add Another ${meta.name} Account` : 'Connect via OAuth'}
                      </Button>
                    </a>
                    <Button
                      onClick={() => handleQuickConnect(platform)}
                      disabled={loading}
                      size="sm"
                      className="rounded-xl bg-[#D8F85D] hover:bg-[#CCF046] text-[#18181B] font-bold text-xs shadow-sm"
                      title="Quick connect demo account for testing"
                    >
                      <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                      1-Click Demo
                    </Button>
                  </div>
                  <div className="flex items-center justify-between text-[11px] font-semibold text-gray-400 pt-1">
                    <span>Multi-account ready</span>
                    <button
                      type="button"
                      onClick={() => openConnectModal(platform)}
                      className="hover:text-gray-700 dark:hover:text-gray-200 underline underline-offset-2"
                    >
                      Manual Access Token &rarr;
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Manual Connection Modal / Card */}
      {activePlatformModal && (
        <Card className="rounded-[28px] border-gray-200/80 dark:border-white/10 shadow-xl overflow-hidden mt-6">
          <CardHeader className="bg-gray-50/50 dark:bg-white/5 border-b border-gray-100 dark:border-white/5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-xl ${SOCIAL_META[activePlatformModal].badgeBg}`}
                >
                  <SocialIcon platform={activePlatformModal} className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-base font-bold">
                    Manual Token Setup: {SOCIAL_META[activePlatformModal].name}
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Paste long-lived bearer token, page access token, or user token
                  </CardDescription>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setActivePlatformModal(null)}
                className="rounded-xl"
              >
                Cancel
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleManualSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-xs font-bold">Username / Handle</Label>
                  <Input
                    placeholder={SOCIAL_META[activePlatformModal].placeholderUser}
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold">Platform User / Page / Channel ID</Label>
                  <Input
                    placeholder="e.g. 17841400012345678"
                    value={platformUserId}
                    onChange={e => setPlatformUserId(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold">Access Token</Label>
                <Input
                  type="password"
                  placeholder="Paste long-lived bearer or graph access token"
                  value={accessToken}
                  onChange={e => setAccessToken(e.target.value)}
                  required
                />
                <p className="text-[11px] text-gray-500">
                  Access tokens are securely stored and used for webhook auto-replies, funnel DMs, and scheduled broadcasts.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setActivePlatformModal(null)}
                  className="rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="rounded-xl bg-[#D8F85D] hover:bg-[#CCF046] text-[#18181B] font-bold"
                >
                  {loading ? 'Saving...' : `Save ${SOCIAL_META[activePlatformModal].name} Token`}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default function AccountsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm font-bold">Loading channels...</div>}>
      <AccountsContent />
    </Suspense>
  )
}
