import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DbModule } from './db/db.module';
import { SchemaModule } from './schema/schema.module';
import { RelationModule } from './relation/relation.module';
import { QueryModule } from './query/query.module';

@Module({
  imports: [DbModule, SchemaModule, RelationModule, QueryModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
