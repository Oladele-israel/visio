import { Controller, Get, Inject } from '@nestjs/common';
import { AppService } from './app.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';

@Controller()
export class AppController {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly appService: AppService
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }


  @Get('cache-set')
  async cacheSet() {
    await this.cacheManager.set('test', 'test', 10000);
    return 'Set Cache';
  }

  @Get('cache-get')
  cacheGet() {
    return this.cacheManager.get('test');
  }
}
