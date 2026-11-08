'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Calendar, Clock, Plus, Share2 } from 'lucide-react'
import { SocialIcon, SOCIAL_META, type SocialPlatform } from '@/components/social-icons'

export default function SchedulePage() {
  const [schedules, setSchedules] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/schedules')
      .then(r => r.json())
      .then(data => {
        setSchedules(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  // Group by date for calendar-like view
  const grouped = schedules.reduce((acc: Record<string, any[]>, s) => {
    const date = new Date(s.scheduled_at).toLocaleDateString(undefined, {
      weekday: 'long',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
    if (!acc[date]) acc[date] = []
    acc[date].push(s)
    return acc
  }, {})

  return (
    <div className="space-y-6 pb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
            Schedule Calendar
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1 font-medium">
            Queue of automated blasts set for Facebook, Instagram, TikTok, and YouTube.
          </p>
        </div>
        <Link href="/posts">
          <Button className="rounded-2xl bg-[#D8F85D] hover:bg-[#CCF046] text-[#18181B] font-bold text-xs shadow-sm">
            <Plus className="h-4 w-4 mr-1.5" />
            Schedule New Blast
          </Button>
        </Link>
      </div>

      {loading ? (
        <Card className="rounded-[28px] border-gray-200/80 dark:border-white/10">
          <CardContent className="py-12 text-center text-muted-foreground text-sm font-semibold">
            Loading schedule queue...
          </CardContent>
        </Card>
      ) : !schedules.length ? (
        <Card className="rounded-[28px] border-gray-200/80 dark:border-white/10">
          <CardContent className="py-14 text-center">
            <Calendar className="h-10 w-10 mx-auto text-gray-400 mb-3 opacity-60" />
            <p className="font-bold text-base text-gray-800 dark:text-gray-200">
              No scheduled posts in queue
            </p>
            <p className="text-xs text-gray-400 max-w-sm mx-auto mt-1 mb-5">
              Distribute campaigns on automated timers across your connected social channels.
            </p>
            <Link href="/posts">
              <Button className="rounded-xl bg-black dark:bg-white text-white dark:text-black text-xs font-bold">
                Create First Post
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-5">
          {Object.entries(grouped).map(([date, items]) => (
            <div
              key={date}
              className="rounded-[28px] bg-white dark:bg-[#15181E] p-6 border border-gray-200/80 dark:border-white/10 shadow-sm"
            >
              <div className="flex items-center gap-2 pb-4 mb-4 border-b border-gray-100 dark:border-white/5">
                <Calendar className="h-4 w-4 text-gray-400" />
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                  {date}
                </h3>
                <span className="text-xs text-gray-400 font-medium">({items.length} blasts)</span>
              </div>

              <div className="space-y-3">
                {items.map((s: any) => {
                  const platform = s.social_accounts?.platform as SocialPlatform
                  const meta = SOCIAL_META[platform]

                  return (
                    <div
                      key={s.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl bg-gray-50/80 dark:bg-white/5 border border-gray-100 dark:border-white/5 gap-3"
                    >
                      <div className="flex items-start gap-3.5">
                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                            meta?.badgeBg || 'bg-gray-800 text-white'
                          } shadow-sm shrink-0`}
                        >
                          <SocialIcon platform={platform || 'instagram'} className="h-5 w-5 text-white" />
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-gray-900 dark:text-white capitalize">
                              {platform || 'Social Channel'}
                            </span>
                            {s.social_accounts?.username && (
                              <span className="text-[11px] text-gray-500 font-medium">
                                @{s.social_accounts.username}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-600 dark:text-gray-300 font-medium leading-relaxed">
                            {s.posts?.content?.slice(0, 90)}
                            {s.posts?.content?.length > 90 ? '...' : ''}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                        <span className="flex items-center gap-1 text-xs font-semibold text-gray-500">
                          <Clock className="h-3.5 w-3.5" />
                          {new Date(s.scheduled_at).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                        <span
                          className={`rounded-xl px-2.5 py-1 text-[11px] font-bold ${
                            s.status === 'published'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : s.status === 'failed'
                              ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                              : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          }`}
                        >
                          ● {s.status}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
