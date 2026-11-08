'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { SocialIcon, SOCIAL_META, type SocialPlatform } from '@/components/social-icons'
import { Send, Link as LinkIcon, Sparkles, CheckCircle2, AlertCircle, Trash2, ArrowUpRight } from 'lucide-react'
import Link from 'next/link'

export default function AutoDmPage() {
  const [triggers, setTriggers] = useState<any[]>([])
  const [accounts, setAccounts] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const [name, setName] = useState('')
  const [accountId, setAccountId] = useState('')
  const [triggerKeywords, setTriggerKeywords] = useState('')
  const [dmTemplate, setDmTemplate] = useState('')
  const [affiliateUrl, setAffiliateUrl] = useState('')
  const [lynkIdUrl, setLynkIdUrl] = useState('')
  const [campaignName, setCampaignName] = useState('')
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    fetchTriggers()
    fetchAccounts()
  }, [])

  async function fetchTriggers() {
    try {
      const res = await fetch('/api/dm-triggers')
      if (res.ok) setTriggers(await res.json())
    } catch (err) {
      console.error(err)
    }
  }

  async function fetchAccounts() {
    try {
      const res = await fetch('/api/social-accounts')
      if (res.ok) {
        const data = await res.json()
        setAccounts(data)
        if (data.length > 0 && !accountId) {
          setAccountId(data[0].id)
        }
      }
    } catch (err) {
      console.error(err)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name || !accountId || !triggerKeywords || !dmTemplate) {
      setMessage({ type: 'error', text: 'All required fields must be filled' })
      return
    }
    setLoading(true)
    setMessage(null)

    try {
      const res = await fetch('/api/dm-triggers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          socialAccountId: accountId,
          name,
          triggerKeywords: triggerKeywords.split(',').map(k => k.trim()).filter(Boolean),
          dmMessageTemplate: dmTemplate,
          affiliateUrl: affiliateUrl || undefined,
          lynkIdUrl: lynkIdUrl || undefined,
          campaignName: campaignName || undefined,
        }),
      })

      if (res.ok) {
        setMessage({ type: 'success', text: 'DM Funnel trigger activated!' })
        setName('')
        setTriggerKeywords('')
        setDmTemplate('')
        setAffiliateUrl('')
        setLynkIdUrl('')
        setCampaignName('')
        fetchTriggers()
      } else {
        const err = await res.json()
        setMessage({ type: 'error', text: err.error || 'Failed to save trigger' })
      }
    } catch {
      setMessage({ type: 'error', text: 'Failed to create DM trigger' })
    }
    setLoading(false)
  }

  async function toggleTrigger(id: string, isActive: boolean) {
    await fetch('/api/dm-triggers', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, is_active: !isActive }),
    })
    fetchTriggers()
  }

  async function deleteTrigger(id: string) {
    if (!confirm('Delete this DM trigger?')) return
    await fetch(`/api/dm-triggers?id=${id}`, { method: 'DELETE' })
    fetchTriggers()
  }

  return (
    <div className="space-y-6 pb-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
          Auto DM Funneling
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-1 font-medium">
          Automatically send personalized Direct Messages (affiliate links, Lynk.id URLs, coupons) when users comment on Facebook, Instagram, TikTok, or YouTube.
        </p>
      </div>

      {message && (
        <div
          className={`p-4 rounded-2xl flex items-center gap-3 text-xs sm:text-sm font-semibold ${
            message.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/40'
              : 'bg-rose-50 text-rose-800 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/40'
          }`}
        >
          {message.type === 'success' ? <CheckCircle2 className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
          <span>{message.text}</span>
        </div>
      )}

      {/* New DM Trigger Card */}
      <Card className="rounded-[28px] border-gray-200/80 dark:border-white/10 shadow-sm overflow-hidden">
        <CardHeader className="border-b border-gray-100 dark:border-white/5">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <Send className="h-4 w-4 text-gray-500" />
            New Keyword DM Funnel Trigger
          </CardTitle>
          <CardDescription className="text-xs">
            Converts comment interest into immediate private DM affiliate sales
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-xs font-bold text-gray-700 dark:text-gray-300">
                  Trigger Campaign Name
                </Label>
                <Input
                  id="name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Promo Giveaway Lynk.id Link"
                  required
                  className="rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="account" className="text-xs font-bold text-gray-700 dark:text-gray-300">
                    Social Account Channel
                  </Label>
                  <Link
                    href="/accounts"
                    className="text-[11px] font-bold text-gray-400 hover:text-black dark:hover:text-white inline-flex items-center gap-0.5"
                  >
                    <span>Add Channels</span>
                    <ArrowUpRight className="h-3 w-3" />
                  </Link>
                </div>
                <select
                  id="account"
                  className="flex h-10 w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white/80 dark:bg-card px-3.5 text-xs font-bold focus:ring-2 focus:ring-[#D8F85D] outline-none"
                  value={accountId}
                  onChange={e => setAccountId(e.target.value)}
                  required
                >
                  <option value="">-- Choose Connected Social Account --</option>
                  {accounts.map((a: any) => (
                    <option key={a.id} value={a.id}>
                      [{a.platform?.toUpperCase()}] @{a.username}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                Trigger Keywords (comma separated)
              </Label>
              <Input
                placeholder="mau, spill, harga, link, beli, diskon, mau dong"
                value={triggerKeywords}
                onChange={e => setTriggerKeywords(e.target.value)}
                required
                className="rounded-xl font-medium"
              />
              <p className="text-[11px] text-gray-400">
                Any public comment matching one of these keywords will instantly trigger an auto-DM to that user.
              </p>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                DM Message Template
              </Label>
              <Textarea
                placeholder="Hai {username}! Makasih udah komen ya. Ini link checkout promo spesialnya: {link} ! Stok terbatas ya kak ✨"
                value={dmTemplate}
                onChange={e => setDmTemplate(e.target.value)}
                rows={3}
                required
                className="rounded-2xl"
              />
              <p className="text-[11px] text-gray-400">
                Variables: <code className="bg-gray-100 dark:bg-white/10 px-1 py-0.5 rounded">{'{username}'}</code>, <code className="bg-gray-100 dark:bg-white/10 px-1 py-0.5 rounded">{'{link}'}</code>, <code className="bg-gray-100 dark:bg-white/10 px-1 py-0.5 rounded">{'{affiliate_url}'}</code>, <code className="bg-gray-100 dark:bg-white/10 px-1 py-0.5 rounded">{'{lynk_id_url}'}</code>
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                  <LinkIcon className="h-3.5 w-3.5" /> Affiliate URL
                </Label>
                <Input
                  placeholder="https://shopee.co.id/universal-link/123"
                  value={affiliateUrl}
                  onChange={e => setAffiliateUrl(e.target.value)}
                  className="rounded-xl font-mono text-xs"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                  <LinkIcon className="h-3.5 w-3.5" /> Lynk.id / Landing Page URL
                </Label>
                <Input
                  placeholder="https://lynk.id/yourbrand/promo"
                  value={lynkIdUrl}
                  onChange={e => setLynkIdUrl(e.target.value)}
                  className="rounded-xl font-mono text-xs"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                Campaign Tracking Tag (optional)
              </Label>
              <Input
                placeholder="e.g. Flash-Sale-Nov-2026"
                value={campaignName}
                onChange={e => setCampaignName(e.target.value)}
                className="rounded-xl text-xs"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="h-11 rounded-2xl bg-[#D8F85D] hover:bg-[#CCF046] text-[#18181B] font-extrabold text-sm shadow-sm"
            >
              {loading ? 'Activating Funnel...' : 'Activate DM Funnel Trigger'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Active Triggers List */}
      <div className="space-y-3 pt-2">
        <h2 className="text-base font-bold text-gray-900 dark:text-white">Active DM Funnels</h2>
        {!triggers.length ? (
          <Card className="rounded-[28px] border-gray-200/80 dark:border-white/10">
            <CardContent className="py-10 text-center text-muted-foreground text-xs font-semibold">
              No DM triggers yet. Add one above to start automating private affiliate link dispatches.
            </CardContent>
          </Card>
        ) : (
          triggers.map((t: any) => {
            const platform = t.social_accounts?.platform as SocialPlatform
            const meta = SOCIAL_META[platform]

            return (
              <div
                key={t.id}
                className="rounded-[24px] bg-white dark:bg-[#15181E] p-5 border border-gray-200/80 dark:border-white/10 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-3.5">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                      meta?.badgeBg || 'bg-black text-white'
                    } shrink-0`}
                  >
                    <SocialIcon platform={platform || 'instagram'} className="h-5 w-5 text-white" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-gray-900 dark:text-white">{t.name}</p>
                      {t.campaign_name && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 dark:bg-white/5 text-gray-500">
                          {t.campaign_name}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 font-medium">
                      Channel: <span className="capitalize font-bold text-gray-700 dark:text-gray-300">{platform}</span> (@{t.social_accounts?.username})
                    </p>
                    <p className="text-[11px] text-gray-400">
                      Keywords: {t.trigger_keywords?.join(', ')}
                    </p>
                    {(t.affiliate_url || t.lynk_id_url) && (
                      <p className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 truncate max-w-md">
                        URL: {t.affiliate_url || t.lynk_id_url}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4 self-end sm:self-center">
                  <Switch
                    checked={t.is_active}
                    onCheckedChange={() => toggleTrigger(t.id, t.is_active)}
                    aria-label={`Toggle ${t.name}`}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteTrigger(t.id)}
                    className="text-gray-400 hover:text-rose-600 rounded-xl"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
