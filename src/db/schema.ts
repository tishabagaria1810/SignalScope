import { sqliteTable, text, real } from 'drizzle-orm/sqlite-core';

export const scans = sqliteTable('scans', {
  id: text('id').primaryKey(),
  filename: text('filename').notNull(),
  verdict: text('verdict').notNull(),
  confidence: real('confidence').notNull(),
  robustness: real('robustness').notNull(),
  evidence: text('evidence').notNull(),
  createdAt: text('created_at').default("CURRENT_TIMESTAMP").notNull(),
});
