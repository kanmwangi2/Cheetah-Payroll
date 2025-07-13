/**
 * Security Utilities
 * Provides security-related functions for input validation and sanitization
 */

import { logger } from './logger';

// Input validation patterns
const VALIDATION_PATTERNS = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^\+?[\d\s-()]{10,}$/,
  alphanumeric: /^[a-zA-Z0-9]+$/,
  alphanumericWithSpaces: /^[a-zA-Z0-9\s]+$/,
  numbersOnly: /^\d+$/,
  currency: /^\d+(\.\d{1,2})?$/,
} as const;

// Common SQL injection patterns to detect
const SQL_INJECTION_PATTERNS = [
  /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/i,
  /(\b(OR|AND)\s+\d+\s*=\s*\d+)/i,
  /(\b(OR|AND)\s+\d+\s*=\s*\d+\s*(--|#))/i,
  /(\b(OR|AND)\s+['"]?\d+['"]?\s*=\s*['"]?\d+['"]?)/i,
  /(\/\*[\s\S]*?\*\/)/,
  /(\b(XP_|SP_)\w+)/i,
];

// XSS patterns to detect
const XSS_PATTERNS = [
  /<script[\s\S]*?>[\s\S]*?<\/script>/i,
  /<iframe[\s\S]*?>[\s\S]*?<\/iframe>/i,
  /<object[\s\S]*?>[\s\S]*?<\/object>/i,
  /<embed[\s\S]*?>/i,
  /<form[\s\S]*?>[\s\S]*?<\/form>/i,
  /on\w+\s*=\s*["'][^"']*["']/i,
  /javascript:/i,
  /vbscript:/i,
  /data:text\/html/i,
];

/**
 * Validates input against common patterns
 */
export const validateInput = (value: string, type: keyof typeof VALIDATION_PATTERNS): boolean => {
  if (typeof value !== 'string') {
    logger.warn('Invalid input type for validation', { value, type });
    return false;
  }

  const pattern = VALIDATION_PATTERNS[type];
  return pattern.test(value);
};

/**
 * Sanitizes string input by removing potentially dangerous characters
 */
export const sanitizeString = (input: string): string => {
  if (typeof input !== 'string') {
    logger.warn('Invalid input type for sanitization', { input });
    return '';
  }

  return input
    .replace(/[<>]/g, '') // Remove < and > characters
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/vbscript:/gi, '') // Remove vbscript: protocol
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .trim();
};

/**
 * Detects potential SQL injection attempts
 */
export const detectSqlInjection = (input: string): boolean => {
  if (typeof input !== 'string') {
    return false;
  }

  const detectedPatterns = SQL_INJECTION_PATTERNS.filter(pattern => pattern.test(input));

  if (detectedPatterns.length > 0) {
    logger.warn('Potential SQL injection detected', {
      input: input.substring(0, 100), // Log first 100 chars only
      patterns: detectedPatterns.length,
    });
    return true;
  }

  return false;
};

/**
 * Detects potential XSS attempts
 */
export const detectXss = (input: string): boolean => {
  if (typeof input !== 'string') {
    return false;
  }

  const detectedPatterns = XSS_PATTERNS.filter(pattern => pattern.test(input));

  if (detectedPatterns.length > 0) {
    logger.warn('Potential XSS detected', {
      input: input.substring(0, 100), // Log first 100 chars only
      patterns: detectedPatterns.length,
    });
    return true;
  }

  return false;
};

/**
 * Validates and sanitizes user input
 */
export const secureInput = (
  input: string,
  options: {
    maxLength?: number;
    allowHtml?: boolean;
    validationType?: keyof typeof VALIDATION_PATTERNS;
  } = {}
): { isValid: boolean; sanitized: string; errors: string[] } => {
  const errors: string[] = [];
  let sanitized = input;

  // Check for null/undefined
  if (input === null || input === undefined) {
    errors.push('Input cannot be null or undefined');
    return { isValid: false, sanitized: '', errors };
  }

  // Convert to string if not already
  if (typeof input !== 'string') {
    sanitized = String(input);
  }

  // Check length
  if (options.maxLength && sanitized.length > options.maxLength) {
    errors.push(`Input exceeds maximum length of ${options.maxLength}`);
    sanitized = sanitized.substring(0, options.maxLength);
  }

  // Detect malicious patterns
  if (detectSqlInjection(sanitized)) {
    errors.push('Potential SQL injection detected');
  }

  if (detectXss(sanitized)) {
    errors.push('Potential XSS detected');
  }

  // Validate against pattern if specified
  if (options.validationType && !validateInput(sanitized, options.validationType)) {
    errors.push(`Input does not match required pattern: ${options.validationType}`);
  }

  // Sanitize if HTML is not allowed
  if (!options.allowHtml) {
    sanitized = sanitizeString(sanitized);
  }

  return {
    isValid: errors.length === 0,
    sanitized,
    errors,
  };
};

/**
 * Generates a secure random string
 */
export const generateSecureToken = (length: number = 32): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';

  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return result;
};

/**
 * Rate limiting helper
 */
export class RateLimiter {
  private attempts: Map<string, number[]> = new Map();
  private maxAttempts: number;
  private windowMs: number;

  constructor(maxAttempts: number = 5, windowMs: number = 15 * 60 * 1000) {
    this.maxAttempts = maxAttempts;
    this.windowMs = windowMs;
  }

  isAllowed(identifier: string): boolean {
    const now = Date.now();
    const attempts = this.attempts.get(identifier) || [];

    // Remove old attempts outside the window
    const recentAttempts = attempts.filter(time => now - time < this.windowMs);

    // Update attempts
    this.attempts.set(identifier, recentAttempts);

    // Check if allowed
    if (recentAttempts.length >= this.maxAttempts) {
      logger.warn('Rate limit exceeded', { identifier, attempts: recentAttempts.length });
      return false;
    }

    return true;
  }

  recordAttempt(identifier: string): void {
    const now = Date.now();
    const attempts = this.attempts.get(identifier) || [];
    attempts.push(now);
    this.attempts.set(identifier, attempts);
  }

  reset(identifier: string): void {
    this.attempts.delete(identifier);
  }
}

// Export a default rate limiter instance
export const defaultRateLimiter = new RateLimiter();
