"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStaff = getStaff;
exports.createStaff = createStaff;
exports.updateStaff = updateStaff;
exports.deleteStaff = deleteStaff;
exports.getStaffProfile = getStaffProfile;
// Staff management logic (CRUD, import/export)
const firestore_1 = require("firebase/firestore");
const db = (0, firestore_1.getFirestore)();
async function getStaff(companyId) {
    const snapshot = await (0, firestore_1.getDocs)((0, firestore_1.collection)(db, 'companies', companyId, 'staff'));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}
async function createStaff(companyId, data) {
    return (0, firestore_1.addDoc)((0, firestore_1.collection)(db, 'companies', companyId, 'staff'), data);
}
async function updateStaff(companyId, staffId, data) {
    return (0, firestore_1.updateDoc)((0, firestore_1.doc)(db, 'companies', companyId, 'staff', staffId), data);
}
async function deleteStaff(companyId, staffId) {
    return (0, firestore_1.deleteDoc)((0, firestore_1.doc)(db, 'companies', companyId, 'staff', staffId));
}
async function getStaffProfile(companyId, staffId) {
    const d = await (0, firestore_1.getDoc)((0, firestore_1.doc)(db, 'companies', companyId, 'staff', staffId));
    return d.exists() ? { id: d.id, ...d.data() } : null;
}
