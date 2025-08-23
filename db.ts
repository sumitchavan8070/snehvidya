import mysql from 'mysql2/promise'

// Configuration object
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: Number.parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'school_management',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
}

// Single pool instance
let pool: mysql.Pool

// Function to get the pool (create if not exists)
export function getPool(): mysql.Pool {
  if (!pool) {
    pool = mysql.createPool(dbConfig)
  }
  return pool
}

// Function to run a query using the pool
export async function query<T = any>(sql: string, params?: any[]): Promise<T> {
  const conn = getPool()
  try {
    const [results] = await conn.execute(sql, params)
    return results as T
  } catch (error) {
    console.error('Database query error:', error)
    throw error
  }
}

// Optional named export if needed
export const mysqlPool = getPool()

// Default export if you want to import everything as `db`
export default {
  getPool,
  query,
}
