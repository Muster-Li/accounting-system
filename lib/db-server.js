// 服务端数据库连接（用于 Vercel Serverless Functions）
import { drizzle } from 'drizzle-orm/vercel-postgres';
import { createPool } from '@vercel/postgres';
import * as schema from '../db/schema.js';

// 服务端使用连接池
const pool = createPool({
  connectionString: process.env.POSTGRES_URL,
});

export const db = drizzle(pool, { schema });
