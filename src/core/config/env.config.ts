/**
 * Environment Configuration
 * Centralizes all environment variable access and validation
 */

export interface AppConfig {
  isDevelopment: boolean;
  isProduction: boolean;
  isTest: boolean;
  firebase: {
    apiKey: string;
    authDomain: string;
    projectId: string;
    storageBucket: string;
    messagingSenderId: string;
    appId: string;
  };
  app: {
    name: string;
    version: string;
    baseUrl: string;
  };
  logging: {
    level: 'debug' | 'info' | 'warn' | 'error';
    enableConsole: boolean;
  };
}

const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  REACT_APP_FIREBASE_API_KEY: process.env.REACT_APP_FIREBASE_API_KEY,
  REACT_APP_FIREBASE_AUTH_DOMAIN: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  REACT_APP_FIREBASE_PROJECT_ID: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  REACT_APP_FIREBASE_STORAGE_BUCKET: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  REACT_APP_FIREBASE_MESSAGING_SENDER_ID: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  REACT_APP_FIREBASE_APP_ID: process.env.REACT_APP_FIREBASE_APP_ID,
  REACT_APP_VERSION: process.env.REACT_APP_VERSION || '1.0.0',
  REACT_APP_BASE_URL: process.env.REACT_APP_BASE_URL || 'http://localhost:3000',
};

function validateEnv(): void {
  const required = [
    'REACT_APP_FIREBASE_API_KEY',
    'REACT_APP_FIREBASE_AUTH_DOMAIN',
    'REACT_APP_FIREBASE_PROJECT_ID',
    'REACT_APP_FIREBASE_STORAGE_BUCKET',
    'REACT_APP_FIREBASE_MESSAGING_SENDER_ID',
    'REACT_APP_FIREBASE_APP_ID',
  ];

  for (const key of required) {
    if (!env[key as keyof typeof env]) {
      throw new Error(`Missing required environment variable: ${key}`);
    }
  }
}

export function getConfig(): AppConfig {
  validateEnv();

  return {
    isDevelopment: env.NODE_ENV === 'development',
    isProduction: env.NODE_ENV === 'production',
    isTest: env.NODE_ENV === 'test',
    firebase: {
      apiKey: env.REACT_APP_FIREBASE_API_KEY!,
      authDomain: env.REACT_APP_FIREBASE_AUTH_DOMAIN!,
      projectId: env.REACT_APP_FIREBASE_PROJECT_ID!,
      storageBucket: env.REACT_APP_FIREBASE_STORAGE_BUCKET!,
      messagingSenderId: env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID!,
      appId: env.REACT_APP_FIREBASE_APP_ID!,
    },
    app: {
      name: 'Cheetah Payroll',
      version: env.REACT_APP_VERSION!,
      baseUrl: env.REACT_APP_BASE_URL!,
    },
    logging: {
      level: env.NODE_ENV === 'production' ? 'warn' : 'debug',
      enableConsole: env.NODE_ENV !== 'production',
    },
  };
}

export const config = getConfig();
