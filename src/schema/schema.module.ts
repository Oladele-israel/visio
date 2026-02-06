import { Module } from '@nestjs/common';
import { SchemaService } from './schema.service';
import { DbModule } from 'src/db/db.module';
import { SchemaController } from './schema.controller';

@Module({
  imports: [DbModule],
  providers: [SchemaService],
  exports: [SchemaService],
  controllers: [SchemaController]
})
export class SchemaModule { }
