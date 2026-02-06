import { Module } from '@nestjs/common';
import { QueryService } from './query.service';
import { QueryController } from './query.controller';
import { DbModule } from 'src/db/db.module';
import { RelationsService } from 'src/relation/relation.service';

@Module({
  imports:[DbModule],
  providers: [QueryService, RelationsService],
  controllers: [QueryController]
})
export class QueryModule {}
