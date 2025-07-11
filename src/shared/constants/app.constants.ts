/**
 * Application Constants
 * Centralized constants for the entire application
 */

export const APP_CONSTANTS = {
  // Application metadata
  APP_NAME: 'Cheetah Payroll',
  APP_VERSION: '1.0.0',
  APP_DESCRIPTION: 'Unified full-stack payroll management app for Rwanda',

  // API endpoints
  API_ENDPOINTS: {
    USERS: '/api/users',
    COMPANIES: '/api/companies',
    STAFF: '/api/staff',
    PAYMENTS: '/api/payments',
    DEDUCTIONS: '/api/deductions',
    PAYROLL: '/api/payroll',
    REPORTS: '/api/reports',
  },

  // User roles
  USER_ROLES: {
    PRIMARY_ADMIN: 'primary_admin',
    APP_ADMIN: 'app_admin',
    COMPANY_ADMIN: 'company_admin',
    PAYROLL_APPROVER: 'payroll_approver',
    PAYROLL_PREPARER: 'payroll_preparer',
  } as const,

  // Permissions
  PERMISSIONS: {
    VIEW_DASHBOARD: 'view_dashboard',
    MANAGE_STAFF: 'manage_staff',
    MANAGE_PAYMENTS: 'manage_payments',
    MANAGE_DEDUCTIONS: 'manage_deductions',
    PROCESS_PAYROLL: 'process_payroll',
    APPROVE_PAYROLL: 'approve_payroll',
    VIEW_REPORTS: 'view_reports',
    EXPORT_DATA: 'export_data',
    IMPORT_DATA: 'import_data',
    MANAGE_COMPANIES: 'manage_companies',
    MANAGE_USERS: 'manage_users',
    SYSTEM_ADMIN: 'system_admin',
  } as const,

  // File upload limits
  FILE_UPLOAD: {
    MAX_SIZE: 10 * 1024 * 1024, // 10MB
    ALLOWED_TYPES: [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/gif',
    ],
    ALLOWED_EXTENSIONS: ['.csv', '.xls', '.xlsx', '.pdf', '.jpg', '.jpeg', '.png', '.gif'],
  },

  // Validation limits
  VALIDATION: {
    MAX_INPUT_LENGTH: 10000,
    MAX_STRING_LENGTH: 255,
    MAX_TEXT_LENGTH: 5000,
    MIN_PASSWORD_LENGTH: 8,
    MAX_PASSWORD_LENGTH: 128,
    MAX_FILE_SIZE: 10 * 1024 * 1024,
  },

  // Rate limiting
  RATE_LIMITING: {
    MAX_ATTEMPTS: 5,
    WINDOW_MS: 15 * 60 * 1000, // 15 minutes
    LOGIN_MAX_ATTEMPTS: 3,
    LOGIN_WINDOW_MS: 10 * 60 * 1000, // 10 minutes
  },

  // Pagination
  PAGINATION: {
    DEFAULT_PAGE_SIZE: 20,
    MAX_PAGE_SIZE: 100,
  },

  // Date formats
  DATE_FORMATS: {
    DISPLAY: 'MMM dd, yyyy',
    INPUT: 'yyyy-MM-dd',
    API: 'yyyy-MM-dd',
    TIMESTAMP: 'yyyy-MM-dd HH:mm:ss',
  },

  // Currency
  CURRENCY: {
    CODE: 'RWF',
    SYMBOL: 'RWF',
    DECIMAL_PLACES: 2,
  },

  // Tax rates (Rwanda specific)
  TAX_RATES: {
    PAYE: {
      BRACKETS: [
        { min: 0, max: 360000, rate: 0 },
        { min: 360001, max: 1200000, rate: 0.2 },
        { min: 1200001, max: Infinity, rate: 0.3 },
      ],
    },
    PENSION: 0.03, // 3%
    MATERNITY: 0.003, // 0.3%
    CBHI: 0.01, // 1%
    RAMA: 0.01, // 1%
  },

  // Local storage keys
  STORAGE_KEYS: {
    THEME: 'theme',
    USER_PREFERENCES: 'user_preferences',
    COMPANY_SELECTION: 'selected_company',
    DASHBOARD_LAYOUT: 'dashboard_layout',
  },

  // Theme options
  THEMES: {
    LIGHT: 'light',
    DARK: 'dark',
    SYSTEM: 'system',
  } as const,

  // HTTP status codes
  HTTP_STATUS: {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    UNPROCESSABLE_ENTITY: 422,
    TOO_MANY_REQUESTS: 429,
    INTERNAL_SERVER_ERROR: 500,
  },

  // Error messages
  ERROR_MESSAGES: {
    GENERIC: 'An unexpected error occurred. Please try again.',
    NETWORK: 'Network error. Please check your connection.',
    UNAUTHORIZED: 'You are not authorized to perform this action.',
    VALIDATION: 'Please check your input and try again.',
    RATE_LIMIT: 'Too many requests. Please try again later.',
    FILE_SIZE: 'File size exceeds the maximum limit.',
    FILE_TYPE: 'File type is not supported.',
  },

  // Success messages
  SUCCESS_MESSAGES: {
    SAVE: 'Data saved successfully.',
    DELETE: 'Data deleted successfully.',
    IMPORT: 'Data imported successfully.',
    EXPORT: 'Data exported successfully.',
    EMAIL_SENT: 'Email sent successfully.',
    PASSWORD_RESET: 'Password reset email sent.',
  },

  // Loading messages
  LOADING_MESSAGES: {
    GENERIC: 'Loading...',
    AUTHENTICATING: 'Authenticating...',
    SAVING: 'Saving...',
    DELETING: 'Deleting...',
    IMPORTING: 'Importing...',
    EXPORTING: 'Exporting...',
    PROCESSING: 'Processing...',
  },
} as const;

// Type definitions for constants
export type UserRole = (typeof APP_CONSTANTS.USER_ROLES)[keyof typeof APP_CONSTANTS.USER_ROLES];
export type Permission = (typeof APP_CONSTANTS.PERMISSIONS)[keyof typeof APP_CONSTANTS.PERMISSIONS];
export type Theme = (typeof APP_CONSTANTS.THEMES)[keyof typeof APP_CONSTANTS.THEMES];

export default APP_CONSTANTS;
