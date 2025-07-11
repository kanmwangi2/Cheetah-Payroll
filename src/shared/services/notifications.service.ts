import { useEffect, useState } from 'react';
import {
  getFirestore,
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore';

const db = getFirestore();

export function useNotifications(userId: string) {
  const [notifications, setNotifications] = useState<any[]>([]);
  useEffect(() => {
    if (!userId) return;
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const unsub = onSnapshot(q, snap => {
      setNotifications(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsub();
  }, [userId]);
  return notifications;
}

export async function sendNotification({
  userId,
  message,
  type = 'info',
}: {
  userId: string;
  message: string;
  type?: string;
}) {
  await addDoc(collection(db, 'notifications'), {
    userId,
    message,
    type,
    createdAt: serverTimestamp(),
    read: false,
  });
}
