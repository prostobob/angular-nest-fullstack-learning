import type { ZodSchema } from 'zod';
import express, { type NextFunction } from 'express';
import { ApiError } from '../errors/api-error.js';

export function validate(schema: ZodSchema) {
  return (req: express.Request, res: express.Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      return next(
        new ApiError(
          422,
          result.error.issues.map(i => i.message),
        ),
      );
    }

    next();
  };
}
