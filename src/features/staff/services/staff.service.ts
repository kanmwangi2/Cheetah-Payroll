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
import { createServiceFunction, validators } from '../../../shared/utils/service-wrapper';
import { logger } from '../../../shared/utils/logger';
import { logAuditAction } from '../../../shared/services/audit.service';
import { Staff, StaffInput } from '../../../shared/types';
import { validateStaffRecordAsStaff, validateAndFilterRecords, sanitizeFirestoreData } from '../../../shared/utils/data-validation';

// Validation functions
const validateStaffInput = (data: StaffInput): string | null => {
  return validators.combine(
    () => validators.required(data.staffNumber, 'Staff Number'),
    () => validators.required(data.name, 'Name'),
    () => validators.required(data.email, 'Email'),
    () => validators.email(data.email),
    () => validators.required(data.position, 'Position'),
    () => validators.required(data.startDate, 'Start Date')
  );
};

// Check for duplicate staff numbers or emails
const checkStaffUniqueness = async (companyId: string, staffNumber: string, email: string, excludeId?: string): Promise<string | null> => {
  try {
    const staffCollection = collection(db, 'companies', companyId, 'staff');
    const snapshot = await getDocs(staffCollection);
    
    for (const doc of snapshot.docs) {
      if (excludeId && doc.id === excludeId) {continue;}
      
      const data = doc.data();
      if (data.staffNumber === staffNumber) {
        return `Staff number ${staffNumber} already exists`;
      }
      if (data.email === email) {
        return `Email ${email} already exists`;
      }
    }
    return null;
  } catch (error) {
    logger.error('Error checking staff uniqueness', error as Error);
    return 'Unable to validate uniqueness';
  }
};

const validateCompanyAndStaffIds = (companyId: string, staffId?: string): string | null => {
  return validators.combine(
    () => validators.companyId(),
    () => staffId ? validators.required(staffId, 'Staff ID') : null
  );
};

// Enhanced service functions
export const getStaff = createServiceFunction(
  async (companyId: string): Promise<Staff[]> => {
    const snapshot = await getDocs(collection(db, 'companies', companyId, 'staff'));
    const rawData = snapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...sanitizeFirestoreData(doc.data())
    }));
    
    // Apply strict validation and filter out invalid records
    return validateAndFilterRecords<Staff>(rawData, validateStaffRecordAsStaff, 'Staff');
  },
  {
    logOperation: 'Get staff list',
    validateInput: () => validators.companyId(),
    retries: 2,
  }
);

export const createStaff = createServiceFunction(
  async ({ companyId, data, userId }: { companyId: string; data: StaffInput; userId?: string }): Promise<{ id: string }> => {
    // Check for uniqueness first
    const uniquenessError = await checkStaffUniqueness(companyId, data.staffNumber, data.email);
    if (uniquenessError) {
      throw new Error(uniquenessError);
    }

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
      const companyError = validators.companyId();
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

