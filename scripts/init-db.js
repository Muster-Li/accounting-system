// 数据库初始化脚本
// 运行: node scripts/init-db.js
import { createClient } from '@vercel/postgres';
import dotenv from 'dotenv';

dotenv.config();

// 使用 NON_POOLING 连接字符串（适合脚本）
const connectionString = process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL;

if (!connectionString) {
  console.error('错误: 请设置 POSTGRES_URL_NON_POOLING 或 POSTGRES_URL 环境变量');
  console.error('示例: POSTGRES_URL_NON_POOLING="postgres://..." node scripts/init-db.js');
  process.exit(1);
}

const client = createClient({
  connectionString,
});

async function initDB() {
  try {
    await client.connect();
    console.log('已连接到数据库...\n');

    console.log('开始创建表...');

    // 分类表
    await client.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        type VARCHAR(20) NOT NULL CHECK (type IN ('expense', 'income')),
        parent_id INTEGER REFERENCES categories(id),
        icon VARCHAR(50),
        color VARCHAR(20),
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ categories 表已创建');

    // 成员表
    await client.query(`
      CREATE TABLE IF NOT EXISTS members (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        avatar_color VARCHAR(20) DEFAULT 'bg-gray-400',
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ members 表已创建');

    // 账单记录表
    await client.query(`
      CREATE TABLE IF NOT EXISTS bills (
        id SERIAL PRIMARY KEY,
        type VARCHAR(20) NOT NULL CHECK (type IN ('expense', 'income')),
        amount DECIMAL(15,2) NOT NULL,
        category_id INTEGER REFERENCES categories(id),
        sub_category_id INTEGER REFERENCES categories(id),
        member_id INTEGER REFERENCES members(id),
        bill_date DATE NOT NULL,
        bill_time TIME,
        project VARCHAR(100),
        note TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ bills 表已创建');

    // 创建索引
    await client.query(`CREATE INDEX IF NOT EXISTS idx_bills_date ON bills(bill_date DESC)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_bills_type ON bills(type)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_bills_category ON bills(category_id)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_bills_member ON bills(member_id)`);
    console.log('✓ 索引已创建');

    console.log('\n✅ 数据库初始化完成！');
  } catch (error) {
    console.error('\n❌ 初始化失败:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

initDB();
