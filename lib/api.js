import { db } from './db.js';
import { bills, categories, members } from '../db/schema.js';
import { eq, and, gte, lte, desc, sql as drizzleSql } from 'drizzle-orm';

// API 基础 URL（用于浏览器环境调用 HTTP API）
const API_BASE_URL = typeof window !== 'undefined' && window.location 
  ? ''  // 使用相对路径，同域请求
  : null;

// 检查是否在浏览器环境且没有直接数据库连接（生产环境）
const isBrowserProduction = typeof window !== 'undefined' && !db;

// 检查数据库是否可用（仅在服务端环境）
function ensureDb() {
  if (!db) {
    throw new Error('Database not initialized. Please check your environment configuration.');
  }
}

// 浏览器环境调用 HTTP API 的辅助函数
async function fetchAPI(endpoint, options = {}) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `API request failed: ${response.status}`);
  }
  
  const result = await response.json();
  return result.data || result;
}

// 格式化日期为 YYYY-MM-DD 字符串（增强版，处理多种数据库驱动返回的格式）
function formatDate(dateValue) {
  if (!dateValue) return null;
  
  try {
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
      if ('year' in dateValue && 'month' in dateValue && 'day' in dateValue) {
        const { year, month, day } = dateValue;
        return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      }
    }
    
    return null;
  } catch (e) {
    console.error('[formatDate] Error:', e.message, 'value:', dateValue);
    return null;
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
  // 浏览器生产环境：调用 HTTP API
  if (isBrowserProduction) {
    // 过滤掉 undefined 值，避免传递 "undefined" 字符串
    const cleanFilters = Object.fromEntries(
      Object.entries(filters).filter(([_, v]) => v !== undefined && v !== null && v !== '')
    );
    const queryString = new URLSearchParams(cleanFilters).toString();
    return fetchAPI(`/api/bills${queryString ? `?${queryString}` : ''}`);
  }
  
  ensureDb();
  const { startDate, endDate, type } = filters;

  let conditions = [];

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
  console.log('api.jsresult', result)

  // 处理日期格式
  return result.map(bill => ({
    ...bill,
    billDate: formatDate(bill.billDate)
  }));
}

/**
 * 创建账单
 */
export async function createBill(data) {
  // 浏览器生产环境：调用 HTTP API
  if (isBrowserProduction) {
    return fetchAPI('/api/bills', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
  
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
  // 浏览器生产环境：调用 HTTP API
  if (isBrowserProduction) {
    return fetchAPI(`/api/bills?id=${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

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
  // 浏览器生产环境：调用 HTTP API
  if (isBrowserProduction) {
    return fetchAPI(`/api/bills?id=${id}`, {
      method: 'DELETE',
    });
  }

  ensureDb();
  await db.delete(bills).where(eq(bills.id, id));
  return { success: true };
}

// ========== 分类 API ==========

/**
 * 获取所有分类（扁平结构，包含 parentId）
 */
export async function getCategories(type) {
  // 浏览器生产环境：调用 HTTP API
  if (isBrowserProduction) {
    const queryString = type && type !== 'undefined' ? `?type=${type}` : '';
    return fetchAPI(`/api/categories${queryString}`);
  }
  
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
  // 浏览器生产环境：调用 HTTP API
  if (isBrowserProduction) {
    return fetchAPI('/api/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

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
  // 浏览器生产环境：调用 HTTP API
  if (isBrowserProduction) {
    return fetchAPI(`/api/categories?id=${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

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
  // 浏览器生产环境：调用 HTTP API
  if (isBrowserProduction) {
    return fetchAPI(`/api/categories?id=${id}`, {
      method: 'DELETE',
    });
  }

  ensureDb();
  await db.delete(categories).where(eq(categories.id, id));
  return { success: true };
}

// ========== 成员 API ==========

/**
 * 获取所有成员
 */
export async function getMembers() {
  // 浏览器生产环境：调用 HTTP API
  if (isBrowserProduction) {
    return fetchAPI('/api/members');
  }
  
  ensureDb();
  return await db.select({
    id: members.id,
    name: members.name,
    avatarColor: members.avatarColor,
    isActive: members.isActive,
  }).from(members).orderBy(members.name);
}

export async function createMember(data) {
  // 浏览器生产环境：调用 HTTP API
  if (isBrowserProduction) {
    return fetchAPI('/api/members', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  ensureDb();
  const result = await db.insert(members).values({
    name: data.name,
    avatarColor: data.avatarColor,
  }).returning();
  return result[0];
}

// 检查连接（浏览器环境直接返回 true，假设 API 可用）
export async function checkConnection() {
  if (isBrowserProduction) {
    try {
      await fetchAPI('/api/bills?limit=1');
      return true;
    } catch (error) {
      console.error('API connection failed:', error.message);
      return false;
    }
  }
  
  // 服务端环境使用原始 checkConnection
  const { checkConnection: dbCheckConnection } = await import('./db.js');
  return dbCheckConnection();
}
