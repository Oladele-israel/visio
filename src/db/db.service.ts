import { Injectable } from '@nestjs/common'
import { DbConfig } from './db.types'
import { DbDriver } from './db.types'
import { DriverFactory } from './drivers/driver.factory'

@Injectable()
export class DbService {
    private driver: DbDriver

    async connect(config: DbConfig) {
        this.driver = DriverFactory.create(config)
        await this.driver.connect(config) 
    }


    query<T = any>(sql: string, params?: any[]) {
        if (!this.driver) {
            throw new Error('DB not connected')
        }
        return this.driver.query<T>(sql, params)
    }

    getDriver() {
        return this.driver
    }
}
