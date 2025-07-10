"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDeductions = getDeductions;
exports.createDeduction = createDeduction;
exports.updateDeduction = updateDeduction;
exports.deleteDeduction = deleteDeduction;
exports.getDeduction = getDeduction;
// Deductions management logic (CRUD, import/export)
const firestore_1 = require("firebase/firestore");
const db = (0, firestore_1.getFirestore)();
async function getDeductions(companyId) {
    const snapshot = await (0, firestore_1.getDocs)((0, firestore_1.collection)(db, 'companies', companyId, 'deductions'));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}
async function createDeduction(companyId, data) {
    return (0, firestore_1.addDoc)((0, firestore_1.collection)(db, 'companies', companyId, 'deductions'), data);
}
async function updateDeduction(companyId, deductionId, data) {
    return (0, firestore_1.updateDoc)((0, firestore_1.doc)(db, 'companies', companyId, 'deductions', deductionId), data);
}
async function deleteDeduction(companyId, deductionId) {
    return (0, firestore_1.deleteDoc)((0, firestore_1.doc)(db, 'companies', companyId, 'deductions', deductionId));
}
async function getDeduction(companyId, deductionId) {
    const d = await (0, firestore_1.getDoc)((0, firestore_1.doc)(db, 'companies', companyId, 'deductions', deductionId));
    return d.exists() ? { id: d.id, ...d.data() } : null;
}
