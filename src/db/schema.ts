import { pgTable, text, timestamp, real } from 'drizzle-orm/pg-core';

export const scans = pgTable('scans', {
  id: text('id').primaryKey(),
  filename: text('filename').notNull(),
  verdict: text('verdict').notNull(),
  confidence: real('confidence').notNull(),
  robustness: real('robustness').notNull(),
  evidence: text('evidence').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
