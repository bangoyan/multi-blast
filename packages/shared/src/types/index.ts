export type Platform = 'instagram' | 'tiktok' | 'facebook' | 'youtube'

export type PostStatus = 'draft' | 'scheduled' | 'publishing' | 'published' | 'failed'

export type CommentReplyMode = 'ai_persona' | 'keyword_triggered'

export interface User {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export interface SocialAccount {
  id: string
  user_id: string
  platform: Platform
  platform_user_id: string
  username: string
  access_token: string
  refresh_token: string | null
  token_expires_at: string | null
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface Post {
  id: string
  user_id: string
  content: string
  media_urls: string[]
  platforms: Platform[]
  status: PostStatus
  ai_adapted_content: Record<Platform, string> | null
  hashtags: Record<Platform, string[]> | null
  created_at: string
  updated_at: string
}

export interface Schedule {
  id: string
  post_id: string
  user_id: string
  platform: Platform
  social_account_id: string
  scheduled_at: string
  published_at: string | null
  status: PostStatus
  platform_post_id: string | null
  error_message: string | null
  created_at: string
}

export interface CommentRule {
  id: string
  user_id: string
  social_account_id: string
  name: string
  mode: CommentReplyMode
  is_active: boolean
  // ai_persona mode
  persona_prompt: string | null
  persona_style: string | null
  // keyword_triggered mode
  keywords: string[] | null
  reply_template: string | null
  created_at: string
  updated_at: string
}

export interface DmTrigger {
  id: string
  user_id: string
  social_account_id: string
  name: string
  is_active: boolean
  trigger_keywords: string[]
  dm_message_template: string
  affiliate_url: string | null
  lynk_id_url: string | null
  campaign_name: string | null
  created_at: string
  updated_at: string
}

export interface DmLog {
  id: string
  dm_trigger_id: string
  user_id: string
  platform: Platform
  recipient_platform_id: string
  recipient_username: string | null
  message_sent: string
  url_sent: string | null
  sent_at: string
  status: 'sent' | 'failed' | 'pending'
  error_message: string | null
}

export interface ActivityLog {
  id: string
  user_id: string
  action: string
  entity_type: string
  entity_id: string | null
  metadata: Record<string, unknown> | null
  created_at: string
}
