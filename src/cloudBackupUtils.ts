import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const db = getFirestore();
const storage = getStorage();

export async function backupCollectionToCloud(companyId: string, collectionName: string) {
  const snapshot = await getDocs(collection(db, 'companies', companyId, collectionName));
  const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const storageRef = ref(storage, `backups/${companyId}/${collectionName}_${Date.now()}.json`);
  await uploadBytes(storageRef, blob);
  return getDownloadURL(storageRef);
}
