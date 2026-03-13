// 插入初始数据脚本
// 运行: node scripts/seed-categories-data.js
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

    // 清空现有数据（先清空 bills，因为有外键约束）
    await client.query('DELETE FROM bills');
    await client.query('DELETE FROM members');
    await client.query('DELETE FROM categories');
    console.log('✓ 已清空旧数据');

    // ====== 第一步：插入一级分类 ======
    const parentCategoriesResult = await client.query(`
      INSERT INTO categories (name, type, parent_id, icon) VALUES
      -- 支出一级分类
      ('食品酒水', 'expense', NULL, 'RiRestaurantLine'),
      ('居家生活', 'expense', NULL, 'RiHomeLine'),
      ('交通出行', 'expense', NULL, 'RiBusLine'),
      ('休闲娱乐', 'expense', NULL, 'RiGamepadLine'),
      ('购物消费', 'expense', NULL, 'RiShoppingBagLine'),
      ('交流通讯', 'expense', NULL, 'RiSmartphoneLine'),
      ('医疗保健', 'expense', NULL, 'RiHeartPulseLine'),
      ('人情费用', 'expense', NULL, 'RiGiftLine'),
      ('宝宝费用', 'expense', NULL, 'RiEmotionHappyLine'),
      ('学习提升', 'expense', NULL, 'RiBookLine'),
      ('衣服饰品', 'expense', NULL, 'RiTShirtLine'),
      ('出差旅游', 'expense', NULL, 'RiPlaneLine'),
      ('其他支出', 'expense', NULL, 'RiMoreLine'),
      -- 收入分类
      ('工资', 'income', NULL, 'RiMoneyCnyCircleLine'),
      ('奖金', 'income', NULL, 'RiGiftLine'),
      ('投资收益', 'income', NULL, 'RiLineChartLine'),
      ('兼职收入', 'income', NULL, 'RiBriefcaseLine'),
      ('红包收入', 'income', NULL, 'RiRedPacketLine'),
      ('其他收入', 'income', NULL, 'RiWalletLine')
      RETURNING id, name
    `);
    console.log('✓ 一级分类已插入');

    // 构建 name -> id 映射
    const idMap = {};
    parentCategoriesResult.rows.forEach(row => {
      idMap[row.name] = row.id;
    });

    // ====== 第二步：插入二级分类 ======
    // 食品酒水二级分类
    await client.query(`
      INSERT INTO categories (name, type, parent_id, icon) VALUES
      ('三餐', 'expense', ${idMap['食品酒水']}, 'RiRestaurantLine'),
      ('早餐', 'expense', ${idMap['食品酒水']}, 'RiCupLine'),
      ('午餐', 'expense', ${idMap['食品酒水']}, 'RiRestaurantLine'),
      ('晚餐', 'expense', ${idMap['食品酒水']}, 'RiRestaurantLine'),
      ('水果', 'expense', ${idMap['食品酒水']}, 'RiAppleLine'),
      ('零食', 'expense', ${idMap['食品酒水']}, 'RiCakeLine'),
      ('饮料酒水', 'expense', ${idMap['食品酒水']}, 'RiDrinksLine'),
      ('买菜', 'expense', ${idMap['食品酒水']}, 'RiShoppingBasketLine')
    `);

    // 居家生活二级分类
    await client.query(`
      INSERT INTO categories (name, type, parent_id, icon) VALUES
      ('房租', 'expense', ${idMap['居家生活']}, 'RiHomeLine'),
      ('水电煤', 'expense', ${idMap['居家生活']}, 'RiLightbulbLine'),
      ('物业费', 'expense', ${idMap['居家生活']}, 'RiBuildingLine'),
      ('日用品', 'expense', ${idMap['居家生活']}, 'RiBrushLine'),
      ('家电维修', 'expense', ${idMap['居家生活']}, 'RiToolsLine')
    `);

    // 交通出行二级分类
    await client.query(`
      INSERT INTO categories (name, type, parent_id, icon) VALUES
      ('公交地铁', 'expense', ${idMap['交通出行']}, 'RiSubwayLine'),
      ('打车', 'expense', ${idMap['交通出行']}, 'RiTaxiLine'),
      ('加油', 'expense', ${idMap['交通出行']}, 'RiOilLine'),
      ('停车费', 'expense', ${idMap['交通出行']}, 'RiParkingLine'),
      ('保养维修', 'expense', ${idMap['交通出行']}, 'RiSettingsLine')
    `);

    // 休闲娱乐二级分类
    await client.query(`
      INSERT INTO categories (name, type, parent_id, icon) VALUES
      ('电影', 'expense', ${idMap['休闲娱乐']}, 'RiMovieLine'),
      ('游戏', 'expense', ${idMap['休闲娱乐']}, 'RiGamepadLine'),
      ('运动健身', 'expense', ${idMap['休闲娱乐']}, 'RiRunLine'),
      ('旅游', 'expense', ${idMap['休闲娱乐']}, 'RiPlaneLine'),
      ('聚会', 'expense', ${idMap['休闲娱乐']}, 'RiTeamLine')
    `);

    // 购物消费二级分类
    await client.query(`
      INSERT INTO categories (name, type, parent_id, icon) VALUES
      ('服饰', 'expense', ${idMap['购物消费']}, 'RiTShirtLine'),
      ('鞋帽', 'expense', ${idMap['购物消费']}, 'RiFootprintLine'),
      ('化妆品', 'expense', ${idMap['购物消费']}, 'RiMagicLine'),
      ('电子产品', 'expense', ${idMap['购物消费']}, 'RiSmartphoneLine'),
      ('书籍', 'expense', ${idMap['购物消费']}, 'RiBookLine')
    `);

    // 交流通讯二级分类
    await client.query(`
      INSERT INTO categories (name, type, parent_id, icon) VALUES
      ('话费', 'expense', ${idMap['交流通讯']}, 'RiPhoneLine'),
      ('宽带', 'expense', ${idMap['交流通讯']}, 'RiWifiLine'),
      ('视频会员', 'expense', ${idMap['交流通讯']}, 'RiVideoLine')
    `);

    // 医疗保健二级分类
    await client.query(`
      INSERT INTO categories (name, type, parent_id, icon) VALUES
      ('看病', 'expense', ${idMap['医疗保健']}, 'RiHospitalLine'),
      ('药品', 'expense', ${idMap['医疗保健']}, 'RiMedicineBottleLine'),
      ('体检', 'expense', ${idMap['医疗保健']}, 'RiHeartPulseLine'),
      ('保险', 'expense', ${idMap['医疗保健']}, 'RiShieldLine')
    `);

    // 人情费用二级分类
    await client.query(`
      INSERT INTO categories (name, type, parent_id, icon) VALUES
      ('送礼', 'expense', ${idMap['人情费用']}, 'RiGiftLine'),
      ('红包', 'expense', ${idMap['人情费用']}, 'RiRedPacketLine'),
      ('请客', 'expense', ${idMap['人情费用']}, 'RiRestaurantLine'),
      ('份子钱', 'expense', ${idMap['人情费用']}, 'RiMoneyCnyBoxLine')
    `);

    console.log('✓ 二级分类已插入');

    // ====== 第三步：插入成员数据 ======
    await client.query(`
      INSERT INTO members (name, avatar_color) VALUES
      ('青霞', 'bg-pink-400'),
      ('瑞韩', 'bg-purple-400')
    `);
    console.log('✓ 成员数据已插入');

    console.log('\n✅ 所有数据插入完成！');
  } catch (error) {
    console.error('\n❌ 插入失败:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

seedData();
