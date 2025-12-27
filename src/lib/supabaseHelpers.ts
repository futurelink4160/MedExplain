import { PostgrestError } from '@supabase/supabase-js';
import { logger } from '../utils/logger';
import { AppError } from '../utils/errorHandler';

export interface DatabaseResult<T> {
  data: T | null;
  error: string | null;
}

export function handleSupabaseError(error: PostgrestError | null, context?: string): string | null {
  if (!error) return null;

  const contextStr = context ? `[${context}] ` : '';
  const message = `${contextStr}Database error: ${error.message}`;

  logger.error(message, {
    code: error.code,
    details: error.details,
    hint: error.hint,
  });

  return error.message;
}

export async function withDatabaseErrorHandling<T>(
  operation: () => Promise<{ data: T | null; error: PostgrestError | null }>,
  context?: string
): Promise<DatabaseResult<T>> {
  try {
    const { data, error } = await operation();

    if (error) {
      const errorMessage = handleSupabaseError(error, context);
      return { data: null, error: errorMessage };
    }

    return { data, error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'An unexpected error occurred';
    logger.error(`${context ? `[${context}] ` : ''}Unexpected error:`, err);
    return { data: null, error: message };
  }
}

export function throwIfError(error: PostgrestError | null, context?: string): void {
  if (error) {
    const errorMessage = handleSupabaseError(error, context);
    throw new AppError(errorMessage || 'Database operation failed', error.code);
  }
}
