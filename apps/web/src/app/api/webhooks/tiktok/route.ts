import { NextRequest, NextResponse } from 'next/server'
import { createQueue, QUEUE_NAMES } from '@multiblast/shared'

// TikTok webhook events
export async function POST(req: NextRequest) {
  const body = await req.json()
  const queue = createQueue(QUEUE_NAMES.WEBHOOK_PROCESSOR)

  // TikTok sends events with event type
  if (body.event === 'comment.create') {
    await queue.add('process', {
      platform: 'tiktok',
      event: 'comment',
      data: {
        commentId: body.comment_id,
        postId: body.video_id,
        text: body.text,
        username: body.user?.display_name,
        userId: body.user?.open_id,
      },
    })
  }

  return NextResponse.json({ received: true })
}
