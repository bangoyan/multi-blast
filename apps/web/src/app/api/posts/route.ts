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

  // Create post
  const { data: post, error: postError } = await supabase
    .from('posts')
    .insert({
      user_id: user.id,
      content,
      media_urls: mediaUrls || [],
      platforms,
      status: scheduledAt ? 'scheduled' : 'draft',
      ai_adapted_content: aiAdaptedContent,
      hashtags,
    })
    .select()
    .single()

  if (postError) return NextResponse.json({ error: postError.message }, { status: 500 })

  // Create schedules per platform
  if (scheduledAt && socialAccountIds) {
    const schedulerQueue = createQueue(QUEUE_NAMES.POST_SCHEDULER)

    for (let i = 0; i < platforms.length; i++) {
      const platform = platforms[i]
      const accountId = socialAccountIds[platform]
      if (!accountId) continue

      const { data: schedule } = await supabase
        .from('schedules')
        .insert({
          post_id: post.id,
          user_id: user.id,
          platform,
          social_account_id: accountId,
          scheduled_at: scheduledAt,
          status: 'scheduled',
        })
        .select()
        .single()

      if (schedule) {
        const delay = new Date(scheduledAt).getTime() - Date.now()
        await schedulerQueue.add(
          'publish',
          { scheduleId: schedule.id },
          { delay: Math.max(delay, 0), jobId: `schedule-${schedule.id}` },
        )
      }
    }
  }

  return NextResponse.json(post, { status: 201 })
}
