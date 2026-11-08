import type { Platform } from '@multiblast/shared'
import type { SocialProvider, PublishResult } from './types'

// Instagram Graph API implementation
export class InstagramProvider implements SocialProvider {
  platform: Platform = 'instagram'
  private baseUrl = 'https://graph.instagram.com/v21.0'

  async publishPost(params: {
    accessToken: string
    content: string
    mediaUrls?: string[]
    hashtags?: string[]
  }): Promise<PublishResult> {
    try {
      const caption = params.hashtags?.length
        ? `${params.content}\n\n${params.hashtags.map(h => `#${h}`).join(' ')}`
        : params.content

      if (!params.mediaUrls?.length) {
        return { success: false, error: 'Instagram requires at least one image or video' }
      }

      // Step 1: Create media container
      const mediaUrl = params.mediaUrls[0]
      const isVideo = /\.(mp4|mov)$/i.test(mediaUrl)

      const containerRes = await fetch(`${this.baseUrl}/me/media`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          access_token: params.accessToken,
          caption,
          ...(isVideo
            ? { media_type: 'VIDEO', video_url: mediaUrl }
            : { image_url: mediaUrl }),
        }),
      })

      const container = await containerRes.json()
      if (container.error) {
        return { success: false, error: container.error.message }
      }

      // Step 2: Publish the container
      const publishRes = await fetch(`${this.baseUrl}/me/media_publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          access_token: params.accessToken,
          creation_id: container.id,
        }),
      })

      const published = await publishRes.json()
      if (published.error) {
        return { success: false, error: published.error.message }
      }

      return { success: true, platformPostId: published.id }
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
      const res = await fetch(`${this.baseUrl}/${params.commentId}/replies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          access_token: params.accessToken,
          message: params.text,
        }),
      })
      const data = await res.json()
      if (data.error) return { success: false, error: data.error.message }
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
    try {
      // Instagram DM via Messenger API (requires page-level permissions)
      const res = await fetch(`${this.baseUrl}/me/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          access_token: params.accessToken,
          recipient: { id: params.recipientId },
          message: { text: params.message },
        }),
      })
      const data = await res.json()
      if (data.error) return { success: false, error: data.error.message }
      return { success: true }
    } catch (err) {
      return { success: false, error: String(err) }
    }
  }
}
