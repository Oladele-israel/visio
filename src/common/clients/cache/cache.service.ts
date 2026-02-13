import { Injectable, Inject, Logger } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';

@Injectable()
export class CacheService {
  private readonly logger = new Logger(CacheService.name);

  constructor(
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {}

  async set<T>(key: string, value: T, ttl = 300): Promise<void> {
    await this.cacheManager.set(key, value, ttl);

    this.logger.debug(`Cached key=${key} ttl=${ttl}s`);
  }

  async get<T>(key: string): Promise<T | undefined> {
    const cached = await this.cacheManager.get<T>(key);

    if (!cached) return undefined;

    return cached;
  }

  async del(key: string): Promise<void> {
    await this.cacheManager.del(key);
  }

  async has(key: string): Promise<boolean> {
    const value = await this.cacheManager.get(key);
    return value !== undefined;
  }
}
