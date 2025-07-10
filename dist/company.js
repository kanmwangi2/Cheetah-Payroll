"use strict";
// Company and user management logic
// Firestore integration for CRUD operations
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCompaniesForUser = getCompaniesForUser;
exports.createCompany = createCompany;
exports.updateCompany = updateCompany;
exports.deleteCompany = deleteCompany;
exports.getCompany = getCompany;
exports.getUsersForCompany = getUsersForCompany;
exports.createUser = createUser;
exports.updateUser = updateUser;
exports.deleteUser = deleteUser;
const firestore_1 = require("firebase/firestore");
const db = (0, firestore_1.getFirestore)();
async function getCompaniesForUser(userId) {
    const q = (0, firestore_1.query)((0, firestore_1.collection)(db, 'companies'), (0, firestore_1.where)('userIds', 'array-contains', userId));
    const snapshot = await (0, firestore_1.getDocs)(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}
async function createCompany(data) {
    return (0, firestore_1.addDoc)((0, firestore_1.collection)(db, 'companies'), data);
}
async function updateCompany(companyId, data) {
    return (0, firestore_1.updateDoc)((0, firestore_1.doc)(db, 'companies', companyId), data);
}
async function deleteCompany(companyId) {
    return (0, firestore_1.deleteDoc)((0, firestore_1.doc)(db, 'companies', companyId));
}
async function getCompany(companyId) {
    const d = await (0, firestore_1.getDoc)((0, firestore_1.doc)(db, 'companies', companyId));
    return d.exists() ? { id: d.id, ...d.data() } : null;
}
// User management (simplified)
async function getUsersForCompany(companyId) {
    const snapshot = await (0, firestore_1.getDocs)((0, firestore_1.collection)(db, 'companies', companyId, 'users'));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}
async function createUser(companyId, data) {
    return (0, firestore_1.addDoc)((0, firestore_1.collection)(db, 'companies', companyId, 'users'), data);
}
async function updateUser(companyId, userId, data) {
    return (0, firestore_1.updateDoc)((0, firestore_1.doc)(db, 'companies', companyId, 'users', userId), data);
}
async function deleteUser(companyId, userId) {
    return (0, firestore_1.deleteDoc)((0, firestore_1.doc)(db, 'companies', companyId, 'users', userId));
}
