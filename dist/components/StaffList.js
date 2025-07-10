"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const staff_1 = require("../staff");
const StaffForm_1 = __importDefault(require("./StaffForm"));
const StaffProfile_1 = __importDefault(require("./StaffProfile"));
const StaffImportExport_1 = __importDefault(require("./StaffImportExport"));
const StaffList = ({ companyId }) => {
    const [staff, setStaff] = (0, react_1.useState)([]);
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [error, setError] = (0, react_1.useState)(null);
    const [refresh, setRefresh] = (0, react_1.useState)(0);
    const [selected, setSelected] = (0, react_1.useState)(null);
    (0, react_1.useEffect)(() => {
        (0, staff_1.getStaff)(companyId)
            .then(setStaff)
            .catch(e => setError(e.message || 'Failed to load staff'))
            .finally(() => setLoading(false));
    }, [companyId, refresh]);
    if (loading)
        return (0, jsx_runtime_1.jsx)("div", { children: "Loading staff..." });
    if (error)
        return (0, jsx_runtime_1.jsx)("div", { style: { color: 'red' }, children: error });
    return ((0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("h2", { children: "Staff List" }), (0, jsx_runtime_1.jsx)(StaffForm_1.default, { companyId: companyId, onAdded: () => setRefresh(r => r + 1) }), (0, jsx_runtime_1.jsx)(StaffImportExport_1.default, { companyId: companyId, onImported: () => setRefresh(r => r + 1), staff: staff }), selected && ((0, jsx_runtime_1.jsx)(StaffProfile_1.default, { companyId: companyId, staffId: selected, onClose: () => setSelected(null) })), staff.length === 0 ? ((0, jsx_runtime_1.jsx)("div", { children: "No staff found." })) : ((0, jsx_runtime_1.jsxs)("table", { children: [(0, jsx_runtime_1.jsx)("thead", { children: (0, jsx_runtime_1.jsxs)("tr", { children: [(0, jsx_runtime_1.jsx)("th", { children: "First Name" }), (0, jsx_runtime_1.jsx)("th", { children: "Last Name" }), (0, jsx_runtime_1.jsx)("th", { children: "ID/Passport" }), (0, jsx_runtime_1.jsx)("th", { children: "Department" }), (0, jsx_runtime_1.jsx)("th", { children: "Profile" })] }) }), (0, jsx_runtime_1.jsx)("tbody", { children: staff.map(s => ((0, jsx_runtime_1.jsxs)("tr", { children: [(0, jsx_runtime_1.jsx)("td", { children: s.personalDetails?.firstName }), (0, jsx_runtime_1.jsx)("td", { children: s.personalDetails?.lastName }), (0, jsx_runtime_1.jsx)("td", { children: s.personalDetails?.idNumber }), (0, jsx_runtime_1.jsx)("td", { children: s.employmentDetails?.department }), (0, jsx_runtime_1.jsx)("td", { children: (0, jsx_runtime_1.jsx)("button", { onClick: () => setSelected(s.id), children: "View" }) })] }, s.id))) })] }))] }));
};
exports.default = StaffList;
