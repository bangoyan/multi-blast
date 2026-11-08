import { NextRequest, NextResponse } from 'next/server'
import { createQueue, QUEUE_NAMES } from '@multiblast/shared'

// Instagram webhook verification & events
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const mode = searchParams.get('hub.mode')
  const token = searchParams.get('hub.verify_token')
  const challenge = searchParams.get('hub.challenge')

  if (mode === 'subscribe' && token === process.env.INSTAGRAM_WEBHOOK_VERIFY_TOKEN) {
    return new NextResponse(challenge, { status: 200 })
  }
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const queue = createQueue(QUEUE_NAMES.WEBHOOK_PROCESSOR)

  // Instagram sends comment events in this format
  if (body.entry) {
    for (const entry of body.entry) {
      for (const change of entry.changes || []) {
        if (change.field === 'comments') {
          await queue.add('process', {
            platform: 'instagram',
            event: 'comment',
            data: {
              commentId: change.value.id,
              postId: change.value.media?.id,
              text: change.value.text,
              username: change.value.from?.username,
              userId: change.value.from?.id,
            },
          })
        }
      }
    }
  }

  return NextResponse.json({ received: true })
}
