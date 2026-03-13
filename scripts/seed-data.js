// 插入初始数据脚本
// 运行: node scripts/seed-data.js
import { createClient } from '@vercel/postgres';
import dotenv from 'dotenv';

dotenv.config();

// 使用 NON_POOLING 连接字符串（适合脚本）
const connectionString = process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL;

if (!connectionString) {
  console.error('错误: 请设置 POSTGRES_URL_NON_POOLING 或 POSTGRES_URL 环境变量');
  process.exit(1);
}

const client = createClient({
  connectionString,
});

async function seedData() {
  try {
    await client.connect();
    console.log('已连接到数据库...\n');

    console.log('开始插入初始数据...');

    // 检查是否已有数据
    const catCheck = await client.query('SELECT COUNT(*) as count FROM categories');
    if (parseInt(catCheck.rows[0].count) > 0) {
      console.log('数据已存在，跳过插入');
      return;
    }

    // 插入分类数据
    await client.query(`
      INSERT INTO categories (name, type, parent_id, icon, color) VALUES
      -- 支出一级分类
      ('食品酒水', 'expense', NULL, 'RiRestaurantLine', '#f97316'),
      ('居家生活', 'expense', NULL, 'RiHomeLine', '#eab308'),
      ('交通出行', 'expense', NULL, 'RiBusLine', '#3b82f6'),
      ('休闲娱乐', 'expense', NULL, 'RiMovieLine', '#8b5cf6'),
      ('购物消费', 'expense', NULL, 'RiShoppingBagLine', '#ec4899'),
      -- 食品酒水二级分类
      ('三餐', 'expense', 1, 'RiRestaurantLine', '#f97316'),
      ('早餐', 'expense', 1, 'RiCupLine', '#f97316'),
      ('午餐', 'expense', 1, 'RiRestaurantLine', '#f97316'),
      ('晚餐', 'expense', 1, 'RiRestaurantLine', '#f97316'),
      ('水果', 'expense', 1, 'RiAppleLine', '#f97316'),
      ('零食', 'expense', 1, 'RiCakeLine', '#f97316'),
      -- 居家生活二级分类
      ('房租', 'expense', 2, 'RiHomeLine', '#eab308'),
      ('水电煤', 'expense', 2, 'RiLightbulbLine', '#eab308'),
      ('日用品', 'expense', 2, 'RiShoppingBasketLine', '#eab308'),
      -- 收入分类
      ('工资', 'income', NULL, 'RiMoneyCnyLine', '#22c55e'),
      ('奖金', 'income', NULL, 'RiGiftLine', '#22c55e'),
      ('投资收益', 'income', NULL, 'RiTrendingUpLine', '#22c55e'),
      ('其他收入', 'income', NULL, 'RiWalletLine', '#22c55e')
    `);
    console.log('✓ 分类数据已插入');

    // 插入成员数据
    await client.query(`
      INSERT INTO members (name, avatar_color) VALUES
      ('Steve', 'bg-blue-400'),
      ('青霞', 'bg-pink-400'),
      ('瑞韩', 'bg-purple-400')
    `);
    console.log('✓ 成员数据已插入');

    // 插入示例账单数据
    await client.query(`
      INSERT INTO bills (type, amount, category_id, sub_category_id, member_id, bill_date, project, note) VALUES
      ('expense', 35.50, 1, 6, 1, CURRENT_DATE, '午餐', '公司附近餐厅'),
      ('expense', 128.00, 1, 7, 1, CURRENT_DATE - INTERVAL '1 day', '早餐', '面包和咖啡'),
      ('expense', 45.00, 3, NULL, 2, CURRENT_DATE - INTERVAL '1 day', '打车', '下班回家'),
      ('income', 15000.00, 15, NULL, 1, CURRENT_DATE - INTERVAL '5 day', '月工资', '3月份工资')
    `);
    console.log('✓ 示例账单数据已插入');

    console.log('\n✅ 初始数据插入完成！');
  } catch (error) {
    console.error('\n❌ 插入失败:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

seedData();
