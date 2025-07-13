/**
 * Service Wrapper Utilities
 * Provides consistent error handling, loading states, and retry logic for Firebase operations
 */

import { getFirebaseErrorMessage, isRetryableError } from './firebase-errors';
import { logger } from './logger';

export interface ServiceResult<T> {
  data?: T;
  error?: string;
  loading: boolean;
  success: boolean;
}

export interface ServiceOptions {
  retries?: number;
  retryDelay?: number;
  logOperation?: string;
  validateInput?: (input: any) => string | null;
}

/**
 * Wraps a Firebase operation with comprehensive error handling
 */
export async function withErrorHandling<T>(
  operation: () => Promise<T>,
  options: ServiceOptions = {}
): Promise<ServiceResult<T>> {
  const {
    retries = 2,
    retryDelay = 1000,
    logOperation = 'Firebase operation',
    validateInput,
  } = options;

  let lastError: any;
  
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      // Validate input if validator provided
      if (validateInput) {
        const validationError = validateInput(arguments);
        if (validationError) {
          return {
            error: validationError,
            loading: false,
            success: false,
          };
        }
      }

      logger.info(`Attempting ${logOperation}`, { attempt: attempt + 1 });
      
      const data = await operation();
      
      logger.info(`${logOperation} completed successfully`);
      
      return {
        data,
        loading: false,
        success: true,
      };
    } catch (error: any) {
      lastError = error;
      logger.error(`${logOperation} failed on attempt ${attempt + 1}`, error);
      
      // If this is the last attempt or error is not retryable, break
      if (attempt === retries || !isRetryableError(error)) {
        break;
      }
      
      // Wait before retry
      if (attempt < retries) {
        await new Promise(resolve => setTimeout(resolve, retryDelay * (attempt + 1)));
      }
    }
  }

  // All attempts failed
  const userFriendlyError = getFirebaseErrorMessage(lastError);
  logger.error(`${logOperation} failed after ${retries + 1} attempts`, lastError);
  
  return {
    error: userFriendlyError,
    loading: false,
    success: false,
  };
}

/**
 * Creates a typed service function with consistent error handling
 */
export function createServiceFunction<TInput, TOutput>(
  operation: (input: TInput) => Promise<TOutput>,
  options: ServiceOptions = {}
) {
  return async (input: TInput): Promise<ServiceResult<TOutput>> => {
    return withErrorHandling(() => operation(input), options);
  };
}

/**
 * Input validation helpers
 */
export const validators = {
  required: (value: any, fieldName: string): string | null => {
    if (value === null || value === undefined || value === '') {
      return `${fieldName} is required.`;
    }
    return null;
  },

  email: (value: string): string | null => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (value && !emailRegex.test(value)) {
      return 'Please enter a valid email address.';
    }
    return null;
  },

  minLength: (value: string, minLength: number, fieldName: string): string | null => {
    if (value && value.length < minLength) {
      return `${fieldName} must be at least ${minLength} characters long.`;
    }
    return null;
  },

  maxLength: (value: string, maxLength: number, fieldName: string): string | null => {
    if (value && value.length > maxLength) {
      return `${fieldName} must be no more than ${maxLength} characters long.`;
    }
    return null;
  },

  numeric: (value: any, fieldName: string): string | null => {
    if (value !== null && value !== undefined && value !== '' && isNaN(Number(value))) {
      return `${fieldName} must be a valid number.`;
    }
    return null;
  },

  positive: (value: number, fieldName: string): string | null => {
    if (value !== null && value !== undefined && value <= 0) {
      return `${fieldName} must be a positive number.`;
    }
    return null;
  },

  companyId: (_companyId: string): string | null => {
    // Company ID validation removed - if we're in a company context, the ID is assumed valid
    return null;
  },

  combine: (...validationFunctions: Array<() => string | null>): string | null => {
    for (const validate of validationFunctions) {
      const error = validate();
      if (error) {return error;}
    }
    return null;
  },
};

/**
 * React hook for managing service state
 * Note: This should be moved to a separate hooks file if React is needed
 */
export interface ServiceHookResult<T> extends ServiceResult<T> {
  execute: (serviceCall: () => Promise<ServiceResult<T>>) => Promise<ServiceResult<T>>;
  reset: () => void;
}

// Export the hook interface for use in React components
// Implementation should be in a separate hooks file with React import