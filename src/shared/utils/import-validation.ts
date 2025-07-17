/**
 * Import validation utilities for CSV/Excel data
 * Handles common import validation scenarios including boolean parsing
 */

/**
 * Validates if a value can be considered a boolean (from CSV/Excel import)
 * Accepts: true, false, 'true', 'false', 'TRUE', 'FALSE', 'yes', 'no', 'YES', 'NO', '1', '0'
 */
export function isValidBoolean(value: any): boolean {
  if (typeof value === 'boolean') {
    return true;
  }
  if (typeof value === 'string') {
    const normalized = value.toLowerCase().trim();
    return normalized === 'true' || normalized === 'false' || 
           normalized === 'yes' || normalized === 'no' || 
           normalized === '1' || normalized === '0';
  }
  return false;
}

/**
 * Parses various boolean representations to actual boolean values
 * Returns true for: true, 'true', 'TRUE', 'yes', 'YES', '1'
 * Returns false for: false, 'false', 'FALSE', 'no', 'NO', '0'
 */
export function parseBoolean(value: any): boolean {
  if (typeof value === 'boolean') {
    return value;
  }
  if (typeof value === 'string') {
    const normalized = value.toLowerCase().trim();
    return normalized === 'true' || normalized === 'yes' || normalized === '1';
  }
  return false;
}

/**
 * Validates if a value is a valid number (from CSV/Excel import)
 */
export function isValidNumber(value: any): boolean {
  if (typeof value === 'number') {
    return !isNaN(value);
  }
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed !== '' && !isNaN(Number(trimmed));
  }
  return false;
}

/**
 * Parses various number representations to actual numbers
 */
export function parseNumber(value: any): number {
  if (typeof value === 'number') {
    return value;
  }
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return Number(trimmed);
  }
  return NaN;
}

/**
 * Validates if a value is a valid email address
 */
export function isValidEmail(value: any): boolean {
  if (typeof value !== 'string') {
    return false;
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(value.trim());
}

/**
 * Validates if a value is a non-empty string
 */
export function isValidString(value: any): boolean {
  return typeof value === 'string' && value.trim() !== '';
}

/**
 * Validates if a value is in a list of allowed values
 */
export function isValidEnum(value: any, allowedValues: string[]): boolean {
  return typeof value === 'string' && allowedValues.includes(value.toLowerCase().trim());
}

/**
 * Common validation result type
 */
export interface ImportValidationResult {
  isValid: boolean;
  errors: string[];
  sanitizedData?: Record<string, any>;
}

/**
 * Validates required fields in a row
 */
export function validateRequiredFields(row: Record<string, any>, requiredFields: string[]): string[] {
  const errors: string[] = [];
  
  for (const field of requiredFields) {
    if (!row[field] || String(row[field]).trim() === '') {
      errors.push(`Missing required field "${field}"`);
    }
  }
  
  return errors;
}

/**
 * Creates a detailed validation error message for boolean fields
 */
export function createBooleanValidationError(fieldName: string, value: any): string {
  return `❌ BOOLEAN ERROR: Column '${fieldName}' must be a boolean value.
  
  ✅ ACCEPTED VALUES: 
  • TRUE, true, True, YES, yes, Yes, 1
  • FALSE, false, False, NO, no, No, 0
  
  ❌ YOUR VALUE: ${JSON.stringify(value)}
  
  💡 TIP: If using Excel, make sure the cell is formatted as TEXT, not as a formula or number.`;
}

/**
 * Creates a detailed validation error message for number fields
 */
export function createNumberValidationError(fieldName: string, value: any, constraint?: string): string {
  const constraintText = constraint ? ` (${constraint})` : '';
  return `❌ NUMBER ERROR: Column '${fieldName}' must be a valid number${constraintText}.
  
  ❌ YOUR VALUE: ${JSON.stringify(value)}
  
  💡 TIP: Make sure there are no spaces, currency symbols, or text in the number field.`;
}

/**
 * Creates a detailed validation error message for enum fields
 */
export function createEnumValidationError(fieldName: string, value: any, allowedValues: string[]): string {
  return `❌ ENUM ERROR: Column '${fieldName}' must be one of the allowed values.
  
  ✅ ALLOWED VALUES: ${allowedValues.join(', ')}
  
  ❌ YOUR VALUE: ${JSON.stringify(value)}
  
  💡 TIP: Check for typos and ensure exact spelling (case-sensitive).`;
}

/**
 * Common date validation (supports DD/MM/YYYY and YYYY-MM-DD formats)
 */
export function isValidDate(value: any): boolean {
  if (typeof value !== 'string') {
    return false;
  }
  
  const trimmed = value.trim();
  
  // Check DD/MM/YYYY format
  const ddmmyyyyRegex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
  const ddmmyyyyMatch = trimmed.match(ddmmyyyyRegex);
  if (ddmmyyyyMatch) {
    const [, day, month, year] = ddmmyyyyMatch;
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    return date.getFullYear() === parseInt(year) && 
           date.getMonth() === parseInt(month) - 1 && 
           date.getDate() === parseInt(day);
  }
  
  // Check YYYY-MM-DD format
  const yyyymmddRegex = /^(\d{4})-(\d{2})-(\d{2})$/;
  const yyyymmddMatch = trimmed.match(yyyymmddRegex);
  if (yyyymmddMatch) {
    const [, year, month, day] = yyyymmddMatch;
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    return date.getFullYear() === parseInt(year) && 
           date.getMonth() === parseInt(month) - 1 && 
           date.getDate() === parseInt(day);
  }
  
  return false;
}

/**
 * Batch validation utility for import operations
 */
export function validateImportBatch<T>(
  rows: Record<string, any>[],
  validator: (row: Record<string, any>, index: number) => ImportValidationResult,
  entityType: string
): {
  validRows: T[];
  errors: Array<{ row: number; error: string }>;
  successCount: number;
} {
  const validRows: T[] = [];
  const errors: Array<{ row: number; error: string }> = [];
  let successCount = 0;
  
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const validation = validator(row, i);
    
    if (validation.isValid && validation.sanitizedData) {
      validRows.push(validation.sanitizedData as T);
      successCount++;
    } else {
      validation.errors.forEach(error => {
        errors.push({ row: i + 2, error }); // +2 because row 1 is headers, arrays are 0-indexed
      });
    }
  }
  
  return {
    validRows,
    errors,
    successCount
  };
}