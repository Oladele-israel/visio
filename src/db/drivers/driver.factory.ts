import { DbConfig } from '../db.types'
import { DbDriver } from '../db.types'
import { PostgresDriver } from './postgres.driver'
// import { MySqlDriver } from './mysql.driver'

export class DriverFactory {
  static create(config: DbConfig): DbDriver {
    switch (config.type) {
      case 'postgres':
        return new PostgresDriver()
    //   case 'mysql':
    //     return new MySqlDriver()
      default:
        throw new Error(`Unsupported DB type: ${config.type}`)
    }
  }
}
