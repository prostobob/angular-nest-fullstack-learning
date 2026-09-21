import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

export function checkAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.headers.authorization) {
    return res.status(401).send('Not authorized');
  }

  if (!req.headers.authorization?.startsWith('Token')) {
    return res.status(401).send();
  }

  const token = req.headers.authorization?.slice(6)!;

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    req.userId = payload.userId;
  } catch {
    return res.status(401).send('Invalid token');
  }

  next();
}
