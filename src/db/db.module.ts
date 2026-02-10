import { Module } from '@nestjs/common'
import { DbService } from './db.service'
import { DbController } from './db.controller';
import { RedisModule } from 'src/common/clients/redis/redis.module';
import { RedisSessionStore } from 'src/common/clients/redis/redis-session.store';
import { DbContext } from './db.context';

@Module({
  imports: [RedisModule],
  providers: [DbService, RedisSessionStore, DbContext],
  exports: [DbService, DbContext],
  controllers: [DbController]
})
export class DbModule {}
