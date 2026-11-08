import type { Platform } from '@multiblast/shared'
import type { SocialProvider, PublishResult } from './types'

export class YouTubeProvider implements SocialProvider {
  platform: Platform = 'youtube'
  private baseUrl = 'https://www.googleapis.com/youtube/v3'

  async publishPost(params: {
    accessToken: string
    content: string
    mediaUrls?: string[]
    hashtags?: string[]
  }): Promise<PublishResult> {
    // YouTube upload requires resumable upload protocol with video binary.
    // For URL-based upload, the video must be downloaded first.
    // shortcut: only supports metadata-based community posts for now, upgrade when video upload is needed
    try {
      if (!params.mediaUrls?.length) {
        return { success: false, error: 'YouTube requires a video file' }
      }

      const title = params.content.slice(0, 100)
      const description = params.hashtags?.length
        ? `${params.content}\n\n${params.hashtags.map(h => `#${h}`).join(' ')}`
        : params.content

      // Step 1: Init resumable upload
      const initRes = await fetch(
        `https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${params.accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            snippet: { title, description, tags: params.hashtags || [] },
            status: { privacyStatus: 'public' },
          }),
        },
      )

      if (!initRes.ok) {
        const err = await initRes.text()
        return { success: false, error: `Upload init failed: ${err}` }
      }

      const uploadUrl = initRes.headers.get('location')
      if (!uploadUrl) {
        return { success: false, error: 'No upload URL returned' }
      }

      // Step 2: Upload video binary from URL
      const videoRes = await fetch(params.mediaUrls[0])
      if (!videoRes.ok) {
        return { success: false, error: 'Failed to fetch video from URL' }
      }

      const uploadRes = await fetch(uploadUrl, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${params.accessToken}`,
          'Content-Type': videoRes.headers.get('content-type') || 'video/mp4',
        },
        body: videoRes.body,
      })

      const data = await uploadRes.json()
      if (data.error) return { success: false, error: data.error.message }
      return { success: true, platformPostId: data.id }
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
      const res = await fetch(`${this.baseUrl}/comments?part=snippet`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${params.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          snippet: {
            parentId: params.commentId,
            textOriginal: params.text,
          },
        }),
      })
      const data = await res.json()
      if (data.error) return { success: false, error: data.error.message }
      return { success: true }
    } catch (err) {
      return { success: false, error: String(err) }
    }
  }

  async sendDm() {
    // YouTube does not have a DM API
    return { success: false, error: 'YouTube does not support direct messaging via API' }
  }
}
