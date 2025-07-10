"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const faq = [
    { q: 'How do I add a new staff member?', a: 'Go to Staff section and use the Add Staff form.' },
    { q: 'How do I import data?', a: 'Use the Import/Export buttons in each section (Staff, Payments, Deductions).' },
    { q: 'How is payroll calculated?', a: 'Payroll uses Rwanda tax law and the calculation sequence described in Blueprint.md.' },
    { q: 'How do I contact support?', a: 'See the Support section below.' },
];
const Utilities = () => ((0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("h2", { children: "Utilities & Support" }), (0, jsx_runtime_1.jsxs)("section", { children: [(0, jsx_runtime_1.jsx)("h3", { children: "FAQ" }), (0, jsx_runtime_1.jsx)("ul", { children: faq.map((item, i) => ((0, jsx_runtime_1.jsxs)("li", { children: [(0, jsx_runtime_1.jsx)("strong", { children: item.q }), (0, jsx_runtime_1.jsx)("br", {}), item.a] }, i))) })] }), (0, jsx_runtime_1.jsxs)("section", { children: [(0, jsx_runtime_1.jsx)("h3", { children: "Documentation" }), (0, jsx_runtime_1.jsxs)("p", { children: ["See ", (0, jsx_runtime_1.jsx)("a", { href: "./Blueprint.md", target: "_blank", rel: "noopener noreferrer", children: "Blueprint.md" }), " for full product documentation and technical details."] })] }), (0, jsx_runtime_1.jsxs)("section", { children: [(0, jsx_runtime_1.jsx)("h3", { children: "Support" }), (0, jsx_runtime_1.jsxs)("p", { children: ["Email: support@cheetahpayroll.com", (0, jsx_runtime_1.jsx)("br", {}), "Phone: +250 123 456 789"] })] }), (0, jsx_runtime_1.jsxs)("section", { children: [(0, jsx_runtime_1.jsx)("h3", { children: "System Information" }), (0, jsx_runtime_1.jsxs)("ul", { children: [(0, jsx_runtime_1.jsx)("li", { children: "Version: 1.0" }), (0, jsx_runtime_1.jsx)("li", { children: "Last Updated: July 2025" })] })] })] }));
exports.default = Utilities;
