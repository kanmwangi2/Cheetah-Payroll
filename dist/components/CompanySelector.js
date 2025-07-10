"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const company_1 = require("../company");
const auth_1 = require("../auth");
const CompanySelector = ({ onSelect }) => {
    const [companies, setCompanies] = (0, react_1.useState)([]);
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [error, setError] = (0, react_1.useState)(null);
    (0, react_1.useEffect)(() => {
        const user = auth_1.auth.currentUser;
        if (!user)
            return;
        (0, company_1.getCompaniesForUser)(user.uid)
            .then(setCompanies)
            .catch(e => setError(e.message || 'Failed to load companies'))
            .finally(() => setLoading(false));
    }, []);
    if (loading)
        return (0, jsx_runtime_1.jsx)("div", { children: "Loading companies..." });
    if (error)
        return (0, jsx_runtime_1.jsx)("div", { style: { color: 'red' }, children: error });
    if (companies.length === 0)
        return (0, jsx_runtime_1.jsx)("div", { children: "No companies found." });
    return ((0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("h2", { children: "Select Company" }), (0, jsx_runtime_1.jsx)("ul", { children: companies.map(c => ((0, jsx_runtime_1.jsx)("li", { children: (0, jsx_runtime_1.jsx)("button", { onClick: () => onSelect(c), children: c.name }) }, c.id))) })] }));
};
exports.default = CompanySelector;
