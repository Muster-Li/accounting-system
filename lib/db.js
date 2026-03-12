import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from '../db/schema.js';

// ========== 环境检测 ==========
const isServer = typeof window === 'undefined';

// ========== 数据库连接 ==========
export let db = null;
export let sql = null;

// 开发环境：浏览器直连数据库
if (!isServer) {
  // 获取数据库URL（Vite 环境变量必须以 VITE_ 开头）
  const databaseUrl = import.meta.env.VITE_DATABASE_URL;

  console.log('[DB] Checking database configuration...');
  console.log('[DB] VITE_DATABASE_URL exists:', !!databaseUrl);

  if (databaseUrl) {
    try {
      // 创建 Neon HTTP 客户端
      sql = neon(databaseUrl);
      db = drizzle(sql, { schema });
      console.log('✅ [DB] Dev mode: Browser connected to database');
    } catch (error) {
      console.error('❌ [DB] Failed to connect:', error.message);
      db = null;
      sql = null;
    }
  } else {
    console.warn('⚠️ [DB] VITE_DATABASE_URL not found in .env');
    console.log('[DB] Available env vars:', Object.keys(import.meta.env));
  }
} else {
  console.log('[DB] Server environment - db will be null (use API routes)');
}

// ========== 检查连接 ==========
export async function checkConnection() {
  if (!db || !sql) {
    console.log('🔵 [DB] Using API routes (production mode)');
    return false;
  }

  try {
    const result = await sql`SELECT NOW()`;
    console.log('✅ [DB] Database connected:', result[0].now);
    return true;
  } catch (error) {
    console.error('❌ [DB] Connection failed:', error.message);
    throw error;
  }
}
