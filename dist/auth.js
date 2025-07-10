"use strict";
// Authentication and role-based access logic
// This will use Firebase Authentication for user login and JWT/session management
Object.defineProperty(exports, "__esModule", { value: true });
exports.auth = void 0;
exports.login = login;
exports.logout = logout;
exports.onUserChanged = onUserChanged;
const app_1 = require("firebase/app");
const auth_1 = require("firebase/auth");
const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID,
    // ...other config as needed
};
const app = (0, app_1.initializeApp)(firebaseConfig);
const auth = (0, auth_1.getAuth)(app);
exports.auth = auth;
function login(email, password) {
    return (0, auth_1.signInWithEmailAndPassword)(auth, email, password);
}
function logout() {
    return (0, auth_1.signOut)(auth);
}
function onUserChanged(callback) {
    return (0, auth_1.onAuthStateChanged)(auth, callback);
}
