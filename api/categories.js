import { db } from '../lib/db.js';
import { categories } from '../db/schema.js';
import { eq, desc } from 'drizzle-orm';

// Vercel Serverless Function - 分类 API
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    switch (req.method) {
      case 'GET':
        return await getCategories(req, res);
      case 'POST':
        return await createCategory(req, res);
      default:
        return res.status(405).json({ success: false, error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}

// 获取分类列表
async function getCategories(req, res) {
  const { type } = req.query;
  
  let query = db.query.categories.findMany({
    with: { children: true },
    orderBy: [categories.id],
  });
  
  if (type) {
    query = query.where(eq(categories.type, type));
  }
  
  const data = await query;
  return res.status(200).json({ success: true, data });
}

// 创建分类
async function createCategory(req, res) {
  const data = req.body;
  
  const result = await db.insert(categories).values({
    name: data.name,
    type: data.type,
    parentId: data.parentId,
    icon: data.icon,
  }).returning();
  
  return res.status(201).json({ success: true, data: result[0] });
}
