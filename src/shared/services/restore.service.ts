import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { getStorage, ref, getDownloadURL } from 'firebase/storage';

const db = getFirestore();
const storage = getStorage();

export async function restoreCollectionFromCloud(
  companyId: string,
  collectionName: string,
  backupPath: string
) {
  // Download backup JSON from Cloud Storage
  const storageRef = ref(storage, backupPath);
  const url = await getDownloadURL(storageRef);
  const resp = await fetch(url);
  const data = await resp.json();
  // Restore each document
  for (const docData of data) {
    const { id, ...fields } = docData;
    await setDoc(doc(db, 'companies', companyId, collectionName, id), fields, { merge: true });
  }
}
