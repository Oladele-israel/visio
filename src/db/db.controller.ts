import { Body, Controller, Post } from '@nestjs/common';
import { DbService } from './db.service';
import type { DbConfig } from './db.types';

@Controller('db')
export class DbController {

    constructor(private readonly dbService: DbService){ }

@Post('connect') 
async connect(@Body() config: DbConfig) { 
    await this.dbService.connect(config) 
    return { status: 'connected' } }
}
