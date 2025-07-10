import { getFirestore, doc, getDoc } from 'firebase/firestore';

const db = getFirestore();

export async function fetchPayroll(companyId: string, payrollId: string) {
  const d = await getDoc(doc(db, 'companies', companyId, 'payrolls', payrollId));
  return d.exists() ? { id: d.id, ...d.data() } : null;
}
