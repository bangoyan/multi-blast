import { startPostSchedulerWorker } from './post-scheduler'
import { startWebhookWorker } from './webhook-processor'
import { startDmSenderWorker } from './dm-sender'

export function startAllWorkers() {
  const postWorker = startPostSchedulerWorker()
  const webhookWorker = startWebhookWorker()
  const dmWorker = startDmSenderWorker()

  console.log('All BullMQ workers started')

  return { postWorker, webhookWorker, dmWorker }
}
