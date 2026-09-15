import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";

import { db } from './src/db/index';
import { scans } from './src/db/schema';
import { desc } from 'drizzle-orm';

const apiMiddleware = () => ({
  name: 'api-middleware',
  configureServer(server) {
    server.middlewares.use('/api/history', async (req, res) => {
      if (req.method === 'GET') {
        try {
          const history = await db.select().from(scans).orderBy(desc(scans.createdAt)).limit(50);
          const parsedHistory = history.map(row => ({
            ...row,
            evidence: typeof row.evidence === 'string' ? JSON.parse(row.evidence) : row.evidence
          }));
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(parsedHistory));
        } catch (e) {
          res.statusCode = 500;
          res.end(JSON.stringify({ error: 'Failed' }));
        }
      } else if (req.method === 'POST') {
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', async () => {
          try {
            const parsed = JSON.parse(body);
            const newScan = await db.insert(scans).values({
              id: parsed.id,
              filename: parsed.filename,
              verdict: parsed.verdict,
              confidence: parsed.confidence,
              robustness: parsed.robustness,
              evidence: JSON.stringify(parsed.evidence),
            }).returning();
            res.statusCode = 201;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(newScan[0]));
          } catch (e) {
            res.statusCode = 500;
            res.end(JSON.stringify({ error: 'Failed' }));
          }
        });
      }
    });
  }
});

export default defineConfig({
  plugins: [
    apiMiddleware(),
    tanstackStart(),
    react(),
    tailwindcss(),
    tsconfigPaths(),
  ],
});
