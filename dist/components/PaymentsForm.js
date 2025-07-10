"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const payments_1 = require("../payments");
const initialState = {
    type: '',
    amount: '',
    staff_id: '',
    is_gross: true,
    effective_date: '',
};
const PaymentsForm = ({ companyId, onAdded }) => {
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
            await (0, payments_1.createPayment)(companyId, form);
            setForm(initialState);
            onAdded();
        }
        catch (err) {
            setError(err.message || 'Failed to add payment');
        }
        finally {
            setLoading(false);
        }
    };
    return ((0, jsx_runtime_1.jsxs)("form", { onSubmit: handleSubmit, children: [(0, jsx_runtime_1.jsx)("h3", { children: "Add Payment" }), (0, jsx_runtime_1.jsx)("input", { placeholder: "Type", value: form.type, onChange: e => handleChange('type', e.target.value), required: true }), (0, jsx_runtime_1.jsx)("input", { placeholder: "Amount", value: form.amount, onChange: e => handleChange('amount', e.target.value), required: true }), (0, jsx_runtime_1.jsx)("input", { placeholder: "Employee ID", value: form.staff_id, onChange: e => handleChange('staff_id', e.target.value), required: true }), (0, jsx_runtime_1.jsxs)("label", { children: [(0, jsx_runtime_1.jsx)("input", { type: "checkbox", checked: form.is_gross, onChange: e => handleChange('is_gross', e.target.checked) }), " Gross"] }), (0, jsx_runtime_1.jsx)("input", { placeholder: "Effective Date", value: form.effective_date, onChange: e => handleChange('effective_date', e.target.value), required: true }), (0, jsx_runtime_1.jsx)("button", { type: "submit", disabled: loading, children: loading ? 'Adding...' : 'Add Payment' }), error && (0, jsx_runtime_1.jsx)("div", { style: { color: 'red' }, children: error })] }));
};
exports.default = PaymentsForm;
