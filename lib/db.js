import { drizzle as drizzleNeon } from 'drizzle-orm/neon-http';
import { drizzle as drizzleVercel } from 'drizzle-orm/vercel-postgres';
import { neon } from '@neondatabase/serverless';
import { createPool } from '@vercel/postgres';
import * as schema from '../db/schema.js';

// ========== 环境检测 ==========
const isServer = typeof window === 'undefined';

// ========== 数据库连接 ==========
export let db = null;
export let sql = null;

// 服务端环境（Vercel Serverless）：使用连接池
if (isServer) {
  try {
    const pool = createPool({
      connectionString: process.env.POSTGRES_URL,
    });
    db = drizzleVercel(pool, { schema });
    console.log('✅ [DB] Server mode: Using Vercel Postgres pool');
  } catch (error) {
    console.error('❌ [DB] Server connection failed:', error.message);
    db = null;
  }
} else {
  // 客户端环境（浏览器开发）：使用 Neon HTTP
  const databaseUrl = import.meta.env.VITE_DATABASE_URL;

  if (databaseUrl) {
    try {
      sql = neon(databaseUrl);
      db = drizzleNeon(sql, { schema });
      console.log('✅ [DB] Dev mode: Browser connected via Neon HTTP');
    } catch (error) {
      console.error('❌ [DB] Dev connection failed:', error.message);
      db = null;
      sql = null;
    }
  } else {
    console.warn('⚠️ [DB] VITE_DATABASE_URL not found in .env');
  }
}

// ========== 检查连接 ==========
export async function checkConnection() {
  if (!db && !sql) {
    console.log('🔵 [DB] Database not initialized');
    return false;
  }

  try {
    if (sql) {
      // 客户端模式：使用 neon sql 检查
      const result = await sql`SELECT NOW()`;
      console.log('✅ [DB] Database connected:', result[0].now);
    } else {
      // 服务端模式：使用 drizzle 查询检查
      const result = await db.execute(`SELECT NOW()`);
      console.log('✅ [DB] Database connected:', result.rows[0].now);
    }
    return true;
  } catch (error) {
    console.error('❌ [DB] Connection failed:', error.message);
    throw error;
  }
}
