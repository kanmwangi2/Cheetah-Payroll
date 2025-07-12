/**
 * Date utility functions for handling various date formats
 */

/**
 * Converts DD/MM/YYYY format to YYYY-MM-DD format
 * @param dateString - Date string in DD/MM/YYYY format
 * @returns Date string in YYYY-MM-DD format or null if invalid
 */
export const convertDDMMYYYYtoYYYYMMDD = (dateString: string): string | null => {
  if (!dateString || typeof dateString !== 'string') {
    return null;
  }

  // Remove any extra whitespace
  const cleanDateString = dateString.trim();
  
  // Check if it's already in YYYY-MM-DD format
  const isoDateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (isoDateRegex.test(cleanDateString)) {
    // Validate that it's a valid date
    const date = new Date(cleanDateString);
    if (!isNaN(date.getTime())) {
      return cleanDateString;
    }
    return null;
  }

  // Check for DD/MM/YYYY format
  const ddmmyyyyRegex = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
  const match = cleanDateString.match(ddmmyyyyRegex);
  
  if (!match) {
    return null;
  }

  const [, day, month, year] = match;
  
  // Validate day and month ranges
  const dayNum = parseInt(day, 10);
  const monthNum = parseInt(month, 10);
  const yearNum = parseInt(year, 10);
  
  if (dayNum < 1 || dayNum > 31 || monthNum < 1 || monthNum > 12) {
    return null;
  }
  
  // Pad with zeros if needed
  const paddedDay = day.padStart(2, '0');
  const paddedMonth = month.padStart(2, '0');
  
  // Create the ISO format date string
  const isoDateString = `${year}-${paddedMonth}-${paddedDay}`;
  
  // Validate that the date is actually valid (handles leap years, month day counts, etc.)
  const date = new Date(isoDateString);
  if (isNaN(date.getTime())) {
    return null;
  }
  
  // Ensure the date components match what we expect (to catch invalid dates like 31/02/2023)
  if (date.getFullYear() !== yearNum || 
      date.getMonth() !== monthNum - 1 || 
      date.getDate() !== dayNum) {
    return null;
  }
  
  return isoDateString;
};

/**
 * Validates if a date string is in YYYY-MM-DD format and is a valid date
 * @param dateString - Date string to validate
 * @returns true if valid YYYY-MM-DD date, false otherwise
 */
export const isValidISODate = (dateString: string): boolean => {
  if (!dateString || typeof dateString !== 'string') {
    return false;
  }

  const isoDateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!isoDateRegex.test(dateString.trim())) {
    return false;
  }

  const date = new Date(dateString.trim());
  return !isNaN(date.getTime());
};

/**
 * Formats a date string for display (converts YYYY-MM-DD to DD/MM/YYYY)
 * @param dateString - Date string in YYYY-MM-DD format
 * @returns Date string in DD/MM/YYYY format or original string if invalid
 */
export const formatDateForDisplay = (dateString: string): string => {
  if (!isValidISODate(dateString)) {
    return dateString;
  }

  const [year, month, day] = dateString.split('-');
  return `${parseInt(day, 10)}/${parseInt(month, 10)}/${year}`;
};

/**
 * Converts various date formats to YYYY-MM-DD format
 * Supports DD/MM/YYYY and already valid YYYY-MM-DD formats
 * @param dateString - Date string in various formats
 * @returns Date string in YYYY-MM-DD format or null if invalid
 */
export const normalizeDate = (dateString: string): string | null => {
  if (!dateString) {
    return null;
  }

  // Try to convert from DD/MM/YYYY first
  const converted = convertDDMMYYYYtoYYYYMMDD(dateString);
  if (converted) {
    return converted;
  }

  // Check if it's already a valid ISO date
  if (isValidISODate(dateString)) {
    return dateString.trim();
  }

  return null;
};