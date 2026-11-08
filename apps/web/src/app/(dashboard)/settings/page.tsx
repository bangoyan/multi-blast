'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import {
  Key,
  Shield,
  Globe,
  Copy,
  Check,
  ExternalLink,
  Sparkles,
  AlertCircle,
  HelpCircle,
} from 'lucide-react'
import { SocialIcon, SOCIAL_META, type SocialPlatform } from '@/components/social-icons'

const OAUTH_PORTALS: {
  platform: SocialPlatform
  name: string
  portalName: string
  portalUrl: string
  callbackPath: string
  scopes: string
  envKeys: string[]
}[] = [
  {
    platform: 'instagram',
    name: 'Instagram',
    portalName: 'Meta for Developers (Facebook Login)',
    portalUrl: 'https://developers.facebook.com/apps/',
    callbackPath: '/api/oauth/instagram/callback',
    scopes:
      'instagram_basic, instagram_content_publish, instagram_manage_comments, instagram_manage_messages, pages_show_list, pages_read_engagement',
    envKeys: ['INSTAGRAM_APP_ID', 'INSTAGRAM_APP_SECRET'],
  },
  {
    platform: 'facebook',
    name: 'Facebook',
    portalName: 'Meta for Developers (Pages API)',
    portalUrl: 'https://developers.facebook.com/apps/',
    callbackPath: '/api/oauth/facebook/callback',
    scopes: 'public_profile, pages_show_list, pages_read_engagement, pages_manage_posts, pages_messaging',
    envKeys: ['FACEBOOK_APP_ID', 'FACEBOOK_APP_SECRET'],
  },
  {
    platform: 'tiktok',
    name: 'TikTok',
    portalName: 'TikTok for Developers (Login Kit)',
    portalUrl: 'https://developers.tiktok.com/',
    callbackPath: '/api/oauth/tiktok/callback',
    scopes: 'user.info.basic, video.publish, video.upload',
    envKeys: ['TIKTOK_CLIENT_KEY', 'TIKTOK_CLIENT_SECRET'],
  },
  {
    platform: 'youtube',
    name: 'YouTube',
    portalName: 'Google Cloud Console (YouTube Data API v3)',
    portalUrl: 'https://console.cloud.google.com/apis/credentials',
    callbackPath: '/api/oauth/youtube/callback',
    scopes: 'https://www.googleapis.com/auth/youtube.upload, youtube.readonly, youtube.force-ssl',
    envKeys: ['YOUTUBE_CLIENT_ID', 'YOUTUBE_CLIENT_SECRET'],
  },
]

