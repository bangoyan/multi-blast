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

        // 3. Fetch user accounts / pages
        const pagesRes = await fetch(
          `https://graph.facebook.com/v19.0/me/accounts?fields=id,name,access_token,instagram_business_account{id,username,name}&access_token=${userAccessToken}`
        )
        const pagesData = await pagesRes.json()

        if (platform === 'instagram') {
          // Look for Instagram business account attached to pages
          const pageWithIg = pagesData.data?.find(
            (p: any) => p.instagram_business_account?.id
          )

          if (!pageWithIg) {
            // If no business account attached, save user account as fallback
            const meRes = await fetch(
              `https://graph.facebook.com/v19.0/me?fields=id,name&access_token=${userAccessToken}`
            )
            const me = await meRes.json()
            await supabase.from('social_accounts').upsert(
              {
                user_id: user.id,
                platform: 'instagram',
                platform_user_id: me.id,
                username: me.name?.replace(/\s+/g, '_').toLowerCase() || 'instagram_user',
                access_token: userAccessToken,
              },
              { onConflict: 'user_id,platform,platform_user_id' }
            )
          } else {
            const ig = pageWithIg.instagram_business_account
            await supabase.from('social_accounts').upsert(
              {
                user_id: user.id,
                platform: 'instagram',
                platform_user_id: ig.id,
                username: ig.username || ig.name,
                access_token: pageWithIg.access_token, // Page token has posting permissions
              },
              { onConflict: 'user_id,platform,platform_user_id' }
            )
          }
        } else {
          // Facebook: use primary page or user profile
          const primaryPage = pagesData.data?.[0]
          if (primaryPage) {
            await supabase.from('social_accounts').upsert(
              {
                user_id: user.id,
                platform: 'facebook',
                platform_user_id: primaryPage.id,
                username: primaryPage.name,
                access_token: primaryPage.access_token,
              },
              { onConflict: 'user_id,platform,platform_user_id' }
            )
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

        try {
          const chRes = await fetch(
            'https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true',
            {
              headers: { Authorization: `Bearer ${access_token}` },
            }
          )
          const chData = await chRes.json()
          if (chData.items && chData.items.length > 0) {
            channelId = chData.items[0].id
            channelTitle = chData.items[0].snippet?.title || 'YouTube Channel'
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
