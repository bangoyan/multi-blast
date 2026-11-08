import type { Platform } from '@multiblast/shared'
import type { SocialProvider } from './types'
import { InstagramProvider } from './instagram'
import { FacebookProvider } from './facebook'
import { TikTokProvider } from './tiktok'
import { YouTubeProvider } from './youtube'

const providers: Record<Platform, SocialProvider> = {
  instagram: new InstagramProvider(),
  facebook: new FacebookProvider(),
  tiktok: new TikTokProvider(),
  youtube: new YouTubeProvider(),
}

export function getProvider(platform: Platform): SocialProvider {
  return providers[platform]
}

export type { SocialProvider, PublishResult, CommentData } from './types'
