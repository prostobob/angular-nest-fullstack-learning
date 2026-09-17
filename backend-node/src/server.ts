import 'dotenv/config';
import express from 'express';
import { db } from './db.js';

const app = express();
const port = process.env.PORT ?? 3000;

app.get('/health', (req: express.Request, res: express.Response) => res.json({ status: 'OK' }));

app.get('/db-health', async (req: express.Request, res: express.Response) => {
  const result = await db.raw('select 1');
  res.json(result.rows);
});

app.listen(port, () => console.log(`listening on ${port}`));
