-- 存储过程：计算指定年月的分类支出统计（一级分类和二级分类）
-- 入参：年份和月份
-- 统计该月份的一级分类和二级分类支出，按金额倒序排列
CREATE OR REPLACE PROCEDURE calc_monthly_category_stats(p_year INT, p_month INT)
LANGUAGE plpgsql
AS $$
DECLARE
  v_stat_scope VARCHAR(20) := 'report';
  v_stat_type VARCHAR(20) := 'monthly';
  v_month_start DATE := make_date(p_year, p_month, 1);
  v_month_end DATE := (v_month_start + INTERVAL '1 month - 1 day')::DATE;
BEGIN
  -- 第一步：确保该年月的统计记录存在（不存在则插入，存在则跳过）
  INSERT INTO statistics (stat_scope, stat_type, year, month, stats_data, calculated_at)
  SELECT
    v_stat_scope, v_stat_type, p_year, p_month,
    '{}'::jsonb, CURRENT_TIMESTAMP
  WHERE NOT EXISTS (
    SELECT 1 FROM statistics
    WHERE stat_scope = v_stat_scope
      AND stat_type = v_stat_type
      AND year = p_year
      AND month = p_month
  );

  -- 第二步：计算一级分类支出统计（按金额倒序）
  WITH
  -- 1. 一级分类支出统计
  primary_category_stats AS (
    SELECT COALESCE(json_agg(row_to_json(c)), '[]'::json) AS data
    FROM (
      SELECT
        c.id,
        c.name,
        c.icon,
        c.color,
        COALESCE(SUM(b.amount), 0) AS amount
      FROM categories c
      LEFT JOIN bills b ON c.id = b.category_id
        AND b.type = 'expense'
        AND b.bill_date >= v_month_start
        AND b.bill_date <= v_month_end
      WHERE c.type = 'expense'
        AND (c.parent_id IS NULL OR c.parent_id = 0)
      GROUP BY c.id, c.name, c.icon, c.color
      HAVING COALESCE(SUM(b.amount), 0) > 0
      ORDER BY amount DESC
    ) c
  ),
  -- 2. 二级分类支出统计（按金额倒序，包含所属一级分类信息）
  sub_category_stats AS (
    SELECT COALESCE(json_agg(row_to_json(sc)), '[]'::json) AS data
    FROM (
      SELECT
        c.id,
        c.name,
        c.icon,
        c.color,
        c.parent_id AS parentId,
        pc.name AS parentName,
        COALESCE(SUM(b.amount), 0) AS amount
      FROM categories c
      JOIN categories pc ON c.parent_id = pc.id
      LEFT JOIN bills b ON c.id = b.sub_category_id
        AND b.type = 'expense'
        AND b.bill_date >= v_month_start
        AND b.bill_date <= v_month_end
      WHERE c.type = 'expense'
        AND c.parent_id IS NOT NULL
        AND c.parent_id > 0
      GROUP BY c.id, c.name, c.icon, c.color, c.parent_id, pc.name
      HAVING COALESCE(SUM(b.amount), 0) > 0
      ORDER BY amount DESC
    ) sc
  ),
  -- 3. 汇总统计
  summary_stats AS (
    SELECT
      COALESCE(SUM(CASE WHEN b.type = 'expense' THEN b.amount ELSE 0 END), 0) AS total_expense,
      COALESCE(SUM(CASE WHEN b.type = 'income' THEN b.amount ELSE 0 END), 0) AS total_income,
      COUNT(*) FILTER (WHERE b.type = 'expense') AS expense_count
    FROM bills b
    WHERE b.bill_date >= v_month_start
      AND b.bill_date <= v_month_end
  ),
  -- 4. 月度支出趋势（按天统计，用于折线图）
  daily_trend AS (
    SELECT
      ARRAY(
        SELECT generate_series(1, EXTRACT(DAY FROM v_month_end)::INT)
      ) AS days,
      ARRAY(
        SELECT COALESCE(SUM(amount), 0)
        FROM generate_series(1, EXTRACT(DAY FROM v_month_end)::INT) AS day_num
        LEFT JOIN bills ON bill_date = v_month_start + (day_num - 1) * INTERVAL '1 day'
          AND type = 'expense'
        GROUP BY day_num
        ORDER BY day_num
      ) AS amounts
  )
  -- 执行更新或插入
  UPDATE statistics
  SET
    stats_data = json_build_object(
      'year', p_year,
      'month', p_month,
      'month_start', v_month_start,
      'month_end', v_month_end,
      'summary', json_build_object(
        'totalExpense', ss.total_expense,
        'totalIncome', ss.total_income,
        'expenseCount', ss.expense_count
      ),
      'primaryCategories', pcs.data,
      'subCategories', scs.data,
      'dailyTrend', json_build_object(
        'days', dt.days,
        'amounts', dt.amounts
      )
    ),
    calculated_at = CURRENT_TIMESTAMP
  FROM primary_category_stats pcs, sub_category_stats scs, summary_stats ss, daily_trend dt
  WHERE statistics.stat_scope = v_stat_scope
    AND statistics.stat_type = v_stat_type
    AND statistics.year = p_year
    AND statistics.month = p_month;

  -- 如果没有更新任何记录（即记录不存在），则插入新记录
  IF NOT FOUND THEN
    INSERT INTO statistics (stat_scope, stat_type, year, month, stats_data, calculated_at)
    SELECT
      v_stat_scope,
      v_stat_type,
      p_year,
      p_month,
      json_build_object(
        'year', p_year,
        'month', p_month,
        'month_start', v_month_start,
        'month_end', v_month_end,
        'summary', json_build_object(
          'totalExpense', COALESCE(SUM(CASE WHEN b.type = 'expense' THEN b.amount ELSE 0 END), 0),
          'totalIncome', COALESCE(SUM(CASE WHEN b.type = 'income' THEN b.amount ELSE 0 END), 0),
          'expenseCount', COUNT(*) FILTER (WHERE b.type = 'expense')
        ),
        'primaryCategories', (SELECT data FROM primary_category_stats),
        'subCategories', (SELECT data FROM sub_category_stats),
        'dailyTrend', json_build_object(
          'days', (SELECT days FROM daily_trend),
          'amounts', (SELECT amounts FROM daily_trend)
        )
      ),
      CURRENT_TIMESTAMP
    FROM bills b
    WHERE b.bill_date >= v_month_start
      AND b.bill_date <= v_month_end;
  END IF;

END;
$$;

-- 使用说明：
-- CALL calc_monthly_category_stats(2026, 3);  -- 统计2026年3月的分类支出
-- 查询结果：
-- SELECT * FROM statistics WHERE stat_scope = 'monthly' AND stat_type = 'category' AND year = 2026 AND month = 3;
