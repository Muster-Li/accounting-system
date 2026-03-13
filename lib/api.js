import { db } from './db.js';
import { bills, categories, members } from '../db/schema.js';
import { eq, and, gte, lte, desc, sql as drizzleSql } from 'drizzle-orm';

// 检查数据库是否可用
function ensureDb() {
  if (!db) {
    throw new Error('Database not initialized. Please check your environment configuration.');
  }
}

// 格式化日期为 YYYY-MM-DD 字符串
function formatDate(dateValue) {
  if (!dateValue) return '';
  try {
    // 如果已经是 Date 对象
    if (dateValue instanceof Date) {
      if (isNaN(dateValue.getTime())) return '';
      return dateValue.toISOString().split('T')[0];
    }
    // 如果是字符串，尝试解析
    if (typeof dateValue === 'string') {
      // 处理 YYYY-MM-DD 格式
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
        return dateValue;
      }
      const date = new Date(dateValue);
      if (isNaN(date.getTime())) return '';
      return date.toISOString().split('T')[0];
    }
    return '';
  } catch (e) {
    console.error('formatDate error:', e, 'value:', dateValue);
    return '';
  }
}

// 处理账单数据中的日期字段
function processBill(bill) {
  return {
    ...bill,
    billDate: formatDate(bill.billDate),
    createdAt: bill.createdAt ? new Date(bill.createdAt) : null,
    updatedAt: bill.updatedAt ? new Date(bill.updatedAt) : null,
  };
}

// ========== 账单 API ==========

/**
 * 获取账单列表
 * @param {Object} filters - 筛选条件
 */
export async function getBills(filters = {}) {
  ensureDb();
  const { startDate, endDate, type } = filters;

  let conditions = [];

  if (startDate) {
    conditions.push(gte(bills.billDate, new Date(startDate)));
  }
  if (endDate) {
    conditions.push(lte(bills.billDate, new Date(endDate)));
  }
  if (type) {
    conditions.push(eq(bills.type, type));
  }

  const result = await db.select({
    id: bills.id,
    type: bills.type,
    amount: bills.amount,
    categoryId: bills.categoryId,
    subCategoryId: bills.subCategoryId,
    memberId: bills.memberId,
    // 使用 to_char 在查询时将日期转换为字符串
    billDate: drizzleSql`to_char(${bills.billDate}, 'YYYY-MM-DD')`.as('billDate'),
    project: bills.project,
    note: bills.note,
    createdAt: bills.createdAt,
  })
  .from(bills)
  .where(conditions.length > 0 ? and(...conditions) : undefined)
  .orderBy(desc(bills.billDate), desc(bills.createdAt));

  return result;
}

/**
 * 创建账单
 */
export async function createBill(data) {
  ensureDb();
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
  // 使用输入的日期字符串，避免数据库返回的 Date 对象解析问题
  return {
    ...processBill(result[0]),
    billDate: data.billDate
  };
}

/**
 * 更新账单
 */
export async function updateBill(id, data) {
  ensureDb();
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
    .where(eq(bills.id, id))
    .returning();
  // 使用输入的日期字符串，避免数据库返回的 Date 对象解析问题
  return {
    ...processBill(result[0]),
    billDate: data.billDate
  };
}

/**
 * 删除账单
 */
export async function deleteBill(id) {
  ensureDb();
  await db.delete(bills).where(eq(bills.id, id));
  return { success: true };
}

// ========== 分类 API ==========

/**
 * 获取所有分类（扁平结构，包含 parentId）
 */
export async function getCategories(type) {
  ensureDb();
  let query = db.select({
    id: categories.id,
    name: categories.name,
    type: categories.type,
    parentId: categories.parentId,
    icon: categories.icon,
    isActive: categories.isActive,
    createdAt: categories.createdAt,
  }).from(categories).orderBy(categories.id);

  if (type) {
    query = query.where(eq(categories.type, type));
  }

  return await query;
}

export async function createCategory(data) {
  ensureDb();
  const result = await db.insert(categories).values({
    name: data.name,
    type: data.type,
    parentId: data.parentId,
    icon: data.icon,
  }).returning();
  return result[0];
}

export async function updateCategory(id, data) {
  ensureDb();
  const result = await db.update(categories)
    .set({
      name: data.name,
      icon: data.icon,
      updatedAt: new Date(),
    })
    .where(eq(categories.id, id))
    .returning();
  return result[0];
}

export async function deleteCategory(id) {
  ensureDb();
  await db.delete(categories).where(eq(categories.id, id));
  return { success: true };
}

// ========== 成员 API ==========

/**
 * 获取所有成员
 */
export async function getMembers() {
  ensureDb();
  return await db.select({
    id: members.id,
    name: members.name,
    avatarColor: members.avatarColor,
    isActive: members.isActive,
  }).from(members).orderBy(members.name);
}

export async function createMember(data) {
  ensureDb();
  const result = await db.insert(members).values({
    name: data.name,
    avatarColor: data.avatarColor,
  }).returning();
  return result[0];
}

export { checkConnection } from './db.js';
