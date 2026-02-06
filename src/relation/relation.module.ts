import { Module } from '@nestjs/common';
import { RelationsService } from './relation.service';
import { RelationController } from './relation.controller';
import { DbModule } from 'src/db/db.module';

@Module({
  imports: [DbModule],
  providers: [RelationsService],
  controllers: [RelationController],
  exports: [RelationsService]
})
export class RelationModule {}
