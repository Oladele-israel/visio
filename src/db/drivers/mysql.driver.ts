// // import mysql from 'mysql2/promise'
// // import { DbDriver } from './db-driver.interface'
// import { DbConfig } from '../db.types'

// export class MySqlDriver implements DbDriver {
//   private pool: mysql.Pool

//   async connect(config: DbConfig) {
//     this.pool = mysql.createPool({
//       host: config.host,
//       port: config.port,
//       database: config.database,
//       user: config.user,
//       password: config.password,
//       connectionLimit: 5
//     })
//   }

//   getPool() {
//     return this.pool
//   }

//   async query<T = any>(sql: string, params: any[] = []): Promise<T[]> {
//     const [rows] = await this.pool.query(sql, params)
//     return rows as T[]
//   }

//   async close() {
//     await this.pool?.end()
//   }
// }
