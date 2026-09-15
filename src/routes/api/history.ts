import { createAPIFileRoute } from '@tanstack/react-start/api';
import { db } from '@/db';
import { scans } from '@/db/schema';
import { desc } from 'drizzle-orm';

export const APIRoute = createAPIFileRoute('/api/history')({
  GET: async ({ request }) => {
    try {
      const history = await db.select().from(scans).orderBy(desc(scans.createdAt)).limit(50);
      return new Response(JSON.stringify(history), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (e) {
      return new Response(JSON.stringify({ error: 'Failed to fetch history' }), { status: 500 });
    }
  },
  POST: async ({ request }) => {
    try {
      const body = await request.json();
      const newScan = await db.insert(scans).values({
        id: body.id,
        filename: body.filename,
        verdict: body.verdict,
        confidence: body.confidence,
        robustness: body.robustness,
        evidence: JSON.stringify(body.evidence),
      }).returning();
      return new Response(JSON.stringify(newScan[0]), {
        status: 201,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (e) {
      return new Response(JSON.stringify({ error: 'Failed to save scan' }), { status: 500 });
    }
  },
});
