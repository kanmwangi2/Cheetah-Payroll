/**
 * Testing Utilities
 * Custom render functions and utilities for testing React components
 */

import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { AppProvider } from '../../core/providers/AppProvider';

// Mock Firebase for testing
jest.mock('../../core/config/firebase.config', () => ({
  auth: {
    onAuthStateChanged: jest.fn(),
    signInWithEmailAndPassword: jest.fn(),
    createUserWithEmailAndPassword: jest.fn(),
    signOut: jest.fn(),
    sendPasswordResetEmail: jest.fn(),
  },
  db: {
    collection: jest.fn(),
    doc: jest.fn(),
    getDocs: jest.fn(),
    getDoc: jest.fn(),
    setDoc: jest.fn(),
    updateDoc: jest.fn(),
    deleteDoc: jest.fn(),
    addDoc: jest.fn(),
  },
}));

// Mock logger for testing
jest.mock('../utils/logger', () => ({
  logger: {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

// Custom render function with providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return <AppProvider>{children}</AppProvider>;
};

const customRender = (ui: ReactElement, options?: Omit<RenderOptions, 'wrapper'>) =>
  render(ui, { wrapper: AllTheProviders, ...options });

// Re-export everything
export * from '@testing-library/react';
export { customRender as render };

// Common test utilities
export const createMockUser = (overrides = {}) => ({
  id: 'test-user-id',
  email: 'test@example.com',
  name: 'Test User',
  role: 'company_admin' as const,
  companyIds: ['test-company-id'],
  profileData: {},
  ...overrides,
});

export const createMockCompany = (overrides = {}) => ({
  id: 'test-company-id',
  name: 'Test Company',
  userIds: ['test-user-id'],
  ...overrides,
});

// Mock Firebase Auth User
export const createMockFirebaseUser = (overrides = {}) => ({
  uid: 'test-user-id',
  email: 'test@example.com',
  displayName: 'Test User',
  ...overrides,
});

// Test data factories
export const TestDataFactory = {
  user: createMockUser,
  company: createMockCompany,
  firebaseUser: createMockFirebaseUser,
};
