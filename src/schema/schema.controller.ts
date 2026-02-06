import { Controller, Get } from '@nestjs/common';
import { SchemaService } from './schema.service';

@Controller('schema')
export class SchemaController {

    constructor(private readonly schemaService: SchemaService) { }

    /**
     * Returns all tables and their columns
     */
    @Get()
    async getSchema() {
        return this.schemaService.loadSchema()
    }
}
