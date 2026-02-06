import { Injectable } from '@nestjs/common'
import { DbConfig } from './db.types'
import { DbDriver } from './db.types'
import { DriverFactory } from './drivers/driver.factory'

@Injectable()
export class DbService {
    private driver: DbDriver

    /**
1️⃣ Client sends DB config to backend
2️⃣ Backend securely stores encrypted config
3️⃣ Backend asks agent to connect using that config
4️⃣ Agent connects to DB and validates
5️⃣ Agent returns a connectionToken (sessionId)
6️⃣ Backend stores token ↔ config mapping
7️⃣ All future requests use connectionToken

     * 
     */

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
