import { pgTable, text, uuid } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: uuid().primaryKey().defaultRandom(),
  username: text().notNull().unique(),
  password: text().notNull(),
});
