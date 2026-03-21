-- 存储过程：计算首页统计（永久1条数据，仅执行UPDATE更新）
CREATE OR REPLACE PROCEDURE calc_home_stats()
LANGUAGE plpgsql
AS $$
DECLARE
  v_stat_scope VARCHAR(20) := 'home';
  v_stat_type VARCHAR(20) := 'current';
  v_year INT := 0;
  v_month INT := NULL;
  v_current_date DATE := CURRENT_DATE;
  v_month_start DATE := DATE_TRUNC('month', v_current_date)::DATE;
  v_month_end DATE := (DATE_TRUNC('month', v_current_date) + INTERVAL '1 month - 1 day')::DATE;
  v_year_start DATE := DATE_TRUNC('year', v_current_date)::DATE;
  v_month_days INT := EXTRACT(DAY FROM (v_month_start + INTERVAL '1 month - 1 day'))::INT;
BEGIN
  -- 第一步：首次执行时，自动初始化1条首页统计记录（仅执行1次）
  INSERT INTO statistics (stat_scope, stat_type, year, month, stats_data, calculated_at)
  SELECT 
    v_stat_scope, v_stat_type, v_year, v_month, 
    '{}'::jsonb, CURRENT_TIMESTAMP
  WHERE NOT EXISTS (
    SELECT 1 FROM statistics 
    WHERE stat_scope = v_stat_scope 
      AND stat_type = v_stat_type 
      AND year = v_year 
      AND month IS NULL
  );

  -- 第二步：核心！仅更新这条唯一的记录，永远不新增
  WITH 
  -- 1. 基础收支统计
  base_stats AS (
    SELECT
      COALESCE(SUM(CASE WHEN type = 'income' AND bill_date = v_current_date THEN amount ELSE 0 END), 0) AS today_income,
      COALESCE(SUM(CASE WHEN type = 'expense' AND bill_date = v_current_date THEN amount ELSE 0 END), 0) AS today_expense,
      COALESCE(SUM(CASE WHEN type = 'income' AND bill_date >= v_month_start AND bill_date <= v_month_end THEN amount ELSE 0 END), 0) AS month_income,
      COALESCE(SUM(CASE WHEN type = 'expense' AND bill_date >= v_month_start AND bill_date <= v_month_end THEN amount ELSE 0 END), 0) AS month_expense,
      COALESCE(SUM(CASE WHEN type = 'income' AND bill_date >= v_year_start THEN amount ELSE 0 END), 0) AS year_income,
      COALESCE(SUM(CASE WHEN type = 'expense' AND bill_date >= v_year_start THEN amount ELSE 0 END), 0) AS year_expense
    FROM bills
  ),
  -- 2. 成员本月收支
  member_stats AS (
    SELECT COALESCE(json_agg(row_to_json(m)), '[]'::json) AS data
    FROM (
      SELECT
        m.id, m.name,
        COALESCE(SUM(CASE WHEN b.type = 'income' THEN b.amount ELSE 0 END), 0) AS income,
        COALESCE(SUM(CASE WHEN b.type = 'expense' THEN b.amount ELSE 0 END), 0) AS expense
      FROM members m
      LEFT JOIN bills b ON m.id = b.member_id AND b.bill_date >= v_month_start AND b.bill_date <= v_month_end
      WHERE m.is_active = true
      GROUP BY m.id, m.name
    ) m
  ),
  -- 3. 本月支出分类（按金额降序）
  category_expense AS (
    SELECT COALESCE(json_agg(row_to_json(c)), '[]'::json) AS data
    FROM (
      SELECT
        c.id, c.name, c.icon, c.color,
        COALESCE(SUM(b.amount), 0) AS amount
      FROM categories c
      JOIN bills b ON c.id = b.category_id
      WHERE c.type = 'expense'
        AND b.type = 'expense'
        AND b.bill_date >= v_month_start AND b.bill_date <= v_month_end
      GROUP BY c.id, c.name, c.icon, c.color
      ORDER BY amount DESC
    ) c
  ),
  -- 4. 本月收入分类（按金额降序）
  category_income AS (
    SELECT COALESCE(json_agg(row_to_json(c)), '[]'::json) AS data
    FROM (
      SELECT
        c.id, c.name, c.icon, c.color,
        COALESCE(SUM(b.amount), 0) AS amount
      FROM categories c
      JOIN bills b ON c.id = b.category_id
      WHERE c.type = 'income'
        AND b.type = 'income'
        AND b.bill_date >= v_month_start AND b.bill_date <= v_month_end
      GROUP BY c.id, c.name, c.icon, c.color
      ORDER BY amount DESC
    ) c
  ),
  -- 5. 月度支出折线图
  monthly_trend AS (
    SELECT
      ARRAY(SELECT generate_series(1, v_month_days)) AS day_arr,
      ARRAY(
        SELECT COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0)
        FROM generate_series(1, v_month_days) AS day_num
        LEFT JOIN bills ON bill_date = v_month_start + (day_num - 1) * INTERVAL '1 day'
          AND bill_date <= v_month_end
        GROUP BY day_num
        ORDER BY day_num
      ) AS expense_arr
  )
  -- 执行更新：仅修改唯一的首页统计数据
  UPDATE statistics
  SET 
    stats_data = json_build_object(
      'today', json_build_object('income', bs.today_income, 'expense', bs.today_expense),
      'month', json_build_object('income', bs.month_income, 'expense', bs.month_expense),
      'year', json_build_object('income', bs.year_income, 'expense', bs.year_expense),
      'member_stats', ms.data,
      'category_expense', ce.data,
      'category_income', ci.data,
      'monthly_trend', json_build_object('day', mt.day_arr, 'expense', mt.expense_arr)
    ),
    calculated_at = CURRENT_TIMESTAMP
  FROM base_stats bs, member_stats ms, category_expense ce, category_income ci, monthly_trend mt
  -- 精准定位首页唯一记录，只更新这一条
  WHERE statistics.stat_scope = v_stat_scope 
    AND statistics.stat_type = v_stat_type 
    AND statistics.year = v_year 
    AND statistics.month IS NULL;
END;
$$;