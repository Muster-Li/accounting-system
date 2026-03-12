# Vercel + Postgres 部署指南

## 架构说明

本项目使用 **Vercel Serverless Functions** 作为后端 API，**Vercel Postgres** 作为数据库。

```
浏览器 → Vercel → 前端 (React/Vite)
           ↓
      Serverless Functions (/api/*.js)
           ↓
      @vercel/postgres
           ↓
      Vercel Postgres (Neon)
```

## 本地开发

### 1. 安装 Vercel CLI

```bash
npm install -g vercel
```

### 2. 登录 Vercel

```bash
vercel login
```

### 3. 链接项目

```bash
vercel link
```

### 4. 启动开发服务器

**必须使用 `vercel dev`，普通 `vite` 无法处理 API 路由：**

```bash
# 方式1：使用 npm 脚本
npm run dev

# 方式2：直接使用 vercel dev
vercel dev --listen 3000
```

这会同时启动：
- 前端开发服务器 (http://localhost:3000)
- API 服务器 (自动处理 /api/* 路由)

## 数据库初始化

### 1. 设置环境变量

在 Vercel Dashboard → Project Settings → Environment Variables 中添加：

```
POSTGRES_URL=<你的数据库连接字符串（带 -pooler）>
POSTGRES_URL_NON_POOLING=<你的数据库连接字符串（不带 -pooler）>
```

然后在本地同步：

```bash
vercel env pull .env
```

### 2. 创建数据库表

```bash
npm run db:init
```

### 3. 插入初始数据

```bash
npm run db:seed
```

## 部署到生产环境

```bash
vercel --prod
```

## API 端点

| 端点 | 方法 | 功能 |
|------|------|------|
| `/api/bills` | GET | 获取账单列表 |
| `/api/bills` | POST | 创建账单 |
| `/api/bills?id=xxx` | PUT | 更新账单 |
| `/api/bills?id=xxx` | DELETE | 删除账单 |
| `/api/categories` | GET | 获取分类列表 |
| `/api/members` | GET | 获取成员列表 |

## 数据库表结构

### categories（分类表）
```sql
CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('expense', 'income')),
  parent_id INTEGER REFERENCES categories(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### members（成员表）
```sql
CREATE TABLE members (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  avatar_color VARCHAR(20) DEFAULT 'bg-gray-400',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### bills（账单表）
```sql
CREATE TABLE bills (
  id SERIAL PRIMARY KEY,
  type VARCHAR(20) NOT NULL CHECK (type IN ('expense', 'income')),
  amount DECIMAL(15,2) NOT NULL,
  category_id INTEGER REFERENCES categories(id),
  sub_category_id INTEGER REFERENCES categories(id),
  member_id INTEGER REFERENCES members(id),
  bill_date DATE NOT NULL,
  bill_time TIME,
  project VARCHAR(200),
  note TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 故障排除

### 问题1：本地开发时 API 返回 HTML 而不是 JSON

**原因**：使用了 `vite` 而不是 `vercel dev`

**解决**：必须使用 `vercel dev` 启动开发服务器

```bash
npm run dev  # 内部使用 vercel dev
```

### 问题2：数据库连接错误

**检查**：
1. 环境变量是否正确设置
2. 使用 `vercel env pull` 同步环境变量
3. 检查 `POSTGRES_URL_NON_POOLING` 用于脚本，`POSTGRES_URL` 用于 API

### 问题3：CORS 错误

**解决**：`vercel.json` 已配置 CORS 头，确保重新部署

## 免费额度

- **Vercel Postgres**: 256MB 存储, 60小时/月计算时间
- **Vercel Functions**: 100 GB-hours/月
- **Vercel 带宽**: 100GB/月
