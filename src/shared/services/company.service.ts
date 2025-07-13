// Company and user management logic
// Firestore integration for CRUD operations

import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  query,
  where,
} from 'firebase/firestore';
import { db } from '../../core/config/firebase.config';
import { createServiceFunction, validators } from '../utils/service-wrapper';
import { logger } from '../utils/logger';

export const getCompaniesForUser = createServiceFunction(
  async (userId: string) => {
    const q = query(collection(db, 'companies'), where('userIds', 'array-contains', userId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },
  {
    logOperation: 'Get companies for user',
    validateInput: (userId) => validators.required(userId, 'User ID'),
    retries: 2,
  }
);

export const createCompany = createServiceFunction(
  async (data: Record<string, any>) => {
    const companyData = {
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const docRef = await addDoc(collection(db, 'companies'), companyData);
    return { id: docRef.id };
  },
  {
    logOperation: 'Create company',
    validateInput: (data) => {
      if (!data.name) {return 'Company name is required';}
      if (!data.userIds || !Array.isArray(data.userIds)) {return 'User IDs array is required';}
      return null;
    },
    retries: 1,
  }
);

export const updateCompany = createServiceFunction(
  async ({ companyId, data }: { companyId: string; data: Record<string, any> }) => {
    const updateData = {
      ...data,
      updatedAt: new Date().toISOString(),
    };
    await updateDoc(doc(db, 'companies', companyId), updateData);
  },
  {
    logOperation: 'Update company',
    validateInput: ({ companyId, data }) => {
      if (!companyId) {return 'Company ID is required';}
      if (!data || typeof data !== 'object') {return 'Update data is required';}
      return null;
    },
    retries: 1,
  }
);

export const deleteCompany = createServiceFunction(
  async (companyId: string) => {
    await deleteDoc(doc(db, 'companies', companyId));
    logger.info('Company deleted successfully', { companyId });
  },
  {
    logOperation: 'Delete company',
    validateInput: (companyId) => validators.required(companyId, 'Company ID'),
    retries: 1,
  }
);

export const getCompany = createServiceFunction(
  async (companyId: string) => {
    const docSnapshot = await getDoc(doc(db, 'companies', companyId));
    return docSnapshot.exists() ? { id: docSnapshot.id, ...docSnapshot.data() } : null;
  },
  {
    logOperation: 'Get company details',
    validateInput: (companyId) => validators.required(companyId, 'Company ID'),
    retries: 2,
  }
);
// ...existing code...

// User management (simplified)
export const getUsersForCompany = createServiceFunction(
  async (companyId: string) => {
    const snapshot = await getDocs(collection(db, 'companies', companyId, 'users'));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },
  {
    logOperation: 'Get users for company',
    validateInput: (companyId) => validators.required(companyId, 'Company ID'),
    retries: 2,
  }
);

export const createUser = createServiceFunction(
  async ({ companyId, data }: { companyId: string; data: Record<string, any> }) => {
    const userData = {
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const docRef = await addDoc(collection(db, 'companies', companyId, 'users'), userData);
    return { id: docRef.id };
  },
  {
    logOperation: 'Create user',
    validateInput: ({ companyId, data }) => {
      if (!companyId) {return 'Company ID is required';}
      if (!data.email) {return 'User email is required';}
      if (!data.role) {return 'User role is required';}
      return null;
    },
    retries: 1,
  }
);

export const updateUser = createServiceFunction(
  async ({ companyId, userId, data }: { companyId: string; userId: string; data: Record<string, any> }) => {
    const updateData = {
      ...data,
      updatedAt: new Date().toISOString(),
    };
    await updateDoc(doc(db, 'companies', companyId, 'users', userId), updateData);
  },
  {
    logOperation: 'Update user',
    validateInput: ({ companyId, userId, data }) => {
      if (!companyId) {return 'Company ID is required';}
      if (!userId) {return 'User ID is required';}
      if (!data || typeof data !== 'object') {return 'Update data is required';}
      return null;
    },
    retries: 1,
  }
);

export const deleteUser = createServiceFunction(
  async ({ companyId, userId }: { companyId: string; userId: string }) => {
    await deleteDoc(doc(db, 'companies', companyId, 'users', userId));
    logger.info('User deleted successfully', { companyId, userId });
  },
  {
    logOperation: 'Delete user',
    validateInput: ({ companyId, userId }) => {
      if (!companyId) {return 'Company ID is required';}
      if (!userId) {return 'User ID is required';}
      return null;
    },
    retries: 1,
  }
);
// End of file
