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
import {
  Calendar,
  Sparkles,
  Send,
  Clock,
  CheckCircle2,
  AlertCircle,
  Eye,
  FileText,
  Image as ImageIcon,
} from 'lucide-react'
import type { Platform } from '@multiblast/shared'

const PLATFORMS: { value: Platform; label: string }[] = [
  { value: 'instagram', label: 'Instagram' },
  { value: 'tiktok', label: 'TikTok' },
  { value: 'facebook', label: 'Facebook' },
  { value: 'youtube', label: 'YouTube' },
]

export default function PostsPage() {
  const [content, setContent] = useState('')
  const [mediaUrls, setMediaUrls] = useState('')
  const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>(['instagram', 'tiktok', 'facebook', 'youtube'])
  const [scheduledAt, setScheduledAt] = useState('')
  const [adaptWithAi, setAdaptWithAi] = useState(true)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [posts, setPosts] = useState<any[]>([])
  const [accounts, setAccounts] = useState<any[]>([])

  useEffect(() => {
    fetchPosts()
    fetchAccounts()
  }, [])

  async function fetchPosts() {
    try {
      const res = await fetch('/api/posts')
      if (res.ok) setPosts(await res.json())
    } catch (err) {
      console.error(err)
    }
  }

  async function fetchAccounts() {
    try {
      const res = await fetch('/api/social-accounts')
      if (res.ok) setAccounts(await res.json())
    } catch (err) {
      console.error(err)
    }
  }

  function togglePlatform(p: Platform) {
    setSelectedPlatforms(prev =>
      prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p],
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!content || !selectedPlatforms.length) {
      setMessage({ type: 'error', text: 'Post content and at least one destination platform required' })
      return
    }

    setLoading(true)
    setMessage(null)

    // Map platforms to accounts
    const socialAccountIds: Record<string, string> = {}
    for (const platform of selectedPlatforms) {
      const account = accounts.find((a: any) => a.platform === platform)
      if (account) socialAccountIds[platform] = account.id
    }

    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          mediaUrls: mediaUrls ? mediaUrls.split('\n').map(u => u.trim()).filter(Boolean) : [],
          platforms: selectedPlatforms,
          scheduledAt: scheduledAt || undefined,
          socialAccountIds: Object.keys(socialAccountIds).length ? socialAccountIds : undefined,
          adaptWithAi,
        }),
      })

      if (res.ok) {
        setMessage({
          type: 'success',
          text: scheduledAt
            ? `Post scheduled for ${new Date(scheduledAt).toLocaleString()} on ${selectedPlatforms.join(', ')}!`
            : `Post blast dispatched to ${selectedPlatforms.join(', ')}!`,
        })
        setContent('')
        setMediaUrls('')
        setScheduledAt('')
        fetchPosts()
      } else {
        const err = await res.json()
        setMessage({ type: 'error', text: err.error || 'Failed to dispatch post' })
      }
    } catch {
      setMessage({ type: 'error', text: 'Network error publishing post' })
    }

    setLoading(false)
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
          Omnichannel Posts
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-1 font-medium">
          Create, schedule, and broadcast campaigns simultaneously to Facebook, Instagram, TikTok, and YouTube.
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

      <Tabs defaultValue="create" className="space-y-6">
        <TabsList className="bg-gray-100/80 dark:bg-white/5 p-1 rounded-2xl border border-gray-200/60 dark:border-white/5 inline-flex">
          <TabsTrigger value="create" className="rounded-xl px-4 py-2 font-bold text-xs">
            Create Campaign Post
          </TabsTrigger>
          <TabsTrigger value="list" className="rounded-xl px-4 py-2 font-bold text-xs">
            Published &amp; Scheduled ({posts.length})
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Create Post */}
        <TabsContent value="create">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Form: Span 7 */}
            <div className="lg:col-span-7">
              <Card className="rounded-[28px] border-gray-200/80 dark:border-white/10 shadow-sm overflow-hidden">
                <CardHeader className="border-b border-gray-100 dark:border-white/5">
                  <CardTitle className="text-base font-bold flex items-center gap-2">
                    <Send className="h-4 w-4 text-gray-500" />
                    New Multi-Platform Blast
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Distribute across 4 social networks in one click
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Platform Selector Buttons */}
                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                        Target Channels (Omnichannel)
                      </Label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                        {PLATFORMS.map(p => {
                          const isSelected = selectedPlatforms.includes(p.value)
                          const meta = SOCIAL_META[p.value as SocialPlatform]
                          const isConnected = accounts.some((a: any) => a.platform === p.value)

                          return (
                            <button
                              key={p.value}
                              type="button"
                              onClick={() => togglePlatform(p.value)}
                              className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all text-center relative ${
                                isSelected
                                  ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white shadow-md scale-[1.02]'
                                  : 'bg-gray-50/80 dark:bg-white/5 text-gray-700 dark:text-gray-300 border-gray-200/70 dark:border-white/10 hover:border-gray-400'
                              }`}
                            >
                              <div
                                className={`flex h-8 w-8 items-center justify-center rounded-xl mb-1.5 ${
                                  isSelected ? 'bg-white/20 dark:bg-black/20' : meta.badgeBg
                                }`}
                              >
                                <SocialIcon platform={p.value} className="h-4 w-4 text-white" />
                              </div>
                              <span className="text-xs font-bold">{p.label}</span>
                              <span className="text-[10px] opacity-70 mt-0.5">
                                {isConnected ? '● Connected' : '○ Ready'}
                              </span>
                            </button>
                          )
                        })}
                      </div>
                    </div>

                    {/* Post Content */}
                    <div className="space-y-2">
                      <Label htmlFor="content" className="text-xs font-bold text-gray-700 dark:text-gray-300">
                        Post Caption / Body
                      </Label>
                      <Textarea
                        id="content"
                        placeholder="Write your campaign announcement, promo hook, or product story..."
                        value={content}
                        onChange={e => setContent(e.target.value)}
                        rows={4}
                        required
                        className="rounded-2xl resize-none"
                      />
                    </div>

                    {/* Media URLs */}
                    <div className="space-y-2">
                      <Label htmlFor="media" className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                        <ImageIcon className="h-3.5 w-3.5" />
                        Media Image or Video URL (optional)
                      </Label>
                      <Input
                        id="media"
                        placeholder="https://images.unsplash.com/photo-example.jpg"
                        value={mediaUrls}
                        onChange={e => setMediaUrls(e.target.value)}
                        className="rounded-xl font-mono text-xs"
                      />
                    </div>

                    {/* Schedule Date Time */}
                    <div className="space-y-2">
                      <Label htmlFor="schedule" className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5" />
                        Schedule Publishing (leave blank for immediate draft)
                      </Label>
                      <Input
                        id="schedule"
                        type="datetime-local"
                        value={scheduledAt}
                        onChange={e => setScheduledAt(e.target.value)}
                        className="rounded-xl"
                      />
                    </div>

                    {/* AI Adapt Toggle */}
                    <div className="flex items-center justify-between p-3.5 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#D8F85D] text-black">
                          <Sparkles className="h-4 w-4" />
                        </div>
                        <div>
                          <Label htmlFor="ai-adapt" className="text-xs font-bold cursor-pointer">
                            Auto-adapt per platform (AI)
                          </Label>
                          <p className="text-[11px] text-gray-500">
                            Hashtags for Instagram, short hook for TikTok, long caption for FB/YT.
                          </p>
                        </div>
                      </div>
                      <Switch
                        id="ai-adapt"
                        checked={adaptWithAi}
                        onCheckedChange={setAdaptWithAi}
                      />
                    </div>

                    {/* Submit Button */}
                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full h-11 rounded-2xl bg-[#D8F85D] hover:bg-[#CCF046] text-[#18181B] font-extrabold text-sm shadow-sm"
                    >
                      {loading
                        ? 'Publishing Blast...'
                        : scheduledAt
                        ? 'Schedule Multi-Platform Blast'
                        : 'Publish to Selected Channels'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Right Preview: Span 5 */}
            <div className="lg:col-span-5 space-y-4">
              <div className="rounded-[28px] bg-white dark:bg-[#15181E] p-6 border border-gray-200/80 dark:border-white/10 shadow-sm">
                <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-white/5">
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Eye className="h-4 w-4 text-gray-400" />
                    Omnichannel Live Preview
                  </h3>
                  <span className="text-[11px] font-bold text-gray-400">
                    {selectedPlatforms.length} Channels Target
                  </span>
                </div>

                {/* Simulated Feed Mockup */}
                <div className="mt-4 rounded-2xl bg-gray-50 dark:bg-[#0E1015] p-4 border border-gray-100 dark:border-white/5 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-[#D8F85D] to-[#7C4DFF] flex items-center justify-center font-black text-xs text-black">
                      MB
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-900 dark:text-white">
                        MultiBlast Brand
                      </p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        {selectedPlatforms.map(p => (
                          <span
                            key={p}
                            className="text-[10px] font-bold uppercase tracking-wider text-gray-400"
                          >
                            {p}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed min-h-[60px]">
                    {content || (
                      <span className="text-gray-400 italic">
                        Type caption on the left to see live preview...
                      </span>
                    )}
                  </p>

                  {mediaUrls ? (
                    <div className="rounded-xl overflow-hidden border border-gray-200/50 dark:border-white/10 bg-black aspect-video flex items-center justify-center text-xs text-gray-400">
                      <img
                        src={mediaUrls.split('\n')[0]}
                        alt="Media preview"
                        className="w-full h-full object-cover"
                        onError={e => {
                          ;(e.target as any).style.display = 'none'
                        }}
                      />
                    </div>
                  ) : (
                    <div className="rounded-xl border border-dashed border-gray-200 dark:border-white/10 p-6 text-center text-gray-400 text-xs">
                      No media attached (Text blast)
                    </div>
                  )}

                  <div className="pt-2 flex items-center justify-between text-[11px] text-gray-400 border-t border-gray-200/50 dark:border-white/5">
                    <span>❤️ 1,248 Likes</span>
                    <span>💬 382 Comments (Auto-reply active)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Tab 2: All Posts */}
        <TabsContent value="list">
          <div className="space-y-3">
            {!posts.length ? (
              <Card className="rounded-[28px] border-gray-200/80 dark:border-white/10">
                <CardContent className="py-12 text-center text-muted-foreground">
                  <FileText className="h-8 w-8 mx-auto text-gray-400 mb-2 opacity-50" />
                  <p className="font-semibold text-sm">No campaign posts created yet.</p>
                  <p className="text-xs text-gray-400 mt-1">Create your first blast in the tab above.</p>
                </CardContent>
              </Card>
            ) : (
              posts.map((post: any) => (
                <div
                  key={post.id}
                  className="rounded-[24px] bg-white dark:bg-[#15181E] p-5 border border-gray-200/80 dark:border-white/10 shadow-sm flex items-start justify-between gap-4 transition-all hover:shadow-md"
                >
                  <div className="space-y-2 flex-1">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white leading-relaxed">
                      {post.content}
                    </p>

                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <span className="text-[11px] font-bold text-gray-400 uppercase">
                        Platforms:
                      </span>
                      {post.platforms?.map((p: string) => {
                        const meta = SOCIAL_META[p as SocialPlatform]
                        return (
                          <span
                            key={p}
                            className="inline-flex items-center gap-1.5 rounded-xl px-2.5 py-1 text-xs font-bold bg-gray-100 dark:bg-white/5 text-gray-800 dark:text-gray-200 border border-gray-200/50 dark:border-white/5"
                          >
                            <SocialIcon platform={p} className="h-3.5 w-3.5" />
                            <span className="capitalize">{p}</span>
                          </span>
                        )
                      })}
                    </div>
                  </div>

                  <span
                    className={`rounded-xl px-3 py-1.5 text-xs font-bold shrink-0 ${
                      post.status === 'published'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                        : post.status === 'failed'
                        ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                    }`}
                  >
                    ● {post.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
