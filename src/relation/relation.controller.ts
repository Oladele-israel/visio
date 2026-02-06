import { Controller, Get, Param } from '@nestjs/common';
import { RelationsService } from './relation.service';

@Controller('relation')
export class RelationController {

    constructor(private readonly relations: RelationsService) {}
    
    @Get(':table')
    async getRelations(@Param('table') table: string) {
        return this.relations.getRelations(table)
    }
}
