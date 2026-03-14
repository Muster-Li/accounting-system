// 统计相关 API
import { db, sql } from '../../lib/db';

/**
 * 获取首页统计数据
 */
export async function getHomeStatistics() {
  try {
    const query = `
      SELECT stats_data, calculated_at 
      FROM statistics 
      WHERE stat_scope = 'home' 
      AND stat_type = 'current' 
      AND year = 0 
      AND month IS NULL 
      LIMIT 1
    `;
    
    let result;
    if (sql) {
      // 浏览器环境 - Neon HTTP
      result = await sql(query);
      result = { rows: result };
    } else if (db) {
      // 服务端环境 - Vercel Postgres
      result = await db.execute(query);
    } else {
      throw new Error('Database not initialized');
    }
    
    if (result.rows.length === 0) {
      return null;
    }
    
    return {
      statsData: result.rows[0].stats_data,
      calculatedAt: result.rows[0].calculated_at,
    };
  } catch (error) {
    console.error('Failed to get home statistics:', error);
    throw error;
  }
}

/**
 * 调用存储过程计算首页统计
 */
export async function calculateHomeStatistics() {
  try {
    const query = 'CALL calc_home_stats()';
    
    if (sql) {
      await sql(query);
    } else if (db) {
      await db.execute(query);
    } else {
      throw new Error('Database not initialized');
    }
    
    // 重新查询统计数据
    return await getHomeStatistics();
  } catch (error) {
    console.error('Failed to calculate home statistics:', error);
    throw error;
  }
}
