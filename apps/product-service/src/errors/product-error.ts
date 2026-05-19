export class ProductError extends Error {
  constructor(
    message: string,
    public readonly statusCode = 400
  ) {
    super(message);
  }
}
