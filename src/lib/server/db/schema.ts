import { updated } from '$app/stores';
import { sql } from 'drizzle-orm';
import { pgTable, text, timestamp, boolean } from 'drizzle-orm/pg-core';
import { nanoid } from 'nanoid';
if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not set');

export const user = pgTable('user', {
  id: text('id').primaryKey(),
  username: text('username').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  uploadKey: text('upload_key').notNull().default(nanoid()),
  admin: boolean('admin').notNull().default(false),
  createdAt: timestamp('created_at').default(sql`now()`),
  updatedAt: timestamp('updated_at')
    .default(sql`now()`)
    .$onUpdate(() => sql`now()`)
});

export const session = pgTable('session', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => user.id),
  expiresAt: timestamp('expires_at', { withTimezone: true, mode: 'date' }).notNull()
});

export const config = pgTable('config', {
  id: text('id').primaryKey(),
  direct: boolean('direct').default(true),
  subdomain: text('subdomain').default('i'),
  domain: text('domain').default(process.env.DATABASE_URL),
  userId: text('user_id')
    .notNull()
    .references(() => user.id),
  username: text('username')
    .notNull()
    .references(() => user.username)
});

export const file = pgTable('file', {
  id: text('id').primaryKey(),
  url: text('url').notNull(),
  fileName: text('file_name').notNull().default(''),
  fileSize: text('file_size').notNull().default('0.0069kb'),
  mimeType: text('mime_type').notNull().default('error'),
  uploadedBy: text('uploaded_by')
    .notNull()
    .references(() => user.username),
  uploadedTime: timestamp('uploaded_time')
    .notNull()
    .default(sql`now()`),
  userId: text('user_id')
    .notNull()
    .references(() => user.id)
});

export const global = pgTable('global', {
  flag: text('flag').primaryKey().notNull(),
  value: boolean('value').notNull().default(false)
});

export type Session = typeof session.$inferSelect;

export type User = typeof user.$inferSelect;
