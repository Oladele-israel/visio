import { Module} from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DbModule } from './db/db.module';
import { SchemaModule } from './schema/schema.module';
import { RelationModule } from './relation/relation.module';
import { QueryModule } from './query/query.module';
import { ConfigModule } from '@nestjs/config';
import { RedisCacheModule } from './common/clients/cache/cache.module';

@Module({
  imports: [
    DbModule,
    SchemaModule,
    RelationModule,
    QueryModule,
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    RedisCacheModule,
  ],
  controllers: [AppController],
  providers: [AppService,],
})
export class AppModule {}
