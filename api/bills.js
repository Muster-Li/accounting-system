import { db } from '../lib/db.js';
import { bills } from '../db/schema.js';
import { eq, and, gte, lte, desc } from 'drizzle-orm';

// Vercel Serverless Function - 账单 API
// 只查询账单表，不关联其他表，前端自行合并数据

// 增强的日期格式化函数，处理多种数据库驱动返回的格式
function formatDate(dateValue) {
  if (!dateValue) return null;
  
  try {
    // 记录原始值以便调试
    console.log('[formatDate] Original:', dateValue, 'Type:', typeof dateValue);
    
    // 如果已经是 Date 对象
    if (dateValue instanceof Date) {
      if (isNaN(dateValue.getTime())) return null;
      return dateValue.toISOString().split('T')[0];
    }
    
    // 如果是字符串
    if (typeof dateValue === 'string') {
      // YYYY-MM-DD 格式
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateValue)) return dateValue;
      // ISO 格式字符串
      if (/^\d{4}-\d{2}-\d{2}T/.test(dateValue)) {
        return dateValue.split('T')[0];
      }
      // 尝试解析
      const date = new Date(dateValue);
      if (!isNaN(date.getTime())) {
        return date.toISOString().split('T')[0];
      }
      return null;
    }
    
    // 如果是数字（时间戳）
    if (typeof dateValue === 'number') {
      const date = new Date(dateValue);
      if (isNaN(date.getTime())) return null;
      return date.toISOString().split('T')[0];
    }
    
    // 处理 Postgres 驱动的特殊对象格式
    if (typeof dateValue === 'object' && dateValue !== null) {
      // Vercel Postgres 可能返回 { year, month, day } 格式
      if ('year' in dateValue && 'month' in dateValue && 'day' in dateValue) {
        const { year, month, day } = dateValue;
        return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      }
    }
    
    console.log('[formatDate] Unrecognized format:', dateValue);
    return null;
  } catch (e) {
    console.error('[formatDate] Error:', e.message, 'value:', dateValue);
    return null;
  }
}
export default async function handler(req, res) {
  // 设置 CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    switch (req.method) {
      case 'GET':
        return await getBills(req, res);
      case 'POST':
        return await createBill(req, res);
      case 'PUT':
        return await updateBill(req, res);
      case 'DELETE':
        return await deleteBill(req, res);
      default:
        return res.status(405).json({ success: false, error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}

// 获取账单列表（只查询账单表）
async function getBills(req, res) {
  const { startDate, endDate, type } = req.query;

  let conditions = [];

  // 排除 "undefined" 字符串并验证日期
  if (startDate && startDate !== 'undefined') {
    try {
      const start = new Date(startDate);
      if (!isNaN(start.getTime())) {
        conditions.push(gte(bills.billDate, start));
      }
    } catch (e) {
      console.error('Invalid startDate:', startDate);
    }
  }
  if (endDate && endDate !== 'undefined') {
    try {
      const end = new Date(endDate);
      if (!isNaN(end.getTime())) {
        conditions.push(lte(bills.billDate, end));
      }
    } catch (e) {
      console.error('Invalid endDate:', endDate);
    }
  }
  if (type && type !== 'undefined') {
    conditions.push(eq(bills.type, type));
  }

  // 只查询账单表，不关联其他表
  const result = await db.select({
    id: bills.id,
    type: bills.type,
    amount: bills.amount,
    categoryId: bills.categoryId,
    subCategoryId: bills.subCategoryId,
    memberId: bills.memberId,
    billDate: bills.billDate,
    project: bills.project,
    note: bills.note,
    createdAt: bills.createdAt,
  })
  .from(bills)
  .where(conditions.length > 0 ? and(...conditions) : undefined)
  .orderBy(desc(bills.billDate), desc(bills.createdAt));

  // 格式化日期为 YYYY-MM-DD
  const data = result.map(bill => {
    const formattedDate = formatDate(bill.billDate);
    return {
      ...bill,
      billDate: formattedDate
    };
  });
  
  console.log('[getBills] First bill raw date:', result[0]?.billDate, 'formatted:', data[0]?.billDate);

  return res.status(200).json({ success: true, data });
}

// 创建账单
async function createBill(req, res) {
  const data = req.body;

  const result = await db.insert(bills).values({
    type: data.type,
    amount: data.amount.toString(),
    categoryId: data.categoryId,
    subCategoryId: data.subCategoryId,
    memberId: data.memberId,
    billDate: new Date(data.billDate),
    project: data.project,
    note: data.note,
  }).returning();

  // 使用输入的日期字符串返回
  return res.status(201).json({ 
    success: true, 
    data: { ...result[0], billDate: data.billDate }
  });
}

// 更新账单
async function updateBill(req, res) {
  const { id } = req.query;
  const data = req.body;

  const result = await db.update(bills)
    .set({
      type: data.type,
      amount: data.amount.toString(),
      categoryId: data.categoryId,
      subCategoryId: data.subCategoryId,
      memberId: data.memberId,
      billDate: new Date(data.billDate),
      project: data.project,
      note: data.note,
      updatedAt: new Date(),
    })
    .where(eq(bills.id, parseInt(id)))
    .returning();

  // 使用输入的日期字符串返回
  return res.status(200).json({ 
    success: true, 
    data: { ...result[0], billDate: data.billDate }
  });
}

// 删除账单
async function deleteBill(req, res) {
  const { id } = req.query;
  await db.delete(bills).where(eq(bills.id, parseInt(id)));
  return res.status(200).json({ success: true });
}
