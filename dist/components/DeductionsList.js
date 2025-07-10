"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const deductions_1 = require("../deductions");
const DeductionsForm_1 = __importDefault(require("./DeductionsForm"));
const DeductionsImportExport_1 = __importDefault(require("./DeductionsImportExport"));
const DeductionsList = ({ companyId }) => {
    const [deductions, setDeductions] = (0, react_1.useState)([]);
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [error, setError] = (0, react_1.useState)(null);
    const [refresh, setRefresh] = (0, react_1.useState)(0);
    (0, react_1.useEffect)(() => {
        (0, deductions_1.getDeductions)(companyId)
            .then(setDeductions)
            .catch(e => setError(e.message || 'Failed to load deductions'))
            .finally(() => setLoading(false));
    }, [companyId, refresh]);
    if (loading)
        return (0, jsx_runtime_1.jsx)("div", { children: "Loading deductions..." });
    if (error)
        return (0, jsx_runtime_1.jsx)("div", { style: { color: 'red' }, children: error });
    return ((0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("h2", { children: "Deductions" }), (0, jsx_runtime_1.jsx)(DeductionsForm_1.default, { companyId: companyId, onAdded: () => setRefresh(r => r + 1) }), (0, jsx_runtime_1.jsx)(DeductionsImportExport_1.default, { companyId: companyId, onImported: () => setRefresh(r => r + 1), deductions: deductions }), deductions.length === 0 ? ((0, jsx_runtime_1.jsx)("div", { children: "No deductions found." })) : ((0, jsx_runtime_1.jsxs)("table", { children: [(0, jsx_runtime_1.jsx)("thead", { children: (0, jsx_runtime_1.jsxs)("tr", { children: [(0, jsx_runtime_1.jsx)("th", { children: "Type" }), (0, jsx_runtime_1.jsx)("th", { children: "Amount" }), (0, jsx_runtime_1.jsx)("th", { children: "Employee" }), (0, jsx_runtime_1.jsx)("th", { children: "Balance" })] }) }), (0, jsx_runtime_1.jsx)("tbody", { children: deductions.map(d => ((0, jsx_runtime_1.jsxs)("tr", { children: [(0, jsx_runtime_1.jsx)("td", { children: d.type }), (0, jsx_runtime_1.jsx)("td", { children: d.amount }), (0, jsx_runtime_1.jsx)("td", { children: d.staff_id }), (0, jsx_runtime_1.jsx)("td", { children: d.balance })] }, d.id))) })] }))] }));
};
exports.default = DeductionsList;
