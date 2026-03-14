import { createPool } from '@vercel/postgres';

// Vercel Serverless Function - 统计计算 API
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const pool = createPool({
    connectionString: process.env.POSTGRES_URL,
  });

  try {
    const { type } = req.body;

    if (type === 'home') {
      // 调用存储过程计算首页统计
      await pool.query('CALL calc_home_stats()');

      // 查询计算后的结果
      const result = await pool.query(
        `SELECT stats_data, calculated_at 
         FROM statistics 
         WHERE stat_scope = 'home' 
         AND stat_type = 'current' 
         AND year = 0 
         AND month IS NULL 
         LIMIT 1`
      );

      if (result.rows.length === 0) {
        return res.status(200).json({ success: true, data: null });
      }

      return res.status(200).json({
        success: true,
        data: {
          statsData: result.rows[0].stats_data,
          calculatedAt: result.rows[0].calculated_at,
        },
      });
    }

    return res.status(400).json({ success: false, error: 'Invalid type' });
  } catch (error) {
    console.error('Statistics Calc API Error:', error);
    return res.status(500).json({ success: false, error: error.message });
  } finally {
    await pool.end();
  }
}
