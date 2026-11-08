import {
  createWorker,
  QUEUE_NAMES,
  createSupabaseAdmin,
  getProvider,
  type Platform,
} from '@multiblast/shared'

export interface PostSchedulerJob {
  scheduleId: string
}

export function startPostSchedulerWorker() {
  return createWorker<PostSchedulerJob>(
    QUEUE_NAMES.POST_SCHEDULER,
    async (job) => {
      console.log(`[Worker:PostScheduler] Processing job ${job.id} for schedule ${job.data.scheduleId}`)
      const supabase = createSupabaseAdmin()
      const { scheduleId } = job.data

      const { data: schedule, error: schedError } = await supabase
        .from('schedules')
        .select('*, posts(*), social_accounts(*)')
        .eq('id', scheduleId)
        .single()

      if (schedError || !schedule) {
        console.error(`[Worker:PostScheduler] Schedule ${scheduleId} not found:`, schedError)
        return
      }

      await supabase
        .from('schedules')
        .update({ status: 'publishing' })
        .eq('id', scheduleId)

      const provider = getProvider(schedule.platform as Platform)
      const post = schedule.posts
      const account = schedule.social_accounts

      const adaptedContent = post.ai_adapted_content?.[schedule.platform]
      const content = adaptedContent || post.content
      const hashtags = post.hashtags?.[schedule.platform] || []

      const result = await provider.publishPost({
        accessToken: account.access_token,
        content,
        mediaUrls: post.media_urls,
        hashtags,
      })

      if (result.success) {
        await supabase
          .from('schedules')
          .update({
            status: 'published',
            published_at: new Date().toISOString(),
            platform_post_id: result.platformPostId,
          })
          .eq('id', scheduleId)

        const { data: remaining } = await supabase
          .from('schedules')
          .select('id')
          .eq('post_id', post.id)
          .neq('status', 'published')

        if (!remaining?.length) {
          await supabase
            .from('posts')
            .update({ status: 'published' })
            .eq('id', post.id)
        }
        console.log(`[Worker:PostScheduler] Post ${post.id} published on ${schedule.platform}`)
      } else {
        await supabase
          .from('schedules')
          .update({
            status: 'failed',
            error_message: result.error,
          })
          .eq('id', scheduleId)
        console.error(`[Worker:PostScheduler] Failed to publish post: ${result.error}`)
      }

      await supabase.from('activity_logs').insert({
        user_id: schedule.user_id,
        action: result.success ? 'post_published' : 'post_failed',
        entity_type: 'schedule',
        entity_id: scheduleId,
        metadata: { platform: schedule.platform, error: result.error },
      })
    },
  )
}
