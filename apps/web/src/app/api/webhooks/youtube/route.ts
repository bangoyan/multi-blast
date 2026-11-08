import { NextRequest, NextResponse } from 'next/server'
import { createQueue, QUEUE_NAMES } from '@multiblast/shared'

// YouTube PubSubHubbub push notifications for comments
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const challenge = searchParams.get('hub.challenge')
  if (challenge) return new NextResponse(challenge, { status: 200 })
  return NextResponse.json({ error: 'No challenge' }, { status: 400 })
}

export async function POST(req: NextRequest) {
  const body = await req.text()
  const queue = createQueue(QUEUE_NAMES.WEBHOOK_PROCESSOR)

  // YouTube sends Atom XML for comment notifications
  // shortcut: basic XML extraction, upgrade to proper parser for production
  const commentMatch = body.match(/<yt:commentId>([^<]+)</)
  const textMatch = body.match(/<content[^>]*>([^<]+)</)
  const authorMatch = body.match(/<name>([^<]+)</)
  const videoMatch = body.match(/<yt:videoId>([^<]+)</)

  if (commentMatch && textMatch) {
    await queue.add('process', {
      platform: 'youtube',
      event: 'comment',
      data: {
        commentId: commentMatch[1],
        postId: videoMatch?.[1],
        text: textMatch[1],
        username: authorMatch?.[1],
        userId: null,
      },
    })
  }

  return NextResponse.json({ received: true })
}
