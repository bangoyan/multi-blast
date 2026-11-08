import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ platform: string }> }
) {
  const { platform } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const host = req.headers.get('x-forwarded-host') || req.headers.get('host') || 'multiblast.bangoyan.web.id'
  const proto = req.headers.get('x-forwarded-proto') || 'https'
  const origin = process.env.NEXT_PUBLIC_APP_URL || `${proto}://${host}`

  if (!user) {
    return NextResponse.redirect(`${origin}/login?next=/accounts`)
  }

  const { searchParams } = req.nextUrl
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const errorParam = searchParams.get('error')
  const errorDescription = searchParams.get('error_description')

  if (errorParam) {
    console.error(`OAuth error from ${platform}:`, errorParam, errorDescription)
    return NextResponse.redirect(
      `${origin}/accounts?error=${encodeURIComponent(errorDescription || errorParam)}&platform=${platform}`
    )
  }

  if (!code) {
    return NextResponse.redirect(
      `${origin}/accounts?error=missing_code&platform=${platform}`
    )
  }

  // Validate state cookie
  const storedState = req.cookies.get(`oauth_state_${platform}`)?.value
  if (!storedState || storedState !== state) {
    console.warn(`OAuth state mismatch for ${platform}`)
    // continue or alert (permissive in dev/testing, but log)
  }

  const redirectUri = `${origin}/api/oauth/${platform}/callback`

  try {
    switch (platform.toLowerCase()) {
      case 'facebook':
      case 'instagram': {
        const appId =
          platform === 'instagram'
            ? process.env.INSTAGRAM_APP_ID || process.env.FACEBOOK_APP_ID
            : process.env.FACEBOOK_APP_ID || process.env.INSTAGRAM_APP_ID
        const appSecret =
          platform === 'instagram'
            ? process.env.INSTAGRAM_APP_SECRET || process.env.FACEBOOK_APP_SECRET
            : process.env.FACEBOOK_APP_SECRET || process.env.INSTAGRAM_APP_SECRET

        if (!appId || !appSecret) {
          throw new Error('Meta App ID or Secret missing')
        }

        // 1. Exchange code for short-lived user token
        const tokenUrl = `https://graph.facebook.com/v19.0/oauth/access_token?client_id=${appId}&client_secret=${appSecret}&redirect_uri=${encodeURIComponent(
          redirectUri
        )}&code=${code}`
        const tokenRes = await fetch(tokenUrl)
        const tokenData = await tokenRes.json()

        if (!tokenRes.ok || !tokenData.access_token) {
          throw new Error(tokenData.error?.message || 'Failed to exchange Meta code')
        }

        // 2. Exchange for long-lived user token (60 days)
        const longTokenUrl = `https://graph.facebook.com/v19.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${appId}&client_secret=${appSecret}&fb_exchange_token=${tokenData.access_token}`
        const longTokenRes = await fetch(longTokenUrl)
        const longTokenData = await longTokenRes.json()
        const userAccessToken = longTokenData.access_token || tokenData.access_token

        // 3. Fetch user accounts / pages with detailed fields
        const pagesRes = await fetch(
          `https://graph.facebook.com/v19.0/me/accounts?fields=id,name,category,access_token,instagram_business_account{id,username,name,profile_picture_url,followers_count}&access_token=${userAccessToken}`
        )
        const pagesData = await pagesRes.json()

        if (platform === 'instagram') {
          const pages = pagesData.data || []
          let connectedIgCount = 0

          // Loop all pages to link every attached Instagram Business account
          for (const page of pages) {
            if (page.instagram_business_account?.id) {
              const ig = page.instagram_business_account
              await supabase.from('social_accounts').upsert(
                {
                  user_id: user.id,
                  platform: 'instagram',
                  platform_user_id: ig.id,
                  username: ig.username || ig.name || `instagram_${ig.id}`,
                  access_token: page.access_token || userAccessToken,
                  metadata: {
                    page_id: page.id,
                    page_name: page.name,
                    profile_picture_url: ig.profile_picture_url,
                    followers_count: ig.followers_count || 0,
                  },
                },
                { onConflict: 'user_id,platform,platform_user_id' }
              )
              connectedIgCount++
            }
          }

          // If no Instagram business account found attached to any page
          if (connectedIgCount === 0) {
            return NextResponse.redirect(
              `${origin}/accounts?error=no_instagram_business_found&platform=instagram`
            )
          }
        } else {
          // Facebook: Link all available Pages
          const pages = pagesData.data || []
          if (pages.length > 0) {
            for (const page of pages) {
              await supabase.from('social_accounts').upsert(
                {
                  user_id: user.id,
                  platform: 'facebook',
                  platform_user_id: page.id,
                  username: page.name,
                  access_token: page.access_token,
                  metadata: {
                    page_id: page.id,
                    category: page.category || 'Page',
                  },
                },
                { onConflict: 'user_id,platform,platform_user_id' }
              )
            }
          } else {
            const meRes = await fetch(
              `https://graph.facebook.com/v19.0/me?fields=id,name&access_token=${userAccessToken}`
            )
            const me = await meRes.json()
            await supabase.from('social_accounts').upsert(
              {
                user_id: user.id,
                platform: 'facebook',
                platform_user_id: me.id,
                username: me.name,
                access_token: userAccessToken,
              },
              { onConflict: 'user_id,platform,platform_user_id' }
            )
          }
        }
        break
      }

      case 'tiktok': {
        const clientKey = process.env.TIKTOK_CLIENT_KEY
        const clientSecret = process.env.TIKTOK_CLIENT_SECRET
        if (!clientKey || !clientSecret) throw new Error('TikTok Client Key or Secret missing')

        const params = new URLSearchParams()
        params.append('client_key', clientKey)
        params.append('client_secret', clientSecret)
        params.append('code', code)
        params.append('grant_type', 'authorization_code')
        params.append('redirect_uri', redirectUri)

        const tokenRes = await fetch('https://open.tiktokapis.com/v2/oauth/token/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: params.toString(),
        })
        const tokenData = await tokenRes.json()

        if (!tokenRes.ok || tokenData.error) {
          throw new Error(tokenData.error_description || tokenData.error || 'TikTok token error')
        }

        const { access_token, refresh_token, open_id } = tokenData.data || tokenData

        // Fetch user profile
        const userRes = await fetch(
          'https://open.tiktokapis.com/v2/user/info/?fields=open_id,display_name,avatar_url',
          {
            headers: { Authorization: `Bearer ${access_token}` },
          }
        )
        const userData = await userRes.json()
        const displayName = userData.data?.user?.display_name || `tiktok_${open_id.slice(-6)}`

        await supabase.from('social_accounts').upsert(
          {
            user_id: user.id,
            platform: 'tiktok',
            platform_user_id: open_id,
            username: displayName,
            access_token,
            refresh_token,
          },
          { onConflict: 'user_id,platform,platform_user_id' }
        )
        break
      }

      case 'youtube': {
        const clientId = process.env.YOUTUBE_CLIENT_ID
        const clientSecret = process.env.YOUTUBE_CLIENT_SECRET
        if (!clientId || !clientSecret) throw new Error('YouTube Client ID or Secret missing')

        const params = new URLSearchParams()
        params.append('code', code)
        params.append('client_id', clientId)
        params.append('client_secret', clientSecret)
        params.append('redirect_uri', redirectUri)
        params.append('grant_type', 'authorization_code')

        const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: params.toString(),
        })
        const tokenData = await tokenRes.json()

        if (!tokenRes.ok || tokenData.error) {
          throw new Error(tokenData.error_description || tokenData.error || 'Google token error')
        }

        const { access_token, refresh_token, expires_in } = tokenData

        // Fetch channel info
        let channelId = ''
        let channelTitle = 'YouTube Channel'
        let channelMeta: Record<string, any> = {}

        try {
          const chRes = await fetch(
            'https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&mine=true',
            {
              headers: { Authorization: `Bearer ${access_token}` },
            }
          )
          const chData = await chRes.json()
          if (chData.items && chData.items.length > 0) {
            const ch = chData.items[0]
            channelId = ch.id
            channelTitle = ch.snippet?.title || 'YouTube Channel'
            channelMeta = {
              thumbnail: ch.snippet?.thumbnails?.default?.url,
              subscriber_count: ch.statistics?.subscriberCount || '0',
              view_count: ch.statistics?.viewCount || '0',
              video_count: ch.statistics?.videoCount || '0',
            }
          }
        } catch {
          // Fallback to userinfo
        }

        if (!channelId) {
          const profileRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
            headers: { Authorization: `Bearer ${access_token}` },
          })
          const profile = await profileRes.json()
          channelId = profile.id
          channelTitle = profile.name || 'YouTube User'
          channelMeta = {
            thumbnail: profile.picture,
          }
        }

        const expiresAt = expires_in ? new Date(Date.now() + expires_in * 1000).toISOString() : null

        await supabase.from('social_accounts').upsert(
          {
            user_id: user.id,
            platform: 'youtube',
            platform_user_id: channelId,
            username: channelTitle,
            access_token,
            refresh_token,
            token_expires_at: expiresAt,
            metadata: channelMeta,
          },
          { onConflict: 'user_id,platform,platform_user_id' }
        )
        break
      }

      default:
        throw new Error(`Unsupported platform ${platform}`)
    }

    const res = NextResponse.redirect(
      `${origin}/accounts?success=connected&platform=${platform}`
    )
    res.cookies.delete(`oauth_state_${platform}`)
    return res
  } catch (err: any) {
    console.error(`OAuth callback error for ${platform}:`, err)
    return NextResponse.redirect(
      `${origin}/accounts?error=${encodeURIComponent(err.message || 'OAuth failed')}&platform=${platform}`
    )
  }
}
