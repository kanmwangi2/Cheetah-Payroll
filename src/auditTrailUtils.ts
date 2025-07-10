import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';

const db = getFirestore();

export async function logAuditAction({
  userId,
  entityType,
  entityId,
  action,
  details = {},
}: {
  userId: string;
  entityType: string;
  entityId: string;
  action: string;
  details?: any;
}) {
  await addDoc(collection(db, 'audit_logs'), {
    userId,
    entityType,
    entityId,
    action,
    details,
    timestamp: serverTimestamp(),
  });
}
