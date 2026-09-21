export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public errors: string[] = [],
  ) {
    super();
  }
}
