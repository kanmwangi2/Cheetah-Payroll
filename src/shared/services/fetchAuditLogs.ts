import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../../core/config/firebase.config';

export async function fetchAuditLogs(companyId: string, entityType?: string, entityId?: string) {
  if (!companyId) {
    throw new Error('Company ID is required for fetching audit logs');
  }
  
  let q = query(
    collection(db, 'companies', companyId, 'audit_logs'),
    orderBy('timestamp', 'desc')
  );
  
  // Add optional filters
  if (entityType) {
    q = query(q, where('entityType', '==', entityType));
  }
  
  if (entityId) {
    q = query(q, where('entityId', '==', entityId));
  }
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}
