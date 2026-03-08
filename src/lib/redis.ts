import { Redis } from '@upstash/redis';

const url = process.env.UPSTASH_REDIS_REST_URL || 'http://localhost';
const token = process.env.UPSTASH_REDIS_REST_TOKEN || 'local-dev-token';

export const redis = new Redis({ url, token });

export const isRedisConfigured =
  !!process.env.UPSTASH_REDIS_REST_URL && !!process.env.UPSTASH_REDIS_REST_TOKEN;
