import { NextRequest, NextResponse } from 'next/server'
import { createQueue, QUEUE_NAMES } from '@multiblast/shared'

// Facebook webhook verification & events (same as Instagram, shared Graph API)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const mode = searchParams.get('hub.mode')
  const token = searchParams.get('hub.verify_token')
  const challenge = searchParams.get('hub.challenge')

  if (mode === 'subscribe' && token === process.env.FACEBOOK_WEBHOOK_VERIFY_TOKEN) {
    return new NextResponse(challenge, { status: 200 })
  }
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const queue = createQueue(QUEUE_NAMES.WEBHOOK_PROCESSOR)

  if (body.entry) {
    for (const entry of body.entry) {
      for (const change of entry.changes || []) {
        if (change.field === 'feed' && change.value?.item === 'comment') {
          await queue.add('process', {
            platform: 'facebook',
            event: 'comment',
            data: {
              commentId: change.value.comment_id,
              postId: change.value.post_id,
              text: change.value.message,
              username: change.value.sender_name,
              userId: change.value.sender_id,
            },
          })
        }
      }
    }
  }

  return NextResponse.json({ received: true })
}
