import { getFirestore, collection, query, where, getDocs, Timestamp } from 'firebase/firestore';

const db = getFirestore();

export async function fetchAuditLogs(entityType: string, entityId: string) {
  const q = query(
    collection(db, 'audit_logs'),
    where('entityType', '==', entityType),
    where('entityId', '==', entityId)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}
