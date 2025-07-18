
import React from 'react';
import { render, screen } from '@testing-library/react';

// Mock Firebase Firestore
jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn(),
  collection: jest.fn(),
  doc: jest.fn(),
  getDocs: jest.fn(),
  addDoc: jest.fn(),
  updateDoc: jest.fn(),
  deleteDoc: jest.fn(),
  getDoc: jest.fn()
}));

// Mock getStaff to return valid staff data
jest.mock('../features/staff/services/staff.service', () => ({
  getStaff: jest.fn(() => Promise.resolve({
    success: true,
    data: [
      { id: '1', name: 'John Doe', position: 'Manager', companyId: 'demo-company' },
      { id: '2', name: 'Jane Smith', position: 'Developer', companyId: 'demo-company' },
    ]
  })),
}));

// Mock useAuth to provide a valid companyId
jest.mock('../shared/hooks/useAuth', () => ({
  useAuth: () => ({
    user: { uid: 'test-user', companyId: 'demo-company' },
    isAuthenticated: true,
    loading: false,
  }),
}));


import StaffList from '../features/staff/components/StaffList';
import ThemeProvider from '../core/providers/ThemeProvider';

describe('StaffList', () => {
  it('renders staff list and search', async () => {
    render(
      <ThemeProvider>
        <StaffList companyId="demo-company" />
      </ThemeProvider>
    );
    expect(await screen.findByText(/Staff Management/i)).toBeInTheDocument();
    expect(await screen.findByPlaceholderText(/Search by name, ID, email, phone.../i)).toBeInTheDocument();
  });
});
