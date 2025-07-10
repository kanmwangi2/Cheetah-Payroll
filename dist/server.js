"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Entry point for backend API (Express + Firestore + Firebase Auth)
const express_1 = __importDefault(require("express"));
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Cheetah Payroll API running' });
});
// TODO: Add authentication, Firestore integration, and API routes
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`API server running on port ${PORT}`);
});
