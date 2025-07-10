"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const staff_1 = require("../staff");
const StaffProfile = ({ companyId, staffId, onClose }) => {
    const [profile, setProfile] = (0, react_1.useState)(null);
    const [edit, setEdit] = (0, react_1.useState)(false);
    const [form, setForm] = (0, react_1.useState)(null);
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [error, setError] = (0, react_1.useState)(null);
    (0, react_1.useEffect)(() => {
        (0, staff_1.getStaffProfile)(companyId, staffId)
            .then(data => {
            setProfile(data);
            setForm(data);
        })
            .catch(e => setError(e.message || 'Failed to load profile'))
            .finally(() => setLoading(false));
    }, [companyId, staffId]);
    const handleChange = (section, field, value) => {
        setForm((prev) => ({
            ...prev,
            [section]: {
                ...prev[section],
                [field]: value,
            },
        }));
    };
    const handleSave = async () => {
        setLoading(true);
        setError(null);
        try {
            await (0, staff_1.updateStaff)(companyId, staffId, form);
            setProfile(form);
            setEdit(false);
        }
        catch (err) {
            setError(err.message || 'Failed to update profile');
        }
        finally {
            setLoading(false);
        }
    };
    if (loading)
        return (0, jsx_runtime_1.jsx)("div", { children: "Loading profile..." });
    if (error)
        return (0, jsx_runtime_1.jsx)("div", { style: { color: 'red' }, children: error });
    if (!profile)
        return (0, jsx_runtime_1.jsx)("div", { children: "Profile not found." });
    return ((0, jsx_runtime_1.jsxs)("div", { style: { border: '1px solid #ccc', padding: 16, margin: 16 }, children: [(0, jsx_runtime_1.jsx)("button", { onClick: onClose, children: "Close" }), (0, jsx_runtime_1.jsx)("h3", { children: "Staff Profile" }), edit ? ((0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("input", { value: form.personalDetails.firstName, onChange: e => handleChange('personalDetails', 'firstName', e.target.value) }), (0, jsx_runtime_1.jsx)("input", { value: form.personalDetails.lastName, onChange: e => handleChange('personalDetails', 'lastName', e.target.value) }), (0, jsx_runtime_1.jsx)("button", { onClick: handleSave, children: "Save" })] })) : ((0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsxs)("div", { children: ["First Name: ", profile.personalDetails.firstName] }), (0, jsx_runtime_1.jsxs)("div", { children: ["Last Name: ", profile.personalDetails.lastName] }), (0, jsx_runtime_1.jsx)("button", { onClick: () => setEdit(true), children: "Edit" })] }))] }));
};
exports.default = StaffProfile;
