# 双环境配置说明

本项目支持**开发环境**和**生产环境**使用不同的数据库连接方式。

## 架构对比

### 开发环境（本地）
```
浏览器 → Neon HTTP Client → PostgreSQL
   ↓
VITE_DATABASE_URL（打包到前端，仅本地使用）
```

### 生产环境（Vercel）
```
浏览器 → /api/bills (Serverless Function) → @vercel/postgres → PostgreSQL
   ↓
POSTGRES_URL（仅服务端可见，安全）
```

## 文件说明

| 文件 | 用途 | 环境 |
|------|------|------|
| `lib/db.js` | 浏览器端数据库连接（Neon HTTP） | 开发 |
| `lib/db-server.js` | 服务端数据库连接（Vercel Postgres） | 生产 |
| `lib/api.js` | 自动切换的 API 层 | 两者 |
| `api/*.js` | Vercel Serverless Functions | 生产 |

## 环境变量配置

### 开发环境 (.env)
```bash
# 只需要这个（用于浏览器直连）
VITE_DATABASE_URL=postgresql://user:password@host-pooler.region.neon.tech/dbname?sslmode=require
```

### 生产环境（Vercel Dashboard）
```bash
# 只需要这个（用于 Serverless Functions）
POSTGRES_URL=postgresql://user:password@host-pooler.region.neon.tech/dbname?sslmode=require
```

## 代码自动切换

`lib/api.js` 中的函数会自动检测环境：

```javascript
if (db) {
  // 开发环境：直连数据库
  return await db.query.bills.findMany(...);
} else {
  // 生产环境：调用 API
  const response = await fetch('/api/bills');
  return await response.json();
}
```

## 开发流程

### 1. 安装依赖
```bash
npm install
```

### 2. 配置环境变量
```bash
# 复制示例文件
cp .env.example .env

# 编辑 .env，填入你的数据库连接信息
```

### 3. 初始化数据库
```bash
# 创建表结构
npm run db:push

# 或使用 Drizzle Studio 管理
npm run db:studio
```

### 4. 启动开发服务器
```bash
npm run dev
```

### 5. 部署到生产
```bash
# 1. 确保 Vercel 环境变量已设置 POSTGRES_URL
# 2. 部署
vercel --prod
```

## 注意事项

1. **开发环境**：数据库密码暴露在前端，**仅在本地使用**
2. **生产环境**：密码只在服务端，**完全安全**
3. 同一套代码在两个环境自动切换，无需修改业务代码

## 添加新 API

1. 在 `lib/api.js` 中添加函数，同时支持两种环境
2. 在 `api/` 目录下创建对应的 Serverless Function（仅生产需要）
3. 使用 `lib/db.js`（开发）或 `lib/db-server.js`（生产）