export default function SettingsPage() {
  const [copiedKey, setCopiedKey] = useState<string | null>(null)
  const baseUrl = 'https://multiblast.bangoyan.web.id'

  function copyToClipboard(text: string, id: string) {
    navigator.clipboard.writeText(text)
    setCopiedKey(id)
    setTimeout(() => setCopiedKey(null), 2000)
  }

  return (
    <div className="space-y-6 pb-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
          Settings &amp; OAuth Setup
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-1 font-medium">
          OAuth 2.0 Redirect URIs, developer portal credentials, and server webhook callbacks.
        </p>
      </div>

      {/* Top 2 Cards: Profile & Webhooks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
        {/* Account Profile Card */}
        <Card className="rounded-[28px] border-gray-200/80 dark:border-white/10 shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#D8F85D] text-black">
                <Shield className="h-4 w-4" />
              </div>
              <div>
                <CardTitle className="text-base font-bold">Tenant Profile</CardTitle>
                <CardDescription className="text-xs">Your MultiBlast tenant instance</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1">
              <Label className="text-xs font-bold text-gray-700 dark:text-gray-300">Default Domain</Label>
              <Input
                value={baseUrl}
                readOnly
                className="bg-gray-50 dark:bg-white/5 font-mono text-xs rounded-xl"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-bold text-gray-700 dark:text-gray-300">Admin Email</Label>
              <Input
                value="admin@multiblast.app"
                readOnly
                className="bg-gray-50 dark:bg-white/5 text-xs rounded-xl"
              />
            </div>
            <div className="pt-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 px-3 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-900/30">
                ● Self-Hosted VPS Cluster Active (Ubuntu 24.04)
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Webhook URLs Card */}
        <Card className="rounded-[28px] border-gray-200/80 dark:border-white/10 shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-100 dark:bg-purple-950/50 text-[#7C4DFF]">
                <Globe className="h-4 w-4" />
              </div>
              <div>
                <CardTitle className="text-base font-bold">Incoming Webhooks</CardTitle>
                <CardDescription className="text-xs">
                  Event listeners for comments &amp; auto-DM triggers
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-[11px] font-bold text-gray-500 uppercase">Instagram / Facebook Webhook</p>
              <div className="flex items-center gap-2 mt-1">
                <Input
                  readOnly
                  value={`${baseUrl}/api/webhooks/instagram`}
                  className="font-mono text-xs rounded-xl bg-gray-50 dark:bg-white/5 select-all"
                />
                <Button
                  size="icon"
                  variant="outline"
                  className="rounded-xl shrink-0"
                  onClick={() =>
                    copyToClipboard(`${baseUrl}/api/webhooks/instagram`, 'wh_meta')
                  }
                >
                  {copiedKey === 'wh_meta' ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div>
              <p className="text-[11px] font-bold text-gray-500 uppercase">TikTok Webhook</p>
              <div className="flex items-center gap-2 mt-1">
                <Input
                  readOnly
                  value={`${baseUrl}/api/webhooks/tiktok`}
                  className="font-mono text-xs rounded-xl bg-gray-50 dark:bg-white/5 select-all"
                />
                <Button
                  size="icon"
                  variant="outline"
                  className="rounded-xl shrink-0"
                  onClick={() =>
                    copyToClipboard(`${baseUrl}/api/webhooks/tiktok`, 'wh_tiktok')
                  }
                >
                  {copiedKey === 'wh_tiktok' ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div>
              <p className="text-[11px] font-bold text-gray-500 uppercase">YouTube PubSub</p>
              <div className="flex items-center gap-2 mt-1">
                <Input
                  readOnly
                  value={`${baseUrl}/api/webhooks/youtube`}
                  className="font-mono text-xs rounded-xl bg-gray-50 dark:bg-white/5 select-all"
                />
                <Button
                  size="icon"
                  variant="outline"
                  className="rounded-xl shrink-0"
                  onClick={() =>
                    copyToClipboard(`${baseUrl}/api/webhooks/youtube`, 'wh_yt')
                  }
                >
                  {copiedKey === 'wh_yt' ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Bento Section: OAuth 2.0 Portals & Callback Configuration */}
      <div className="rounded-[28px] bg-white dark:bg-[#15181E] p-6 border border-gray-200/80 dark:border-white/10 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-gray-100 dark:border-white/5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#D8F85D] text-black shadow-sm">
              <Key className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                OAuth 2.0 Integration Setup (4 Platforms)
              </h2>
              <p className="text-xs text-gray-500 font-medium">
                Copy the Authorized Redirect URIs below to paste into each developer portal.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-6">
          {OAUTH_PORTALS.map(item => {
            const fullCallback = `${baseUrl}${item.callbackPath}`
            const meta = SOCIAL_META[item.platform]

            return (
              <div
                key={item.platform}
                className="rounded-2xl p-5 border border-gray-200/70 dark:border-white/10 bg-gray-50/50 dark:bg-white/5 flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-xl ${meta.badgeBg}`}
                      >
                        <SocialIcon platform={item.platform} className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                          {item.name} OAuth 2.0
                        </h3>
                        <p className="text-[11px] text-gray-500 font-medium">
                          {item.portalName}
                        </p>
                      </div>
                    </div>

                    <a
                      href={item.portalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white px-2.5 py-1 rounded-lg bg-gray-200/70 dark:bg-white/10"
                    >
                      <span>Portal</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>

                  {/* Callback URI */}
                  <div className="mt-4 space-y-1.5">
                    <Label className="text-[11px] font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                      Authorized Redirect URI (Paste into Developer Console)
                    </Label>
                    <div className="flex items-center gap-2">
                      <Input
                        readOnly
                        value={fullCallback}
                        className="font-mono text-xs rounded-xl bg-white dark:bg-card select-all"
                      />
                      <Button
                        size="icon"
                        variant="outline"
                        className="rounded-xl shrink-0"
                        onClick={() => copyToClipboard(fullCallback, `uri_${item.platform}`)}
                      >
                        {copiedKey === `uri_${item.platform}` ? (
                          <Check className="h-4 w-4 text-emerald-600" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Required Scopes */}
                  <div className="mt-3 space-y-1">
                    <Label className="text-[11px] font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                      Required Scopes
                    </Label>
                    <p className="text-[11px] font-mono bg-white dark:bg-card p-2 rounded-xl border border-gray-200/50 dark:border-white/5 text-gray-700 dark:text-gray-300 select-all leading-relaxed">
                      {item.scopes}
                    </p>
                  </div>
                </div>

                {/* Env Keys hint */}
                <div className="pt-3 border-t border-gray-200/60 dark:border-white/5 flex items-center justify-between text-[11px]">
                  <span className="text-gray-500 font-medium">Environment variables:</span>
                  <span className="font-mono font-bold text-gray-700 dark:text-gray-300">
                    {item.envKeys.join(' & ')}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
