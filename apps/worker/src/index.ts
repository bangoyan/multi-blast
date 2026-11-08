import 'dotenv/config'
import { startPostSchedulerWorker } from './workers/post-scheduler'
import { startWebhookWorker } from './workers/webhook-processor'
import { startDmSenderWorker } from './workers/dm-sender'

console.log('--- MultiBlast Background Worker starting ---')

const postWorker = startPostSchedulerWorker()
const webhookWorker = startWebhookWorker()
const dmWorker = startDmSenderWorker()

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
