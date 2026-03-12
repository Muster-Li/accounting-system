# 记账管理系统

基于 React + Vite + Vercel Postgres 的记账应用。

## 技术栈

- **前端**: React 18 + Vite 5 + Tailwind CSS
- **后端**: Vercel Serverless Functions
- **数据库**: Vercel Postgres (@vercel/postgres)
- **图表**: Chart.js

## 项目结构

```
├── api/                    # Vercel Serverless Functions
│   ├── bills.js           # 账单 CRUD API
│   ├── categories.js      # 分类 API
│   └── members.js         # 成员 API
├── scripts/               # 数据库脚本
│   ├── init-db.js         # 初始化表结构
│   └── seed-data.js       # 插入初始数据
├── src/
│   ├── components/        # 组件
│   ├── pages/             # 页面
│   ├── services/          # API 服务
│   └── ...
└── vercel.json            # Vercel 配置
```

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

创建 `.env` 文件：

```env
POSTGRES_URL="your-postgres-url"
```

### 3. 初始化数据库

```bash
npm run db:init     # 创建表
npm run db:seed     # 插入初始数据
```

### 4. 启动开发服务器

```bash
npm run dev
```

### 5. 部署到 Vercel

```bash
vercel --prod
```

## 数据库 ER 图

```
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│  categories │       │    bills    │       │   members   │
├─────────────┤       ├─────────────┤       ├─────────────┤
│ id (PK)     │◄──────┤ category_id │       │ id (PK)     │
│ name        │       │ sub_category_id     │ name        │
│ type        │       │ member_id   │──────►│ avatar_color│
│ parent_id   │       │ amount      │       └─────────────┘
│ icon        │       │ bill_date   │
│ color       │       │ bill_time   │
└─────────────┘       │ project     │
                      │ note        │
                      └─────────────┘
```

## 功能特性

- ✅ 收支记账（支持二级分类）
- ✅ 成员管理
- ✅ 账单增删改查
- ✅ 按日期筛选
- ✅ 收支统计

## 详细部署文档

查看 [DEPLOY.md](./DEPLOY.md)
