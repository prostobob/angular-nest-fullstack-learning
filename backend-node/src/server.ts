import 'dotenv/config';
import express, { type NextFunction } from 'express';
import { db } from './db.js';
import { logger } from './middlewares/logger.js';
import { checkAuth } from './middlewares/auth.js';
import { ApiError } from './errors/api-error.js';

const app = express();
const port = process.env.PORT ?? 3000;

app.use(logger);

app.use(express.json());

app.get('/health', (req: express.Request, res: express.Response) => res.json({ status: 'OK' }));

app.get('/db-health', async (req: express.Request, res: express.Response) => {
  const result = await db.raw('select 1');
  res.json(result.rows);
});

app.get('/whoami', checkAuth, (req: express.Request, res: express.Response) => {
  res.json({ userId: req.userId });
});

app.use((req, res, next: NextFunction) => {
  const err = new ApiError(404, 'Not found');
  next(err);
});

app.use((err: Error, req: express.Request, res: express.Response, next: NextFunction) => {
  const statusErr = err instanceof ApiError ? err.statusCode : 500;
  console.error(err.stack);

  res.status(statusErr).json({
    errors: {
      body: [err.message],
    },
  });
});

app.listen(port, () => console.log(`listening on ${port}`));
