import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users schema (keeping from original)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Categories schema
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  icon: text("icon").notNull(), // Font awesome icon name
  color: text("color").notNull(),
});

export const insertCategorySchema = createInsertSchema(categories).pick({
  name: true,
  slug: true,
  icon: true,
  color: true,
});

export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Category = typeof categories.$inferSelect;

// Stores schema
export const stores = pgTable("stores", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  logo: text("logo").notNull(),
  website: text("website").notNull(),
});

export const insertStoreSchema = createInsertSchema(stores).pick({
  name: true,
  slug: true,
  logo: true,
  website: true,
});

export type InsertStore = z.infer<typeof insertStoreSchema>;
export type Store = typeof stores.$inferSelect;

// Coupons schema
export const coupons = pgTable("coupons", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  code: text("code").notNull(),
  storeId: integer("store_id").notNull(),
  categoryId: integer("category_id").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  featured: boolean("featured").default(false),
  verified: boolean("verified").default(false),
  terms: text("terms"),
  usedCount: integer("used_count").default(0),
});

export const insertCouponSchema = createInsertSchema(coupons).pick({
  title: true,
  description: true,
  code: true,
  storeId: true,
  categoryId: true,
  expiresAt: true,
  featured: true,
  verified: true,
  terms: true,
  usedCount: true,
});

export type InsertCoupon = z.infer<typeof insertCouponSchema>;
export type Coupon = typeof coupons.$inferSelect;

// Extended type for frontend use with related data
export type CouponWithRelations = Coupon & {
  store: Store;
  category: Category;
};
