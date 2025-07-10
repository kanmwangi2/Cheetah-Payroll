"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const payroll_1 = require("../payroll");
const defaultBrackets = [
    { min: 0, max: 60000, rate: 0 },
    { min: 60001, max: 100000, rate: 10 },
    { min: 100001, max: 200000, rate: 20 },
    { min: 200001, max: null, rate: 30 }
];
const defaultPension = { employee: 6, employer: 8 };
const defaultMaternity = { employee: 0.3, employer: 0.3 };
const defaultCBHI = { employee: 0.5, employer: 0 };
const defaultRAMA = { employee: 7.5, employer: 7.5 };
const PayrollList = ({ companyId }) => {
    const [payrolls, setPayrolls] = (0, react_1.useState)([]);
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [error, setError] = (0, react_1.useState)(null);
    const [refresh, setRefresh] = (0, react_1.useState)(0);
    const [form, setForm] = (0, react_1.useState)({ gross: '', basic: '', transport: '', otherDeductions: '' });
    const [result, setResult] = (0, react_1.useState)(null);
    (0, react_1.useEffect)(() => {
        (0, payroll_1.getPayrolls)(companyId)
            .then(setPayrolls)
            .catch(e => setError(e.message || 'Failed to load payrolls'))
            .finally(() => setLoading(false));
    }, [companyId, refresh]);
    const handleChange = (field, value) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };
    const handleCalculate = () => {
        const gross = parseFloat(form.gross);
        const basic = parseFloat(form.basic);
        const transport = parseFloat(form.transport);
        const otherDeductions = parseFloat(form.otherDeductions) || 0;
        const result = (0, payroll_1.calculatePayroll)({
            gross,
            basic,
            transport,
            brackets: defaultBrackets,
            pensionRates: defaultPension,
            maternityRates: defaultMaternity,
            cbhiRates: defaultCBHI,
            ramaRates: defaultRAMA,
            otherDeductions
        });
        setResult(result);
    };
    const handleCreate = async () => {
        try {
            await (0, payroll_1.createPayroll)(companyId, { ...form, ...result });
            setRefresh(r => r + 1);
            setForm({ gross: '', basic: '', transport: '', otherDeductions: '' });
            setResult(null);
        }
        catch (err) {
            setError(err.message || 'Failed to create payroll');
        }
    };
    if (loading)
        return (0, jsx_runtime_1.jsx)("div", { children: "Loading payrolls..." });
    if (error)
        return (0, jsx_runtime_1.jsx)("div", { style: { color: 'red' }, children: error });
    return ((0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("h2", { children: "Payrolls" }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("h3", { children: "Create Payroll" }), (0, jsx_runtime_1.jsx)("input", { placeholder: "Gross Pay", value: form.gross, onChange: e => handleChange('gross', e.target.value), required: true }), (0, jsx_runtime_1.jsx)("input", { placeholder: "Basic Pay", value: form.basic, onChange: e => handleChange('basic', e.target.value), required: true }), (0, jsx_runtime_1.jsx)("input", { placeholder: "Transport Allowance", value: form.transport, onChange: e => handleChange('transport', e.target.value) }), (0, jsx_runtime_1.jsx)("input", { placeholder: "Other Deductions", value: form.otherDeductions, onChange: e => handleChange('otherDeductions', e.target.value) }), (0, jsx_runtime_1.jsx)("button", { onClick: handleCalculate, children: "Calculate" }), result && ((0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("h4", { children: "Calculation Result" }), (0, jsx_runtime_1.jsx)("pre", { children: JSON.stringify(result, null, 2) }), (0, jsx_runtime_1.jsx)("button", { onClick: handleCreate, children: "Save Payroll" })] }))] }), (0, jsx_runtime_1.jsx)("h3", { children: "Payroll List" }), payrolls.length === 0 ? ((0, jsx_runtime_1.jsx)("div", { children: "No payrolls found." })) : ((0, jsx_runtime_1.jsxs)("table", { children: [(0, jsx_runtime_1.jsx)("thead", { children: (0, jsx_runtime_1.jsxs)("tr", { children: [(0, jsx_runtime_1.jsx)("th", { children: "Gross" }), (0, jsx_runtime_1.jsx)("th", { children: "Net" }), (0, jsx_runtime_1.jsx)("th", { children: "PAYE" }), (0, jsx_runtime_1.jsx)("th", { children: "Pension (Emp/Er)" }), (0, jsx_runtime_1.jsx)("th", { children: "Maternity (Emp/Er)" }), (0, jsx_runtime_1.jsx)("th", { children: "RAMA (Emp/Er)" }), (0, jsx_runtime_1.jsx)("th", { children: "CBHI" })] }) }), (0, jsx_runtime_1.jsx)("tbody", { children: payrolls.map(p => ((0, jsx_runtime_1.jsxs)("tr", { children: [(0, jsx_runtime_1.jsx)("td", { children: p.gross }), (0, jsx_runtime_1.jsx)("td", { children: p.finalNet }), (0, jsx_runtime_1.jsx)("td", { children: p.paye }), (0, jsx_runtime_1.jsxs)("td", { children: [p.pensionEmployee, " / ", p.pensionEmployer] }), (0, jsx_runtime_1.jsxs)("td", { children: [p.maternityEmployee, " / ", p.maternityEmployer] }), (0, jsx_runtime_1.jsxs)("td", { children: [p.ramaEmployee, " / ", p.ramaEmployer] }), (0, jsx_runtime_1.jsx)("td", { children: p.cbhiEmployee })] }, p.id))) })] }))] }));
};
exports.default = PayrollList;
