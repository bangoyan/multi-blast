'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { SocialIcon, SOCIAL_META, type SocialPlatform } from '@/components/social-icons'
import { MessageSquare, Sparkles, CheckCircle2, AlertCircle, Trash2, ArrowUpRight } from 'lucide-react'
import Link from 'next/link'

export default function AutoReplyPage() {
  const [rules, setRules] = useState<any[]>([])
  const [accounts, setAccounts] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  // Form state
  const [name, setName] = useState('')
  const [mode, setMode] = useState<'ai_persona' | 'keyword_triggered'>('ai_persona')
  const [accountId, setAccountId] = useState('')
  const [personaPrompt, setPersonaPrompt] = useState('')
  const [personaStyle, setPersonaStyle] = useState('')
  const [keywords, setKeywords] = useState('')
  const [replyTemplate, setReplyTemplate] = useState('')
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    fetchRules()
    fetchAccounts()
  }, [])

  async function fetchRules() {
    try {
      const res = await fetch('/api/comment-rules')
      if (res.ok) setRules(await res.json())
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
    if (!name || !accountId) {
      setMessage({ type: 'error', text: 'Rule name and social account destination required' })
      return
    }
    setLoading(true)
    setMessage(null)

    try {
      const res = await fetch('/api/comment-rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          socialAccountId: accountId,
          name,
          mode,
          personaPrompt: mode === 'ai_persona' ? personaPrompt : undefined,
          personaStyle: mode === 'ai_persona' ? personaStyle : undefined,
          keywords: mode === 'keyword_triggered' ? keywords.split(',').map(k => k.trim()).filter(Boolean) : undefined,
          replyTemplate: mode === 'keyword_triggered' ? replyTemplate : undefined,
        }),
      })

      if (res.ok) {
        setMessage({ type: 'success', text: 'Auto-reply rule successfully activated!' })
        setName('')
        setPersonaPrompt('')
        setPersonaStyle('')
        setKeywords('')
        setReplyTemplate('')
        fetchRules()
      } else {
        const err = await res.json()
        setMessage({ type: 'error', text: err.error || 'Failed to create rule' })
      }
    } catch {
      setMessage({ type: 'error', text: 'Failed to create rule' })
    }
    setLoading(false)
  }

  async function toggleRule(id: string, isActive: boolean) {
    await fetch('/api/comment-rules', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, is_active: !isActive }),
    })
    fetchRules()
  }

  async function deleteRule(id: string) {
    if (!confirm('Delete this auto-reply rule?')) return
    await fetch(`/api/comment-rules?id=${id}`, { method: 'DELETE' })
    fetchRules()
  }

  return (
    <div className="space-y-6 pb-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
          Auto Reply Rules
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-1 font-medium">
          Automatically reply to audience comments on Facebook, Instagram, TikTok, and YouTube with templates or AI personas.
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

      {/* New Rule Form */}
      <Card className="rounded-[28px] border-gray-200/80 dark:border-white/10 shadow-sm overflow-hidden">
        <CardHeader className="border-b border-gray-100 dark:border-white/5">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-gray-500" />
            Configure Comment Auto-Responder
          </CardTitle>
          <CardDescription className="text-xs">
            Trigger replies instantly when incoming webhook notices new comments
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-xs font-bold text-gray-700 dark:text-gray-300">
                  Rule Name
                </Label>
                <Input
                  id="name"
                  placeholder="e.g. Price inquiry auto-reply"
                  value={name}
                  onChange={e => setName(e.target.value)}
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
                {!accounts.length && (
                  <p className="text-[11px] text-amber-600 font-semibold">
                    No social channels connected yet. Go to Channels tab to connect Facebook, Instagram, TikTok, or YouTube.
                  </p>
                )}
              </div>
            </div>

            <Tabs value={mode} onValueChange={v => setMode(v as any)} className="space-y-4">
              <TabsList className="bg-gray-100/80 dark:bg-white/5 p-1 rounded-2xl border border-gray-200/60 dark:border-white/5">
                <TabsTrigger value="ai_persona" className="rounded-xl text-xs font-bold px-3 py-1.5">
                  AI Persona (Organic)
                </TabsTrigger>
                <TabsTrigger value="keyword_triggered" className="rounded-xl text-xs font-bold px-3 py-1.5">
                  Keyword Triggered (0 Token Template)
                </TabsTrigger>
              </TabsList>

              <TabsContent value="ai_persona" className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                    Persona Prompt Instructions
                  </Label>
                  <Textarea
                    placeholder="You are a friendly customer advocate for our brand. Answer warmly, answer questions briefly, and invite them to check our bio link for promo..."
                    value={personaPrompt}
                    onChange={e => setPersonaPrompt(e.target.value)}
                    rows={3}
                    className="rounded-2xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-gray-700 dark:text-gray-300">Tone of Voice</Label>
                  <select
                    className="flex h-10 w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white/80 dark:bg-card px-3.5 text-xs font-bold focus:ring-2 focus:ring-[#D8F85D] outline-none"
                    value={personaStyle}
                    onChange={e => setPersonaStyle(e.target.value)}
                  >
                    <option value="">Select style</option>
                    <option value="ramah">Ramah &amp; Friendly</option>
                    <option value="kasual">Kasual &amp; Playful</option>
                    <option value="profesional">Profesional &amp; Direct</option>
                    <option value="santai">Santai</option>
                  </select>
                </div>
              </TabsContent>

              <TabsContent value="keyword_triggered" className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                    Trigger Keywords (comma separated)
                  </Label>
                  <Input
                    placeholder="harga, link, beli, spill, info, dm, order"
                    value={keywords}
                    onChange={e => setKeywords(e.target.value)}
                    className="rounded-xl font-medium"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-gray-700 dark:text-gray-300">Reply Template</Label>
                  <Textarea
                    placeholder="Halo {username}! Terima kasih sudah mampir. Detail harga dan link promo sudah kami kirim ke DM ya! Cek inbox ya kak ✨"
                    value={replyTemplate}
                    onChange={e => setReplyTemplate(e.target.value)}
                    rows={2}
                    className="rounded-2xl"
                  />
                  <p className="text-[11px] text-gray-400">
                    Placeholders supported: <code className="bg-gray-100 dark:bg-white/10 px-1 py-0.5 rounded">{'{username}'}</code>, <code className="bg-gray-100 dark:bg-white/10 px-1 py-0.5 rounded">{'{comment}'}</code>
                  </p>
                </div>
              </TabsContent>
            </Tabs>

            <Button
              type="submit"
              disabled={loading}
              className="h-11 rounded-2xl bg-[#D8F85D] hover:bg-[#CCF046] text-[#18181B] font-extrabold text-sm shadow-sm"
            >
              {loading ? 'Activating...' : 'Activate Auto-Reply Rule'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Existing Rules List */}
      <div className="space-y-3 pt-2">
        <h2 className="text-base font-bold text-gray-900 dark:text-white">Active Auto-Reply Rules</h2>
        {!rules.length ? (
          <Card className="rounded-[28px] border-gray-200/80 dark:border-white/10">
            <CardContent className="py-10 text-center text-muted-foreground text-xs font-semibold">
              No auto-reply rules configured yet. Create one above to automatically reply to comments.
            </CardContent>
          </Card>
        ) : (
          rules.map((rule: any) => {
            const platform = rule.social_accounts?.platform as SocialPlatform
            const meta = SOCIAL_META[platform]

            return (
              <div
                key={rule.id}
                className="rounded-[24px] bg-white dark:bg-[#15181E] p-5 border border-gray-200/80 dark:border-white/10 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-3.5">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${meta?.badgeBg || 'bg-black text-white'} shrink-0`}>
                    <SocialIcon platform={platform || 'instagram'} className="h-5 w-5 text-white" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-gray-900 dark:text-white">{rule.name}</p>
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-300">
                        {rule.mode === 'ai_persona' ? 'AI Persona' : 'Keyword Rule'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 font-medium">
                      Channel: <span className="capitalize font-bold text-gray-700 dark:text-gray-300">{platform}</span> (@{rule.social_accounts?.username})
                    </p>
                    {rule.keywords?.length > 0 && (
                      <p className="text-[11px] text-gray-400">
                        Triggers: {rule.keywords.join(', ')}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4 self-end sm:self-center">
                  <Switch
                    checked={rule.is_active}
                    onCheckedChange={() => toggleRule(rule.id, rule.is_active)}
                    aria-label={`Toggle ${rule.name}`}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteRule(rule.id)}
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
