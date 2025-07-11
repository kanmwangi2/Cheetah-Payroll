import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';

jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn(),
  collection: jest.fn(),
  doc: jest.fn(),
  getDocs: jest.fn(() => Promise.resolve({ docs: [] })),
  addDoc: jest.fn(),
  updateDoc: jest.fn(),
  deleteDoc: jest.fn(),
  getDoc: jest.fn(),
}));

import StaffList from '../features/staff/components/StaffList';

describe('StaffList', () => {
  it('renders staff list and search', async () => {
    render(<StaffList companyId="test-company" />);
    expect(await screen.findByText(/Staff List/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Search staff/i)).toBeInTheDocument();
  });
});
