import { logger } from './logger';

export class AppError extends Error {
  constructor(
    message: string,
    public code?: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export function handleError(error: unknown, context?: string): string {
  const contextStr = context ? `[${context}] ` : '';

  if (error instanceof AppError) {
    logger.error(`${contextStr}${error.message}`, { code: error.code, statusCode: error.statusCode });
    return error.message;
  }

  if (error instanceof Error) {
    logger.error(`${contextStr}${error.message}`, error);
    return error.message;
  }

  if (typeof error === 'string') {
    logger.error(`${contextStr}${error}`);
    return error;
  }

  const message = 'An unexpected error occurred';
  logger.error(`${contextStr}${message}`, error);
  return message;
}

export async function withErrorHandling<T>(
  fn: () => Promise<T>,
  context?: string
): Promise<{ data: T | null; error: string | null }> {
  try {
    const data = await fn();
    return { data, error: null };
  } catch (error) {
    const errorMessage = handleError(error, context);
    return { data: null, error: errorMessage };
  }
}
