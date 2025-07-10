// Payroll engine logic (Rwanda tax, payroll creation, review, approval)
import { getFirestore, collection, doc, getDocs, addDoc, updateDoc, deleteDoc, getDoc } from 'firebase/firestore';

const db = getFirestore();

// Rwanda tax calculation helpers
export function calculatePAYE(gross: number, brackets: any[]): number {
  let tax = 0;
  let remaining = gross;
  for (const bracket of brackets) {
    const min = bracket.min;
    const max = bracket.max ?? Infinity;
    const rate = bracket.rate / 100;
    if (gross > min) {
      const taxable = Math.min(remaining, max - min + 1);
      tax += taxable * rate;
      remaining -= taxable;
      if (remaining <= 0) break;
    }
  }
  return Math.round(tax);
}

export function calculatePayroll({
  gross,
  basic,
  transport,
  brackets,
  pensionRates,
  maternityRates,
  cbhiRates,
  ramaRates,
  otherDeductions
}: any) {
  // 1. PAYE
  const paye = calculatePAYE(gross, brackets);
  // 2. Pension
  const pensionEmployee = gross * (pensionRates.employee / 100);
  const pensionEmployer = gross * (pensionRates.employer / 100);
  // 3. Maternity (exclude transport)
  const maternityBase = gross - (transport || 0);
  const maternityEmployee = maternityBase * (maternityRates.employee / 100);
  const maternityEmployer = maternityBase * (maternityRates.employer / 100);
  // 4. RAMA (basic only)
  const ramaEmployee = basic * (ramaRates.employee / 100);
  const ramaEmployer = basic * (ramaRates.employer / 100);
  // 5. Net salary before CBHI
  const netBeforeCBHI = gross - paye - pensionEmployee - maternityEmployee - ramaEmployee;
  // 6. CBHI (on net before CBHI)
  const cbhiEmployee = netBeforeCBHI * (cbhiRates.employee / 100);
  // 7. Final net
  const finalNet = netBeforeCBHI - cbhiEmployee - (otherDeductions || 0);
  return {
    paye,
    pensionEmployee,
    pensionEmployer,
    maternityEmployee,
    maternityEmployer,
    ramaEmployee,
    ramaEmployer,
    cbhiEmployee,
    finalNet
  };
}

// Payroll CRUD
export async function getPayrolls(companyId: string) {
  const snapshot = await getDocs(collection(db, 'companies', companyId, 'payrolls'));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function createPayroll(companyId: string, data: any) {
  return addDoc(collection(db, 'companies', companyId, 'payrolls'), data);
}

export async function updatePayroll(companyId: string, payrollId: string, data: any) {
  return updateDoc(doc(db, 'companies', companyId, 'payrolls', payrollId), data);
}

export async function deletePayroll(companyId: string, payrollId: string) {
  return deleteDoc(doc(db, 'companies', companyId, 'payrolls', payrollId));
}

export async function getPayroll(companyId: string, payrollId: string) {
  const d = await getDoc(doc(db, 'companies', companyId, 'payrolls', payrollId));
  return d.exists() ? { id: d.id, ...d.data() } : null;
}
