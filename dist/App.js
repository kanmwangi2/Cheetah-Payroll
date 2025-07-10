"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const Login_1 = __importDefault(require("./components/Login"));
const CompanySelector_1 = __importDefault(require("./components/CompanySelector"));
const auth_1 = require("./auth");
const StaffList = (0, react_1.lazy)(() => Promise.resolve().then(() => __importStar(require('./components/StaffList'))));
const PaymentsList = (0, react_1.lazy)(() => Promise.resolve().then(() => __importStar(require('./components/PaymentsList'))));
const DeductionsList = (0, react_1.lazy)(() => Promise.resolve().then(() => __importStar(require('./components/DeductionsList'))));
const PayrollList = (0, react_1.lazy)(() => Promise.resolve().then(() => __importStar(require('./components/PayrollList'))));
const Reports = (0, react_1.lazy)(() => Promise.resolve().then(() => __importStar(require('./components/Reports'))));
const Utilities = (0, react_1.lazy)(() => Promise.resolve().then(() => __importStar(require('./components/Utilities'))));
const App = () => {
    const [user, setUser] = (0, react_1.useState)(null);
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [company, setCompany] = (0, react_1.useState)(null);
    (0, react_1.useEffect)(() => {
        const unsubscribe = (0, auth_1.onUserChanged)(u => {
            setUser(u);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);
    if (loading)
        return (0, jsx_runtime_1.jsx)("div", { children: "Loading..." });
    if (!user)
        return (0, jsx_runtime_1.jsx)(Login_1.default, { onSuccess: () => window.location.reload() });
    if (!company)
        return (0, jsx_runtime_1.jsx)(CompanySelector_1.default, { onSelect: setCompany });
    return ((0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("h1", { children: "Welcome to Cheetah Payroll" }), (0, jsx_runtime_1.jsxs)("p", { children: ["User: ", user.email] }), (0, jsx_runtime_1.jsxs)("p", { children: ["Company: ", company.name] }), (0, jsx_runtime_1.jsxs)(react_1.Suspense, { fallback: (0, jsx_runtime_1.jsx)("div", { children: "Loading module..." }), children: [(0, jsx_runtime_1.jsx)("hr", {}), (0, jsx_runtime_1.jsx)(StaffList, { companyId: company.id }), (0, jsx_runtime_1.jsx)("hr", {}), (0, jsx_runtime_1.jsx)(PaymentsList, { companyId: company.id }), (0, jsx_runtime_1.jsx)("hr", {}), (0, jsx_runtime_1.jsx)(DeductionsList, { companyId: company.id }), (0, jsx_runtime_1.jsx)("hr", {}), (0, jsx_runtime_1.jsx)(PayrollList, { companyId: company.id }), (0, jsx_runtime_1.jsx)("hr", {}), (0, jsx_runtime_1.jsx)(Reports, { companyId: company.id }), (0, jsx_runtime_1.jsx)("hr", {}), (0, jsx_runtime_1.jsx)(Utilities, {})] })] }));
};
exports.default = App;
