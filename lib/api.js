import { bills, categories, members } from '../db/schema.js';
import { eq, and, gte, lte, desc } from 'drizzle-orm';

// ========== 账单 API ==========

/**
 * 获取账单列表（仅查询账单表，不关联其他表）
 * @param {Object} filters - 筛选条件
 */
export async function getBills(filters = {}) {
  const { startDate, endDate, type } = filters;

  const { db } = await import('./db.js');

  // 开发环境：直连数据库
  if (db) {
    console.log('[API] Querying bills table only');

    try {
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

      // 只查询账单表，不关联其他表
      const result = await db.select({
        id: bills.id,
        type: bills.type,
        amount: bills.amount,
        categoryId: bills.categoryId,
        subCategoryId: bills.subCategoryId,
        memberId: bills.memberId,
        billDate: bills.billDate,
        billTime: bills.billTime,
        project: bills.project,
        note: bills.note,
        createdAt: bills.createdAt,
      })
      .from(bills)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(bills.billDate), desc(bills.createdAt));

      return result;
    } catch (error) {
      console.error('[API] Database query failed:', error);
      throw error;
    }
  }

  // 生产环境：调用 API
  console.log('[API] Using HTTP API');
  const params = new URLSearchParams();
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);
  if (type) params.append('type', type);

  const response = await fetch(`/api/bills?${params}`);
  const result = await response.json();
  if (!result.success) throw new Error(result.error);
  return result.data;
}

/**
 * 创建账单
 */
export async function createBill(data) {
  const { db } = await import('./db.js');

  if (db) {
    const result = await db.insert(bills).values({
      type: data.type,
      amount: data.amount.toString(),
      categoryId: data.categoryId,
      subCategoryId: data.subCategoryId,
      memberId: data.memberId,
      billDate: new Date(data.billDate),
      billTime: data.billTime,
      project: data.project,
      note: data.note,
    }).returning();
    return result[0];
  }

  const response = await fetch('/api/bills', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const result = await response.json();
  if (!result.success) throw new Error(result.error);
  return result.data;
}

/**
 * 更新账单
 */
export async function updateBill(id, data) {
  const { db } = await import('./db.js');

  if (db) {
    const result = await db.update(bills)
      .set({
        type: data.type,
        amount: data.amount.toString(),
        categoryId: data.categoryId,
        subCategoryId: data.subCategoryId,
        memberId: data.memberId,
        billDate: new Date(data.billDate),
        billTime: data.billTime,
        project: data.project,
        note: data.note,
        updatedAt: new Date(),
      })
      .where(eq(bills.id, id))
      .returning();
    return result[0];
  }

  const response = await fetch(`/api/bills?id=${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const result = await response.json();
  if (!result.success) throw new Error(result.error);
  return result.data;
}

/**
 * 删除账单
 */
export async function deleteBill(id) {
  const { db } = await import('./db.js');

  if (db) {
    await db.delete(bills).where(eq(bills.id, id));
    return { success: true };
  }

  const response = await fetch(`/api/bills?id=${id}`, {
    method: 'DELETE',
  });
  const result = await response.json();
  if (!result.success) throw new Error(result.error);
  return result;
}

// ========== 分类 API ==========

/**
 * 获取所有分类（扁平结构，包含 parentId）
 */
export async function getCategories(type) {
  const { db } = await import('./db.js');

  if (db) {
    let query = db.select({
      id: categories.id,
      name: categories.name,
      type: categories.type,
      parentId: categories.parentId,
      icon: categories.icon,
      isActive: categories.isActive,
    }).from(categories).orderBy(categories.id);

    if (type) {
      query = query.where(eq(categories.type, type));
    }

    return await query;
  }

  const params = type ? `?type=${type}` : '';
  const response = await fetch(`/api/categories${params}`);
  const result = await response.json();
  if (!result.success) throw new Error(result.error);
  return result.data;
}

export async function createCategory(data) {
  const { db } = await import('./db.js');

  if (db) {
    const result = await db.insert(categories).values({
      name: data.name,
      type: data.type,
      parentId: data.parentId,
      icon: data.icon,
    }).returning();
    return result[0];
  }

  const response = await fetch('/api/categories', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const result = await response.json();
  if (!result.success) throw new Error(result.error);
  return result.data;
}

// ========== 成员 API ==========

/**
 * 获取所有成员
 */
export async function getMembers() {
  const { db } = await import('./db.js');

  if (db) {
    return await db.select({
      id: members.id,
      name: members.name,
      avatarColor: members.avatarColor,
      isActive: members.isActive,
    }).from(members).orderBy(members.name);
  }

  const response = await fetch('/api/members');
  const result = await response.json();
  if (!result.success) throw new Error(result.error);
  return result.data;
}

export async function createMember(data) {
  const { db } = await import('./db.js');

  if (db) {
    const result = await db.insert(members).values({
      name: data.name,
      avatarColor: data.avatarColor,
    }).returning();
    return result[0];
  }

  const response = await fetch('/api/members', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const result = await response.json();
  if (!result.success) throw new Error(result.error);
  return result.data;
}

export { checkConnection } from './db.js';
