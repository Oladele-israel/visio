import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';

// TODO: Fix the larget data cache issues

@Injectable()
export class CacheService {
  constructor(@Inject(CACHE_MANAGER) private readonly cacheManager: Cache) {}

async set<T>(key: string, value: T, ttl = 300): Promise<void> {
  // Always stringify objects to ensure Redis stores correctly
  const payload = typeof value === 'object' ? JSON.stringify(value) : value;
  await this.cacheManager.set(key, payload, ttl );
}

async get<T>(key: string): Promise<T | undefined> {
  const cached = await this.cacheManager.get<string>(key);
  if (!cached) return undefined;

  try {
    return JSON.parse(cached) as T;
  } catch {
    return cached as unknown as T;
  }
}
  async del(key: string): Promise<void> {
    await this.cacheManager.del(key);
  }

  async has(key: string): Promise<boolean> {
    const value = await this.cacheManager.get(key);
    return value !== undefined;
  }
}
