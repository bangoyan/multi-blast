import type { Platform } from '../types'

export interface PublishResult {
  success: boolean
  platformPostId?: string
  error?: string
}

export interface CommentData {
  id: string
  platform: Platform
  postId: string
  userId: string
  username: string
  text: string
  timestamp: string
}

export interface SocialProvider {
  platform: Platform
  publishPost(params: {
    accessToken: string
    content: string
    mediaUrls?: string[]
    hashtags?: string[]
  }): Promise<PublishResult>
  replyToComment(params: {
    accessToken: string
    commentId: string
    text: string
  }): Promise<{ success: boolean; error?: string }>
  sendDm(params: {
    accessToken: string
    recipientId: string
    message: string
  }): Promise<{ success: boolean; error?: string }>
  refreshToken?(refreshToken: string): Promise<{
    accessToken: string
    refreshToken?: string
    expiresAt?: string
  }>
}
