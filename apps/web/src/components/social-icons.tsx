import React from 'react'

export type SocialPlatform = 'instagram' | 'tiktok' | 'facebook' | 'youtube'

export function SocialIcon({
  platform,
  className = 'h-5 w-5',
}: {
  platform: SocialPlatform | string
  className?: string
}) {
  switch (platform.toLowerCase()) {
    case 'instagram':
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
        >
          <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
          <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
        </svg>
      )

    case 'tiktok':
      return (
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          className={className}
        >
          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.29 0 .58.04.86.12V9.42a6.34 6.34 0 0 0-.86-.06 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.75a8.16 8.16 0 0 0 4.65 1.48v-3.48a4.85 4.85 0 0 1-.88-.06z" />
        </svg>
      )

    case 'facebook':
      return (
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          className={className}
        >
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      )

    case 'youtube':
      return (
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          className={className}
        >
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
        </svg>
      )

    default:
      return null
  }
}

export const SOCIAL_META: Record<
  SocialPlatform,
  {
    name: string
    badgeBg: string
    badgeText: string
    iconColor: string
    accentColor: string
    description: string
    placeholderUser: string
    capabilities: string[]
  }
> = {
  instagram: {
    name: 'Instagram',
    badgeBg: 'bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888]',
    badgeText: 'text-white',
    iconColor: '#E1306C',
    accentColor: '#E1306C',
    description: 'Feed Posts, Reels, Carousels, Auto Comments & DM Funnels',
    placeholderUser: '@brand_official',
    capabilities: ['Reels & Feed', 'Auto Comment Reply', 'Keyword DM Trigger'],
  },
  tiktok: {
    name: 'TikTok',
    badgeBg: 'bg-black text-white dark:bg-white dark:text-black',
    badgeText: 'text-white dark:text-black',
    iconColor: '#000000',
    accentColor: '#FE2C55',
    description: 'Short Video Auto-Scheduler & Realtime Comment Triggers',
    placeholderUser: '@tiktok_creator',
    capabilities: ['Video Publishing', 'Comment Webhook', 'Affiliate Bio Link'],
  },
  facebook: {
    name: 'Facebook',
    badgeBg: 'bg-[#1877F2] text-white',
    badgeText: 'text-white',
    iconColor: '#1877F2',
    accentColor: '#1877F2',
    description: 'Pages, Groups, Community Auto-Replies & Messenger DMs',
    placeholderUser: 'facebook.com/yourpage',
    capabilities: ['Page Posts', 'Auto-Reply Comment', 'Messenger Funnel'],
  },
  youtube: {
    name: 'YouTube',
    badgeBg: 'bg-[#FF0000] text-white',
    badgeText: 'text-white',
    iconColor: '#FF0000',
    accentColor: '#FF0000',
    description: 'Shorts & Long-form Videos with Auto Comment Engagement',
    placeholderUser: 'youtube.com/@channel',
    capabilities: ['Shorts Publishing', 'Comment Replies', 'PubSub Hub'],
  },
}
