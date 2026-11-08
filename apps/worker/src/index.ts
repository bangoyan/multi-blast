import 'dotenv/config'
import { startPostSchedulerWorker } from './workers/post-scheduler'
import { startWebhookWorker } from './workers/webhook-processor'
import { startDmSenderWorker } from './workers/dm-sender'

console.log('--- MultiBlast Background Worker starting ---')
console.log('REDIS_URL configured:', process.env.REDIS_URL ? 'YES' : 'NO (using fallback localhost:6379)')
console.log('SUPABASE_URL configured:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'YES' : 'NO')
console.log('SUPABASE_SERVICE_ROLE_KEY configured:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'YES' : 'NO')

const postWorker = startPostSchedulerWorker()
const webhookWorker = startWebhookWorker()
const dmWorker = startDmSenderWorker()

postWorker.on('error', (err) => console.error('[PostSchedulerWorker Error]:', err.message))
webhookWorker.on('error', (err) => console.error('[WebhookWorker Error]:', err.message))
dmWorker.on('error', (err) => console.error('[DmWorker Error]:', err.message))

console.log('✓ MultiBlast BullMQ Workers are active and listening to Redis queues.')

const shutdown = async () => {
  console.log('Gracefully shutting down workers...')
  await Promise.all([
    postWorker.close(),
    webhookWorker.close(),
    dmWorker.close(),
  ])
  process.exit(0)
}

process.on('SIGTERM', shutdown)
process.on('SIGINT', shutdown)
