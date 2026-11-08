import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import crypto from 'crypto'

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

  // Generate random state for CSRF protection
  const state = crypto.randomBytes(16).toString('hex')
  const redirectUri = `${origin}/api/oauth/${platform}/callback`

  let authUrl = ''

  switch (platform.toLowerCase()) {
    case 'facebook': {
      const appId = process.env.FACEBOOK_APP_ID || process.env.INSTAGRAM_APP_ID
      if (!appId) {
        return NextResponse.redirect(
          `${origin}/accounts?error=missing_keys&platform=facebook`
        )
      }
      const scopes = [
        'public_profile',
        'pages_show_list',
        'pages_manage_posts',
        'pages_messaging',
      ].join(',')
      authUrl = `https://www.facebook.com/v19.0/dialog/oauth?client_id=${appId}&redirect_uri=${encodeURIComponent(
        redirectUri
      )}&scope=${encodeURIComponent(scopes)}&state=${state}&response_type=code&auth_type=rerequest`
      break
    }

    case 'instagram': {
      // Instagram Graph API via Meta Facebook Login
      const appId = process.env.INSTAGRAM_APP_ID || process.env.FACEBOOK_APP_ID
      if (!appId) {
        return NextResponse.redirect(
          `${origin}/accounts?error=missing_keys&platform=instagram`
        )
      }
      const scopes = [
        'instagram_basic',
        'instagram_content_publish',
        'instagram_manage_comments',
        'instagram_manage_messages',
        'pages_show_list',
      ].join(',')
      authUrl = `https://www.facebook.com/v19.0/dialog/oauth?client_id=${appId}&redirect_uri=${encodeURIComponent(
        redirectUri
      )}&scope=${encodeURIComponent(scopes)}&state=${state}&response_type=code&auth_type=rerequest`
      break
    }

    case 'tiktok': {
      const clientKey = process.env.TIKTOK_CLIENT_KEY
      if (!clientKey) {
        return NextResponse.redirect(
          `${origin}/accounts?error=missing_keys&platform=tiktok`
        )
      }
      const scopes = 'user.info.basic,video.publish,video.upload'
      authUrl = `https://www.tiktok.com/v2/auth/authorize/?client_key=${clientKey}&scope=${encodeURIComponent(
        scopes
      )}&response_type=code&redirect_uri=${encodeURIComponent(
        redirectUri
      )}&state=${state}`
      break
    }

    case 'youtube': {
      const clientId = process.env.YOUTUBE_CLIENT_ID
      if (!clientId) {
        return NextResponse.redirect(
          `${origin}/accounts?error=missing_keys&platform=youtube`
        )
      }
      const scopes = [
        'https://www.googleapis.com/auth/youtube.upload',
        'https://www.googleapis.com/auth/youtube.readonly',
        'https://www.googleapis.com/auth/youtube.force-ssl',
        'https://www.googleapis.com/auth/userinfo.profile',
      ].join(' ')
      authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(
        redirectUri
      )}&response_type=code&scope=${encodeURIComponent(
        scopes
      )}&access_type=offline&prompt=select_account%20consent&state=${state}`
      break
    }

    default:
      return NextResponse.redirect(`${origin}/accounts?error=invalid_platform`)
  }

  const response = NextResponse.redirect(authUrl)
  // Store state in httpOnly cookie for validation
  response.cookies.set(`oauth_state_${platform}`, state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 10, // 10 minutes
    path: '/',
  })

  return response
}
