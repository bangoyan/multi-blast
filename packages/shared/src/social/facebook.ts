import type { Platform } from '../types'
import type { SocialProvider, PublishResult } from './types'

export class FacebookProvider implements SocialProvider {
  platform: Platform = 'facebook'
  private baseUrl = 'https://graph.facebook.com/v21.0'

  async publishPost(params: {
    accessToken: string
    content: string
    mediaUrls?: string[]
    hashtags?: string[]
  }): Promise<PublishResult> {
    try {
      const message = params.hashtags?.length
        ? `${params.content}\n\n${params.hashtags.map(h => `#${h}`).join(' ')}`
        : params.content

      let endpoint = `${this.baseUrl}/me/feed`
      const body: Record<string, string> = {
        access_token: params.accessToken,
        message,
      }

      if (params.mediaUrls?.length) {
        const mediaUrl = params.mediaUrls[0]
        const isVideo = /\.(mp4|mov)$/i.test(mediaUrl)
        if (isVideo) {
          endpoint = `${this.baseUrl}/me/videos`
          body.file_url = mediaUrl
          body.description = message
        } else {
          endpoint = `${this.baseUrl}/me/photos`
          body.url = mediaUrl
        }
      }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (data.error) return { success: false, error: data.error.message }
      return { success: true, platformPostId: data.id || data.post_id }
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
      const res = await fetch(`${this.baseUrl}/${params.commentId}/comments`, {
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
