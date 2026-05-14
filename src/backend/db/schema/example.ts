import { pgTable, uuid, text, timestamp } from 'drizzle-orm/pg-core';

export const example = pgTable('sn_example', {
  id: uuid('id').primaryKey().defaultRandom(),
  fullName: text('full_name'),
  avatarUrl: text('avatar_url'),
  bio: text('bio'),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export type Example = typeof example.$inferSelect;
