import { createPool } from '@vercel/postgres';

// Vercel Serverless Function - 统计查询 API
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const pool = createPool({
    connectionString: process.env.POSTGRES_URL,
  });

  try {
    const { stat_scope, stat_type, year, month } = req.query;

    let query = 'SELECT stats_data, calculated_at FROM statistics WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    if (stat_scope) {
      query += ` AND stat_scope = $${paramIndex++}`;
      params.push(stat_scope);
    }
    if (stat_type) {
      query += ` AND stat_type = $${paramIndex++}`;
      params.push(stat_type);
    }
    if (year !== undefined && year !== '') {
      query += ` AND year = $${paramIndex++}`;
      params.push(parseInt(year));
    }
    if (month !== undefined && month !== '') {
      query += ` AND month = $${paramIndex++}`;
      params.push(parseInt(month));
    } else {
      query += ' AND month IS NULL';
    }

    query += ' LIMIT 1';

    const result = await pool.query(query, params);

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
  } catch (error) {
    console.error('Statistics API Error:', error);
    return res.status(500).json({ success: false, error: error.message });
  } finally {
    await pool.end();
  }
}
