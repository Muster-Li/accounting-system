import { pgTable, serial, varchar, decimal, integer, timestamp, boolean, text, foreignKey, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ========== 分类表 ==========
export const categories = pgTable('categories', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  type: varchar('type', { length: 20 }).notNull(), // 'expense' | 'income'
  parentId: integer('parent_id').references(() => categories.id),
  icon: varchar('icon', { length: 50 }),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  typeIdx: index('categories_type_idx').on(table.type),
  parentIdx: index('categories_parent_idx').on(table.parentId),
}));

// 分类关联关系
export const categoriesRelations = relations(categories, ({ one, many }) => ({
  parent: one(categories, {
    fields: [categories.parentId],
    references: [categories.id],
  }),
  children: many(categories),
  bills: many(bills),
}));

// ========== 成员表 ==========
export const members = pgTable('members', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  avatarColor: varchar('avatar_color', { length: 20 }).default('bg-gray-400'),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  nameIdx: index('members_name_idx').on(table.name),
}));

// 成员关联关系
export const membersRelations = relations(members, ({ many }) => ({
  bills: many(bills),
}));

// ========== 账单表 ==========
export const bills = pgTable('bills', {
  id: serial('id').primaryKey(),
  type: varchar('type', { length: 20 }).notNull(), // 'expense' | 'income'
  amount: decimal('amount', { precision: 15, scale: 2 }).notNull(),
  categoryId: integer('category_id').references(() => categories.id),
  subCategoryId: integer('sub_category_id').references(() => categories.id),
  memberId: integer('member_id').references(() => members.id),
  billDate: timestamp('bill_date').notNull(),
  billTime: varchar('bill_time', { length: 8 }),
  project: varchar('project', { length: 200 }),
  note: text('note'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  dateIdx: index('bills_date_idx').on(table.billDate),
  typeIdx: index('bills_type_idx').on(table.type),
  categoryIdx: index('bills_category_idx').on(table.categoryId),
  memberIdx: index('bills_member_idx').on(table.memberId),
}));

// 账单关联关系
export const billsRelations = relations(bills, ({ one }) => ({
  category: one(categories, {
    fields: [bills.categoryId],
    references: [categories.id],
    relationName: 'category',
  }),
  subCategory: one(categories, {
    fields: [bills.subCategoryId],
    references: [categories.id],
    relationName: 'subCategory',
  }),
  member: one(members, {
    fields: [bills.memberId],
    references: [members.id],
  }),
}));
