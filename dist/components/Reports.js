"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const firestore_1 = require("firebase/firestore");
const papaparse_1 = __importDefault(require("papaparse"));
const db = (0, firestore_1.getFirestore)();
async function fetchCollection(companyId, sub) {
    const snapshot = await (0, firestore_1.getDocs)((0, firestore_1.collection)(db, 'companies', companyId, sub));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}
const Reports = ({ companyId }) => {
    const [loading, setLoading] = (0, react_1.useState)(false);
    const [error, setError] = (0, react_1.useState)(null);
    const handleExport = async (type) => {
        setLoading(true);
        setError(null);
        try {
            const data = await fetchCollection(companyId, type);
            const csv = papaparse_1.default.unparse(data);
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${type}_report.csv`;
            a.click();
            URL.revokeObjectURL(url);
        }
        catch (err) {
            setError(err.message || 'Export failed');
        }
        finally {
            setLoading(false);
        }
    };
    return ((0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("h2", { children: "Reports" }), (0, jsx_runtime_1.jsx)("button", { onClick: () => handleExport('payrolls'), disabled: loading, children: "Export Payrolls" }), (0, jsx_runtime_1.jsx)("button", { onClick: () => handleExport('staff'), disabled: loading, children: "Export Staff" }), (0, jsx_runtime_1.jsx)("button", { onClick: () => handleExport('payments'), disabled: loading, children: "Export Payments" }), (0, jsx_runtime_1.jsx)("button", { onClick: () => handleExport('deductions'), disabled: loading, children: "Export Deductions" }), error && (0, jsx_runtime_1.jsx)("div", { style: { color: 'red' }, children: error })] }));
};
exports.default = Reports;
