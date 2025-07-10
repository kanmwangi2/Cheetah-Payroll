"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const deductions_1 = require("../deductions");
const initialState = {
    type: '',
    amount: '',
    staff_id: '',
    balance: '',
};
const DeductionsForm = ({ companyId, onAdded }) => {
    const [form, setForm] = (0, react_1.useState)(initialState);
    const [loading, setLoading] = (0, react_1.useState)(false);
    const [error, setError] = (0, react_1.useState)(null);
    const handleChange = (field, value) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            await (0, deductions_1.createDeduction)(companyId, form);
            setForm(initialState);
            onAdded();
        }
        catch (err) {
            setError(err.message || 'Failed to add deduction');
        }
        finally {
            setLoading(false);
        }
    };
    return ((0, jsx_runtime_1.jsxs)("form", { onSubmit: handleSubmit, children: [(0, jsx_runtime_1.jsx)("h3", { children: "Add Deduction" }), (0, jsx_runtime_1.jsx)("input", { placeholder: "Type", value: form.type, onChange: e => handleChange('type', e.target.value), required: true }), (0, jsx_runtime_1.jsx)("input", { placeholder: "Amount", value: form.amount, onChange: e => handleChange('amount', e.target.value), required: true }), (0, jsx_runtime_1.jsx)("input", { placeholder: "Employee ID", value: form.staff_id, onChange: e => handleChange('staff_id', e.target.value), required: true }), (0, jsx_runtime_1.jsx)("input", { placeholder: "Balance", value: form.balance, onChange: e => handleChange('balance', e.target.value) }), (0, jsx_runtime_1.jsx)("button", { type: "submit", disabled: loading, children: loading ? 'Adding...' : 'Add Deduction' }), error && (0, jsx_runtime_1.jsx)("div", { style: { color: 'red' }, children: error })] }));
};
exports.default = DeductionsForm;
