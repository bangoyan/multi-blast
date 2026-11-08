import { Queue, Worker, type Job } from 'bullmq'
import IORedis from 'ioredis'

export function createRedisConnection(): IORedis {
  const url = process.env.REDIS_URL || 'redis://localhost:6379'
  const isTls = url.startsWith('rediss://')
  return new IORedis(url, {
    maxRetriesPerRequest: null,
    ...(isTls ? { tls: { rejectUnauthorized: false } } : {}),
  })
}

// Queue names
export const QUEUE_NAMES = {
  POST_SCHEDULER: 'post-scheduler',
  WEBHOOK_PROCESSOR: 'webhook-processor',
  DM_SENDER: 'dm-sender',
  COMMENT_REPLIER: 'comment-replier',
} as const

export function createQueue(name: string) {
  return new Queue(name, { connection: createRedisConnection() })
}

export function createWorker<T>(
  name: string,
  processor: (job: Job<T>) => Promise<void>,
) {
  return new Worker<T>(name, processor, {
    connection: createRedisConnection(),
    concurrency: 5,
  })
}
