import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createQueue, QUEUE_NAMES } from '@multiblast/shared'
import { adaptCaption } from '@/lib/ai'
import type { Platform } from '@multiblast/shared'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase
    .from('posts')
    .select('*, schedules(*)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { content, mediaUrls, platforms, scheduledAt, socialAccountIds, adaptWithAi } = body

  if (!content || !platforms?.length) {
    return NextResponse.json({ error: 'content and platforms required' }, { status: 400 })
  }

  // AI caption adaptation per platform
  let aiAdaptedContent: Record<string, string> | null = null
  let hashtags: Record<string, string[]> | null = null

  if (adaptWithAi) {
    aiAdaptedContent = {}
    hashtags = {}
    for (const platform of platforms as Platform[]) {
      const adapted = await adaptCaption(content, platform)
      aiAdaptedContent[platform] = adapted.caption
      hashtags[platform] = adapted.hashtags
    }
  }

  const targetTime = scheduledAt || new Date().toISOString()
  const isScheduled = !!scheduledAt

  // Create post
  const { data: post, error: postError } = await supabase
    .from('posts')
    .insert({
      user_id: user.id,
      content,
      media_urls: mediaUrls || [],
      platforms,
      status: isScheduled ? 'scheduled' : 'publishing',
      ai_adapted_content: aiAdaptedContent,
      hashtags,
    })
    .select()
    .single()

  if (postError) return NextResponse.json({ error: postError.message }, { status: 500 })

  // Resolve target accounts across all selected platforms (multi-account support)
  let targetAccountMap: Record<string, string[]> = {}

  if (socialAccountIds && Object.keys(socialAccountIds).length > 0) {
    for (const [plat, ids] of Object.entries(socialAccountIds)) {
      targetAccountMap[plat] = Array.isArray(ids) ? (ids as string[]) : [ids as string]
    }
  } else {
    const { data: userAccounts } = await supabase
      .from('social_accounts')
      .select('id, platform')
      .eq('user_id', user.id)
      .in('platform', platforms)

    if (userAccounts) {
      for (const acc of userAccounts) {
        if (!targetAccountMap[acc.platform]) targetAccountMap[acc.platform] = []
        targetAccountMap[acc.platform].push(acc.id)
      }
    }
  }

  // Create schedules and queue background jobs for each account
  const schedulerQueue = createQueue(QUEUE_NAMES.POST_SCHEDULER)

  for (const platform of platforms as Platform[]) {
    const accountIds = targetAccountMap[platform] || []

    for (const accountId of accountIds) {
      const { data: schedule } = await supabase
        .from('schedules')
        .insert({
          post_id: post.id,
          user_id: user.id,
          platform,
          social_account_id: accountId,
          scheduled_at: targetTime,
          status: 'scheduled',
        })
        .select()
        .single()

      if (schedule) {
        const delay = isScheduled ? Math.max(new Date(scheduledAt).getTime() - Date.now(), 0) : 0
        await schedulerQueue.add(
          'publish',
          { scheduleId: schedule.id },
          { delay, jobId: `schedule-${schedule.id}` },
        )
      }
    }
  }

  return NextResponse.json(post, { status: 201 })
}
