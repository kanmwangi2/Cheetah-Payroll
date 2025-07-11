/**
 * AuthProvider Tests
 * Tests for the authentication provider component
 */

import React from 'react';
import { render, screen, waitFor } from '../../../shared/utils/test-utils';
import { AuthProvider, useAuthContext } from '../../../core/providers/AuthProvider';
import { auth } from '../../../core/config/firebase.config';
import { onUserChanged } from '../../../core/providers/auth.provider';
import { getUserProfile } from '../../../shared/services/user.service';

// Mock the auth provider service
jest.mock('../../../core/providers/auth.provider');
jest.mock('../../../shared/services/user.service');
jest.mock('../../../core/config/firebase.config', () => {
  const originalModule = jest.requireActual('../../../core/config/firebase.config');
  return {
    ...originalModule,
    auth: {
      onAuthStateChanged: jest.fn(),
    },
  };
});

const mockOnUserChanged = onUserChanged as jest.MockedFunction<typeof onUserChanged>;
const mockGetUserProfile = getUserProfile as jest.MockedFunction<typeof getUserProfile>;
const mockOnAuthStateChanged = (auth.onAuthStateChanged as jest.Mock);

// Test component to access auth context
const TestComponent = () => {
  const { user, loading, error } = useAuthContext();

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!user) return <div>No user</div>;

  return <div>User: {user.email}</div>;
};

describe('AuthProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should provide loading state initially', () => {
    mockOnAuthStateChanged.mockImplementation(() => () => {});
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should handle user authentication', async () => {
    const mockUnsubscribe = jest.fn();
    const mockUser = {
      uid: 'test-uid',
      email: 'test@example.com',
    };
    const mockProfile = {
      id: 'test-uid',
      email: 'test@example.com',
      name: 'Test User',
      role: 'company_admin' as const,
      companyIds: [],
      profileData: {},
    };

    mockOnAuthStateChanged.mockImplementation(callback => {
      setTimeout(() => callback(mockUser as any), 0);
      return mockUnsubscribe;
    });

    mockGetUserProfile.mockResolvedValue(mockProfile);

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Wait for the UI to update from loading to user
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });
    expect(screen.getByText('User: test@example.com')).toBeInTheDocument();
  });

  it('should handle user not authenticated', async () => {
    const mockUnsubscribe = jest.fn();

    mockOnAuthStateChanged.mockImplementation(callback => {
      setTimeout(() => callback(null), 0);
      return mockUnsubscribe;
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });
    expect(screen.getByText('No user')).toBeInTheDocument();
  });

  it('should handle user profile loading error', async () => {
    const mockUnsubscribe = jest.fn();
    const mockUser = {
      uid: 'test-uid',
      email: 'test@example.com',
    };

    mockOnAuthStateChanged.mockImplementation(callback => {
      setTimeout(() => callback(mockUser as any), 0);
      return mockUnsubscribe;
    });

    mockGetUserProfile.mockRejectedValue(new Error('Profile loading failed'));

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });
    expect(screen.getByText('Error: Profile loading failed')).toBeInTheDocument();
  });
});
