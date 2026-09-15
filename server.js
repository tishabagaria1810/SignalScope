import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { db } from './src/db/index';
import { scans } from './src/db/schema';
import { desc } from 'drizzle-orm';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

app.get('/api/history', async (req, res) => {
  try {
    const history = await db.select().from(scans).orderBy(desc(scans.createdAt)).limit(50);
    const parsedHistory = history.map(row => ({
      ...row,
      evidence: typeof row.evidence === 'string' ? JSON.parse(row.evidence) : row.evidence
    }));
    res.json(parsedHistory);
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

app.post('/api/history', async (req, res) => {
  try {
    const newScan = await db.insert(scans).values({
      id: req.body.id,
      filename: req.body.filename,
      verdict: req.body.verdict,
      confidence: req.body.confidence,
      robustness: req.body.robustness,
      evidence: JSON.stringify(req.body.evidence),
    }).returning();
    res.status(201).json(newScan[0]);
  } catch (e) {
    res.status(500).json({ error: 'Failed to save scan' });
  }
});

app.use(express.static(path.join(__dirname, 'dist')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const PORT = process.env.PORT || 5173;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
