import { Module, Global } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-yet';
import { CacheService } from './cache.service';

@Global()
@Module({
  imports: [
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: async () => {
        const store = await redisStore({
          socket: {
            host: process.env.REDIS_HOST || 'localhost',
            port: Number(process.env.REDIS_PORT) || 6379,
          },
          password: process.env.REDIS_PASSWORD || undefined,
          ttl: 0, 
        });

        return {
          store,
          max: 1000, 
        };
      },
    }),
  ],
  providers: [CacheService],
  exports: [CacheService]
})
export class RedisCacheModule {}
