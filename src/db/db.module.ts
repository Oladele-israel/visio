import { Module } from '@nestjs/common'
import { DbService } from './db.service'
import { DbController } from './db.controller';
import { DbContext } from './db.context';
import { RedisCacheModule } from 'src/common/clients/cache/cache.module';

@Module({
  providers: [DbService, DbContext, RedisCacheModule],
  exports: [DbService, DbContext],
  controllers: [DbController]
})
export class DbModule {}
