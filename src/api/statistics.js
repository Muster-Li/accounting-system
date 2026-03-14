// 统计相关 API
import { db, sql } from '../../lib/db';

// API 基础 URL
const API_BASE_URL = '';

// 检查是否在浏览器生产环境（没有直接数据库连接）
const isBrowserProduction = typeof window !== 'undefined' && !db && !sql;

/**
 * 浏览器环境调用 HTTP API
 */
async function fetchAPI(endpoint, options = {}) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `API request failed: ${response.status}`);
  }
  
  const result = await response.json();
  return result.data || result;
}

/**
 * 获取首页统计数据
 */
export async function getHomeStatistics() {
  try {
    // 浏览器生产环境：调用 HTTP API
    if (isBrowserProduction) {
      return await fetchAPI('/api/statistics?stat_scope=home&stat_type=current&year=0');
    }
    
    // 本地开发环境：直接查询数据库
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
      result = await sql(query);
      result = { rows: result };
    } else if (db) {
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
    // 浏览器生产环境：调用 HTTP API
    if (isBrowserProduction) {
      return await fetchAPI('/api/statistics-calc', {
        method: 'POST',
        body: JSON.stringify({ type: 'home' }),
      });
    }
    
    // 本地开发环境：直接调用存储过程
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
