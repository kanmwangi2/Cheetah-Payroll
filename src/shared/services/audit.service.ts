import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../core/config/firebase.config';

export async function logAuditAction({
  companyId,
  userId,
  entityType,
  entityId,
  action,
  details = {},
}: {
  companyId: string;
  userId: string;
  entityType: string;
  entityId: string;
  action: string;
  details?: any;
}) {
  if (!companyId) {
    throw new Error('Company ID is required for audit logging');
  }
  
  await addDoc(collection(db, 'companies', companyId, 'audit_logs'), {
    userId,
    entityType,
    entityId,
    action,
    details,
    timestamp: serverTimestamp(),
  });
}
