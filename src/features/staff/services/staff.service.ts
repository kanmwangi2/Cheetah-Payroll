/**
 * Staff Service with Enhanced Error Handling
 * Provides CRUD operations for staff management with comprehensive error handling
 */

import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
} from 'firebase/firestore';
import { db } from '../../../core/config/firebase.config';
import { withErrorHandling, createServiceFunction, validators, ServiceResult } from '../../../shared/utils/service-wrapper';
import { logger } from '../../../shared/utils/logger';
import { logAuditAction } from '../../../shared/services/audit.service';

// Types
export interface Staff {
  id?: string;
  staffNumber: string;
  name: string;
  email: string;
  phone?: string;
  position: string;
  department?: string;
  salary: number;
  startDate: string;
  endDate?: string;
  status: 'active' | 'inactive';
  [key: string]: any;
}

export interface StaffInput {
  staffNumber: string;
  name: string;
  email: string;
  phone?: string;
  position: string;
  department?: string;
  salary: number;
  startDate: string;
  endDate?: string;
  status?: 'active' | 'inactive';
}

// Validation functions
const validateStaffInput = (data: StaffInput): string | null => {
  return validators.combine(
    () => validators.required(data.staffNumber, 'Staff Number'),
    () => validators.required(data.name, 'Name'),
    () => validators.required(data.email, 'Email'),
    () => validators.email(data.email),
    () => validators.required(data.position, 'Position'),
    () => validators.required(data.salary, 'Salary'),
    () => validators.numeric(data.salary, 'Salary'),
    () => validators.positive(data.salary, 'Salary'),
    () => validators.required(data.startDate, 'Start Date')
  );
};

const validateCompanyAndStaffIds = (companyId: string, staffId?: string): string | null => {
  return validators.combine(
    () => validators.companyId(companyId),
    () => staffId ? validators.required(staffId, 'Staff ID') : null
  );
};

// Enhanced service functions
export const getStaff = createServiceFunction(
  async (companyId: string): Promise<Staff[]> => {
    const snapshot = await getDocs(collection(db, 'companies', companyId, 'staff'));
    return snapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data() 
    } as Staff));
  },
  {
    logOperation: 'Get staff list',
    validateInput: (args) => validators.companyId(args[0]),
    retries: 2,
  }
);

export const createStaff = createServiceFunction(
  async ({ companyId, data, userId }: { companyId: string; data: StaffInput; userId?: string }): Promise<{ id: string }> => {
    // Add default status and timestamp
    const staffData = {
      ...data,
      status: data.status || 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const docRef = await addDoc(collection(db, 'companies', companyId, 'staff'), staffData);
    
    // Log audit action
    if (userId) {
      await logAuditAction({
        companyId,
        userId,
        entityType: 'staff',
        entityId: docRef.id,
        action: 'create',
        details: { name: data.name, staffNumber: data.staffNumber, position: data.position },
      });
    }
    
    return { id: docRef.id };
  },
  {
    logOperation: 'Create staff member',
    validateInput: ({ companyId, data }) => {
      const companyError = validators.companyId(companyId);
      if (companyError) {return companyError;}
      return validateStaffInput(data);
    },
    retries: 1,
  }
);

export const updateStaff = createServiceFunction(
  async ({ companyId, staffId, data, userId }: { companyId: string; staffId: string; data: Partial<StaffInput>; userId?: string }): Promise<void> => {
    // Add timestamp
    const updateData = {
      ...data,
      updatedAt: new Date().toISOString(),
    };

    await updateDoc(doc(db, 'companies', companyId, 'staff', staffId), updateData);
    
    // Log audit action
    if (userId) {
      await logAuditAction({
        companyId,
        userId,
        entityType: 'staff',
        entityId: staffId,
        action: 'update',
        details: { changes: Object.keys(data) },
      });
    }
  },
  {
    logOperation: 'Update staff member',
    validateInput: ({ companyId, staffId, data }) => {
      const idsError = validateCompanyAndStaffIds(companyId, staffId);
      if (idsError) {return idsError;}
      
      // Validate only provided fields
      if (data.email && validators.email(data.email)) {
        return validators.email(data.email);
      }
      if (data.salary !== undefined) {
        const salaryError = validators.numeric(data.salary, 'Salary') || validators.positive(data.salary, 'Salary');
        if (salaryError) {return salaryError;}
      }
      return null;
    },
    retries: 1,
  }
);

export const deleteStaff = createServiceFunction(
  async ({ companyId, staffId, userId }: { companyId: string; staffId: string; userId?: string }): Promise<void> => {
    // Get staff info before deletion for audit
    const staffDoc = await getDoc(doc(db, 'companies', companyId, 'staff', staffId));
    const staffData = staffDoc.exists() ? staffDoc.data() : null;
    
    await deleteDoc(doc(db, 'companies', companyId, 'staff', staffId));
    
    // Log audit action
    if (userId) {
      await logAuditAction({
        companyId,
        userId,
        entityType: 'staff',
        entityId: staffId,
        action: 'delete',
        details: { name: staffData?.name, staffNumber: staffData?.staffNumber },
      });
    }
  },
  {
    logOperation: 'Delete staff member',
    validateInput: ({ companyId, staffId }) => validateCompanyAndStaffIds(companyId, staffId),
    retries: 1,
  }
);

export const getStaffProfile = createServiceFunction(
  async ({ companyId, staffId }: { companyId: string; staffId: string }): Promise<Staff | null> => {
    const docSnapshot = await getDoc(doc(db, 'companies', companyId, 'staff', staffId));
    
    if (!docSnapshot.exists()) {
      return null;
    }
    
    return { 
      id: docSnapshot.id, 
      ...docSnapshot.data() 
    } as Staff;
  },
  {
    logOperation: 'Get staff profile',
    validateInput: ({ companyId, staffId }) => validateCompanyAndStaffIds(companyId, staffId),
    retries: 2,
  }
);

// Legacy wrapper functions for backward compatibility
export async function getStaffLegacy(companyId: string): Promise<any[]> {
  const result = await getStaff(companyId);
  if (!result.success) {
    throw new Error(result.error || 'Failed to get staff');
  }
  return result.data || [];
}

export async function createStaffLegacy(companyId: string, data: any, userId?: string): Promise<any> {
  const result = await createStaff({ companyId, data, userId });
  if (!result.success) {
    throw new Error(result.error || 'Failed to create staff');
  }
  return result.data;
}

export async function updateStaffLegacy(companyId: string, staffId: string, data: any, userId?: string): Promise<void> {
  const result = await updateStaff({ companyId, staffId, data, userId });
  if (!result.success) {
    throw new Error(result.error || 'Failed to update staff');
  }
}

export async function deleteStaffLegacy(companyId: string, staffId: string, userId?: string): Promise<void> {
  const result = await deleteStaff({ companyId, staffId, userId });
  if (!result.success) {
    throw new Error(result.error || 'Failed to delete staff');
  }
}

export async function getStaffProfileLegacy(companyId: string, staffId: string): Promise<any> {
  const result = await getStaffProfile({ companyId, staffId });
  if (!result.success) {
    throw new Error(result.error || 'Failed to get staff profile');
  }
  return result.data;
}