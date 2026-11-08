import {
  createWorker,
  QUEUE_NAMES,
  createSupabaseAdmin,
  getProvider,
  personalDmMessage,
  type Platform,
} from '@multiblast/shared'

export interface DmSenderJob {
  triggerId: string
  userId: string
  platform: Platform
  recipientId: string
  recipientUsername: string
  accessToken: string
}

export function startDmSenderWorker() {
  return createWorker<DmSenderJob>(
    QUEUE_NAMES.DM_SENDER,
    async (job) => {
      const { triggerId, userId, platform, recipientId, recipientUsername, accessToken } = job.data
      console.log(`[Worker:DMSender] Sending DM to ${recipientUsername} via ${platform}`)
      const supabase = createSupabaseAdmin()

      const { data: trigger } = await supabase
        .from('dm_triggers')
        .select('*')
        .eq('id', triggerId)
        .single()

      if (!trigger) return

      const message = await personalDmMessage(
        trigger.dm_message_template,
        recipientUsername,
        trigger.affiliate_url || undefined,
        trigger.lynk_id_url || undefined,
      )

      const provider = getProvider(platform)
      const result = await provider.sendDm({
        accessToken,
        recipientId,
        message,
      })

      await supabase.from('dm_logs').insert({
        dm_trigger_id: triggerId,
        user_id: userId,
        platform,
        recipient_platform_id: recipientId,
        recipient_username: recipientUsername,
        message_sent: message,
        url_sent: trigger.affiliate_url || trigger.lynk_id_url,
        status: result.success ? 'sent' : 'failed',
        error_message: result.error,
      })

      await supabase.from('activity_logs').insert({
        user_id: userId,
        action: result.success ? 'dm_sent' : 'dm_failed',
        entity_type: 'dm_trigger',
        entity_id: triggerId,
        metadata: { platform, recipient: recipientUsername, error: result.error },
      })

      if (result.success) {
        console.log(`[Worker:DMSender] Successfully sent DM to ${recipientUsername}`)
      } else {
        console.error(`[Worker:DMSender] Failed to send DM: ${result.error}`)
      }
    },
  )
}
