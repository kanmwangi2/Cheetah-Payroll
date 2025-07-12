/**
 * Security Middleware
 * Provides security middleware for API requests and form submissions
 */

import {
  secureInput,
  detectSqlInjection,
  detectXss,
  defaultRateLimiter,
} from '../../shared/utils/security';
import { logger } from '../../shared/utils/logger';

interface SecurityOptions {
  enableRateLimiting?: boolean;
  enableInputValidation?: boolean;
  enableXssProtection?: boolean;
  enableSqlInjectionProtection?: boolean;
  maxInputLength?: number;
  rateLimit?: {
    maxAttempts: number;
    windowMs: number;
  };
}

/**
 * Security middleware for form submissions
 */
export const securityMiddleware = (options: SecurityOptions = {}) => {
  const {
    enableRateLimiting = true,
    enableInputValidation = true,
    enableXssProtection = true,
    enableSqlInjectionProtection = true,
    maxInputLength = 10000,
  } = options;

  return (formData: Record<string, unknown>, userIdentifier: string) => {
    const errors: string[] = [];
    const sanitizedData: Record<string, unknown> = {};

    // Rate limiting
    if (enableRateLimiting) {
      if (!defaultRateLimiter.isAllowed(userIdentifier)) {
        errors.push('Rate limit exceeded. Please try again later.');
        logger.warn('Form submission blocked due to rate limiting', { userIdentifier });
        return { isValid: false, data: {}, errors };
      }
      defaultRateLimiter.recordAttempt(userIdentifier);
    }

    // Process each field
    for (const [key, value] of Object.entries(formData)) {
      if (typeof value === 'string') {
        // Input validation and sanitization
        if (enableInputValidation) {
          const validation = secureInput(value, {
            maxLength: maxInputLength,
            allowHtml: false,
          });

          if (!validation.isValid) {
            errors.push(`Invalid input in field '${key}': ${validation.errors.join(', ')}`);
            logger.warn('Input validation failed', {
              field: key,
              errors: validation.errors,
              userIdentifier,
            });
          }

          sanitizedData[key] = validation.sanitized;
        } else {
          sanitizedData[key] = value;
        }

        // XSS protection
        if (enableXssProtection && detectXss(value)) {
          errors.push(`Potential XSS detected in field '${key}'`);
          logger.warn('XSS attempt detected', { field: key, userIdentifier });
        }

        // SQL injection protection
        if (enableSqlInjectionProtection && detectSqlInjection(value)) {
          errors.push(`Potential SQL injection detected in field '${key}'`);
          logger.warn('SQL injection attempt detected', { field: key, userIdentifier });
        }
      } else {
        // Non-string values pass through as-is
        sanitizedData[key] = value;
      }
    }

    const isValid = errors.length === 0;

    if (!isValid) {
      logger.warn('Form submission blocked by security middleware', {
        errors: errors.length,
        userIdentifier,
      });
    }

    return {
      isValid,
      data: sanitizedData,
      errors,
    };
  };
};

/**
 * Content Security Policy headers
 */
export const getCSPHeaders = () => {
  const cspDirectives = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.gstatic.com https://apis.google.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https:",
    "connect-src 'self' https://firestore.googleapis.com https://identitytoolkit.googleapis.com",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ];

  return {
    'Content-Security-Policy': cspDirectives.join('; '),
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
  };
};

/**
 * Validates file uploads
 */
export const validateFileUpload = (file: File): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  // Size limits (10MB max)
  const maxSize = 10 * 1024 * 1024;
  if (file.size > maxSize) {
    errors.push('File size exceeds maximum limit of 10MB');
  }

  // Allowed file types
  const allowedTypes = [
    'text/csv',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/gif',
  ];

  if (!allowedTypes.includes(file.type)) {
    errors.push('File type not allowed');
  }

  // Check file extension
  const allowedExtensions = ['.csv', '.xls', '.xlsx', '.pdf', '.jpg', '.jpeg', '.png', '.gif'];
  const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));

  if (!allowedExtensions.includes(fileExtension)) {
    errors.push('File extension not allowed');
  }

  const isValid = errors.length === 0;

  if (!isValid) {
    logger.warn('File upload validation failed', {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      errors,
    });
  }

  return { isValid, errors };
};

export default securityMiddleware;
