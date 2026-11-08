import type { Platform } from '../types'
import type { SocialProvider, PublishResult } from './types'

export class TikTokProvider implements SocialProvider {
  platform: Platform = 'tiktok'
  private baseUrl = 'https://open.tiktokapis.com/v2'

  async publishPost(params: {
    accessToken: string
    content: string
    mediaUrls?: string[]
    hashtags?: string[]
  }): Promise<PublishResult> {
    try {
      if (!params.mediaUrls?.length) {
        return { success: false, error: 'TikTok requires a video' }
      }

      const caption = params.hashtags?.length
        ? `${params.content} ${params.hashtags.map(h => `#${h}`).join(' ')}`
        : params.content

      // Step 1: Init video upload
      const initRes = await fetch(`${this.baseUrl}/post/publish/video/init/`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${params.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          post_info: {
            title: caption,
            privacy_level: 'PUBLIC_TO_EVERYONE',
            disable_duet: false,
            disable_comment: false,
            disable_stitch: false,
          },
          source_info: {
            source: 'PULL_FROM_URL',
            video_url: params.mediaUrls[0],
          },
        }),
      })

      const initData = await initRes.json()
      if (initData.error?.code) {
        return { success: false, error: initData.error.message }
      }

      return { success: true, platformPostId: initData.data?.publish_id }
    } catch (err) {
      return { success: false, error: String(err) }
    }
  }

  async replyToComment(params: {
    accessToken: string
    commentId: string
    text: string
  }) {
    try {
      const res = await fetch(`${this.baseUrl}/comment/reply/`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${params.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          comment_id: params.commentId,
          text: params.text,
        }),
      })
      const data = await res.json()
      if (data.error?.code) return { success: false, error: data.error.message }
      return { success: true }
    } catch (err) {
      return { success: false, error: String(err) }
    }
  }

  async sendDm(params: {
    accessToken: string
    recipientId: string
    message: string
  }) {
    // TikTok DM API is limited; business accounts only
    try {
      const res = await fetch(`${this.baseUrl}/im/message/send/`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${params.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to_user_id: params.recipientId,
          msg_type: 'text',
          text: { text: params.message },
        }),
      })
      const data = await res.json()
      if (data.error?.code) return { success: false, error: data.error.message }
      return { success: true }
    } catch (err) {
      return { success: false, error: String(err) }
    }
  }
}
