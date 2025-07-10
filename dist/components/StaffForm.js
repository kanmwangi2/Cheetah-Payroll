"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const staff_1 = require("../staff");
const initialState = {
    personalDetails: {
        firstName: '',
        lastName: '',
        idNumber: '',
        rssbNumber: '',
        dateOfBirth: '',
        gender: '',
        maritalStatus: '',
        phone: '',
        email: '',
        address: '',
        emergencyContact: '',
    },
    employmentDetails: {
        startDate: '',
        position: '',
        employmentType: '',
        department: '',
    },
    bankDetails: {
        bankName: '',
        accountNumber: '',
    },
};
const StaffForm = ({ companyId, onAdded }) => {
    const [form, setForm] = (0, react_1.useState)(initialState);
    const [loading, setLoading] = (0, react_1.useState)(false);
    const [error, setError] = (0, react_1.useState)(null);
    const handleChange = (section, field, value) => {
        setForm((prev) => ({
            ...prev,
            [section]: {
                ...prev[section],
                [field]: value,
            },
        }));
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            await (0, staff_1.createStaff)(companyId, form);
            setForm(initialState);
            onAdded();
        }
        catch (err) {
            setError(err.message || 'Failed to add staff');
        }
        finally {
            setLoading(false);
        }
    };
    return ((0, jsx_runtime_1.jsxs)("form", { onSubmit: handleSubmit, children: [(0, jsx_runtime_1.jsx)("h3", { children: "Add Staff" }), (0, jsx_runtime_1.jsx)("input", { placeholder: "First Name", value: form.personalDetails.firstName, onChange: e => handleChange('personalDetails', 'firstName', e.target.value), required: true }), (0, jsx_runtime_1.jsx)("input", { placeholder: "Last Name", value: form.personalDetails.lastName, onChange: e => handleChange('personalDetails', 'lastName', e.target.value), required: true }), (0, jsx_runtime_1.jsx)("input", { placeholder: "ID/Passport Number", value: form.personalDetails.idNumber, onChange: e => handleChange('personalDetails', 'idNumber', e.target.value), required: true }), (0, jsx_runtime_1.jsx)("input", { placeholder: "RSSB Number", value: form.personalDetails.rssbNumber, onChange: e => handleChange('personalDetails', 'rssbNumber', e.target.value), required: true }), (0, jsx_runtime_1.jsx)("input", { placeholder: "Department", value: form.employmentDetails.department, onChange: e => handleChange('employmentDetails', 'department', e.target.value), required: true }), (0, jsx_runtime_1.jsx)("button", { type: "submit", disabled: loading, children: loading ? 'Adding...' : 'Add Staff' }), error && (0, jsx_runtime_1.jsx)("div", { style: { color: 'red' }, children: error })] }));
};
exports.default = StaffForm;
