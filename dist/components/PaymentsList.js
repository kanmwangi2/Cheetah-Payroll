"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const payments_1 = require("../payments");
const PaymentsForm_1 = __importDefault(require("./PaymentsForm"));
const PaymentsImportExport_1 = __importDefault(require("./PaymentsImportExport"));
const PaymentsList = ({ companyId }) => {
    const [payments, setPayments] = (0, react_1.useState)([]);
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [error, setError] = (0, react_1.useState)(null);
    const [refresh, setRefresh] = (0, react_1.useState)(0);
    (0, react_1.useEffect)(() => {
        (0, payments_1.getPayments)(companyId)
            .then(setPayments)
            .catch(e => setError(e.message || 'Failed to load payments'))
            .finally(() => setLoading(false));
    }, [companyId, refresh]);
    if (loading)
        return (0, jsx_runtime_1.jsx)("div", { children: "Loading payments..." });
    if (error)
        return (0, jsx_runtime_1.jsx)("div", { style: { color: 'red' }, children: error });
    return ((0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("h2", { children: "Payments" }), (0, jsx_runtime_1.jsx)(PaymentsForm_1.default, { companyId: companyId, onAdded: () => setRefresh(r => r + 1) }), (0, jsx_runtime_1.jsx)(PaymentsImportExport_1.default, { companyId: companyId, onImported: () => setRefresh(r => r + 1), payments: payments }), payments.length === 0 ? ((0, jsx_runtime_1.jsx)("div", { children: "No payments found." })) : ((0, jsx_runtime_1.jsxs)("table", { children: [(0, jsx_runtime_1.jsx)("thead", { children: (0, jsx_runtime_1.jsxs)("tr", { children: [(0, jsx_runtime_1.jsx)("th", { children: "Type" }), (0, jsx_runtime_1.jsx)("th", { children: "Amount" }), (0, jsx_runtime_1.jsx)("th", { children: "Employee" }), (0, jsx_runtime_1.jsx)("th", { children: "Gross/Net" }), (0, jsx_runtime_1.jsx)("th", { children: "Effective Dates" })] }) }), (0, jsx_runtime_1.jsx)("tbody", { children: payments.map(p => ((0, jsx_runtime_1.jsxs)("tr", { children: [(0, jsx_runtime_1.jsx)("td", { children: p.type }), (0, jsx_runtime_1.jsx)("td", { children: p.amount }), (0, jsx_runtime_1.jsx)("td", { children: p.staff_id }), (0, jsx_runtime_1.jsx)("td", { children: p.is_gross ? 'Gross' : 'Net' }), (0, jsx_runtime_1.jsx)("td", { children: p.effective_date })] }, p.id))) })] }))] }));
};
exports.default = PaymentsList;
