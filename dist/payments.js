"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPayments = getPayments;
exports.createPayment = createPayment;
exports.updatePayment = updatePayment;
exports.deletePayment = deletePayment;
exports.getPayment = getPayment;
// Payments management logic (CRUD, import/export)
const firestore_1 = require("firebase/firestore");
const db = (0, firestore_1.getFirestore)();
async function getPayments(companyId) {
    const snapshot = await (0, firestore_1.getDocs)((0, firestore_1.collection)(db, 'companies', companyId, 'payments'));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}
async function createPayment(companyId, data) {
    return (0, firestore_1.addDoc)((0, firestore_1.collection)(db, 'companies', companyId, 'payments'), data);
}
async function updatePayment(companyId, paymentId, data) {
    return (0, firestore_1.updateDoc)((0, firestore_1.doc)(db, 'companies', companyId, 'payments', paymentId), data);
}
async function deletePayment(companyId, paymentId) {
    return (0, firestore_1.deleteDoc)((0, firestore_1.doc)(db, 'companies', companyId, 'payments', paymentId));
}
async function getPayment(companyId, paymentId) {
    const d = await (0, firestore_1.getDoc)((0, firestore_1.doc)(db, 'companies', companyId, 'payments', paymentId));
    return d.exists() ? { id: d.id, ...d.data() } : null;
}
