import { Injectable } from '@nestjs/common'
import { RedisProvider } from '../redis/redis.provider'
import { SessionStore } from './types'

@Injectable()
export class RedisSessionStore<T> implements SessionStore<T> {
  constructor(private readonly redis: RedisProvider) {}

  async save(key: string, value: T, ttlSeconds: number) {
    const client = this.redis.getClient()
    await client.set(key, JSON.stringify(value), 'EX', ttlSeconds)
  }

  async get(key: string): Promise<T | null> {
    const client = this.redis.getClient()
    const raw = await client.get(key)
    return raw ? (JSON.parse(raw) as T) : null
  }

  async delete(key: string) {
    const client = this.redis.getClient()
    await client.del(key)
  }
}
