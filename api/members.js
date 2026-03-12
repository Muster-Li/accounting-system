import { db } from '../lib/db-server.js';
import { members } from '../db/schema.js';

// Vercel Serverless Function - 成员 API
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    switch (req.method) {
      case 'GET':
        return await getMembers(req, res);
      case 'POST':
        return await createMember(req, res);
      default:
        return res.status(405).json({ success: false, error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}

// 获取成员列表
async function getMembers(req, res) {
  const data = await db.query.members.findMany({
    orderBy: [members.name],
  });
  
  return res.status(200).json({ success: true, data });
}

// 创建成员
async function createMember(req, res) {
  const data = req.body;
  
  const result = await db.insert(members).values({
    name: data.name,
    avatarColor: data.avatarColor,
  }).returning();
  
  return res.status(201).json({ success: true, data: result[0] });
}
