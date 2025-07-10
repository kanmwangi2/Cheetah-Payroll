"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculatePAYE = calculatePAYE;
exports.calculatePayroll = calculatePayroll;
exports.getPayrolls = getPayrolls;
exports.createPayroll = createPayroll;
exports.updatePayroll = updatePayroll;
exports.deletePayroll = deletePayroll;
exports.getPayroll = getPayroll;
// Payroll engine logic (Rwanda tax, payroll creation, review, approval)
const firestore_1 = require("firebase/firestore");
const db = (0, firestore_1.getFirestore)();
// Rwanda tax calculation helpers
function calculatePAYE(gross, brackets) {
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
            if (remaining <= 0)
                break;
        }
    }
    return Math.round(tax);
}
function calculatePayroll({ gross, basic, transport, brackets, pensionRates, maternityRates, cbhiRates, ramaRates, otherDeductions }) {
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
async function getPayrolls(companyId) {
    const snapshot = await (0, firestore_1.getDocs)((0, firestore_1.collection)(db, 'companies', companyId, 'payrolls'));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}
async function createPayroll(companyId, data) {
    return (0, firestore_1.addDoc)((0, firestore_1.collection)(db, 'companies', companyId, 'payrolls'), data);
}
async function updatePayroll(companyId, payrollId, data) {
    return (0, firestore_1.updateDoc)((0, firestore_1.doc)(db, 'companies', companyId, 'payrolls', payrollId), data);
}
async function deletePayroll(companyId, payrollId) {
    return (0, firestore_1.deleteDoc)((0, firestore_1.doc)(db, 'companies', companyId, 'payrolls', payrollId));
}
async function getPayroll(companyId, payrollId) {
    const d = await (0, firestore_1.getDoc)((0, firestore_1.doc)(db, 'companies', companyId, 'payrolls', payrollId));
    return d.exists() ? { id: d.id, ...d.data() } : null;
}
