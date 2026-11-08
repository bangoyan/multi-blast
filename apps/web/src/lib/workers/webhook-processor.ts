import { createWorker, QUEUE_NAMES, createSupabaseAdmin } from '@multiblast/shared'
import { getProvider } from '../social'
import { generateCommentReply, checkKeywordMatch } from '../ai'
import type { Platform } from '@multiblast/shared'

export interface WebhookJob {
  platform: Platform
  event: string
  data: Record<string, unknown>
}

export function startWebhookWorker() {
  return createWorker<WebhookJob>(
    QUEUE_NAMES.WEBHOOK_PROCESSOR,
    async (job) => {
      const { platform, event, data } = job.data
      const supabase = createSupabaseAdmin()

      if (event !== 'comment') return

      const commentText = data.text as string
      const commentId = data.commentId as string
      const postPlatformId = data.postId as string
      const commenterUsername = data.username as string
      const commenterPlatformId = data.userId as string

      // Find matching social account
      const { data: accounts } = await supabase
        .from('social_accounts')
        .select('*')
        .eq('platform', platform)

      if (!accounts?.length) return

      for (const account of accounts) {
        // Check comment rules for this account
        const { data: rules } = await supabase
          .from('comment_rules')
          .select('*')
          .eq('social_account_id', account.id)
          .eq('is_active', true)

        if (!rules?.length) continue

        const provider = getProvider(platform)

        for (const rule of rules) {
          let shouldReply = false
          let replyText = ''

          if (rule.mode === 'keyword_triggered' && rule.keywords?.length) {
            shouldReply = await checkKeywordMatch(commentText, rule.keywords)
            if (shouldReply && rule.reply_template) {
              replyText = rule.reply_template
                .replace(/\{username\}/g, commenterUsername)
                .replace(/\{comment\}/g, commentText)
            }
          } else if (rule.mode === 'ai_persona' && rule.persona_prompt) {
            shouldReply = true
            replyText = await generateCommentReply(
              commentText,
              rule.persona_prompt,
              rule.persona_style || undefined,
            )
          }

          if (shouldReply && replyText) {
            await provider.replyToComment({
              accessToken: account.access_token,
              commentId,
              text: replyText,
            })

            // Check DM triggers
            const { data: dmTriggers } = await supabase
              .from('dm_triggers')
              .select('*')
              .eq('social_account_id', account.id)
              .eq('is_active', true)

            if (dmTriggers?.length) {
              for (const trigger of dmTriggers) {
                const matchesDm = await checkKeywordMatch(commentText, trigger.trigger_keywords)
                if (matchesDm) {
                  // Queue DM send
                  const { createQueue } = await import('@multiblast/shared')
                  const dmQueue = createQueue(QUEUE_NAMES.DM_SENDER)
                  await dmQueue.add('send-dm', {
                    triggerId: trigger.id,
                    userId: account.user_id,
                    platform,
                    recipientId: commenterPlatformId,
                    recipientUsername: commenterUsername,
                    accessToken: account.access_token,
                  })
                }
              }
            }

            break // only one rule reply per comment
          }
        }
      }
    },
  )
}
