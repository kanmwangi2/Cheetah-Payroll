"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const papaparse_1 = __importDefault(require("papaparse"));
const deductions_1 = require("../deductions");
const DeductionsImportExport = ({ companyId, onImported, deductions }) => {
    const fileInput = (0, react_1.useRef)(null);
    const [importing, setImporting] = (0, react_1.useState)(false);
    const [error, setError] = (0, react_1.useState)(null);
    const [exporting, setExporting] = (0, react_1.useState)(false);
    // Import CSV
    const handleImport = async (e) => {
        const file = e.target.files?.[0];
        if (!file)
            return;
        setImporting(true);
        setError(null);
        papaparse_1.default.parse(file, {
            header: true,
            complete: async (results) => {
                try {
                    for (const row of results.data) {
                        await (0, deductions_1.createDeduction)(companyId, row);
                    }
                    onImported();
                }
                catch (err) {
                    setError(err.message || 'Import failed');
                }
                finally {
                    setImporting(false);
                }
            },
            error: (err) => {
                setError(err.message || 'CSV parse error');
                setImporting(false);
            },
        });
    };
    // Export CSV
    const handleExport = () => {
        setExporting(true);
        const csv = papaparse_1.default.unparse(deductions);
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'deductions_export.csv';
        a.click();
        URL.revokeObjectURL(url);
        setExporting(false);
    };
    return ((0, jsx_runtime_1.jsxs)("div", { style: { margin: '16px 0' }, children: [(0, jsx_runtime_1.jsx)("h4", { children: "Import/Export Deductions" }), (0, jsx_runtime_1.jsx)("input", { type: "file", accept: ".csv", ref: fileInput, onChange: handleImport, disabled: importing }), (0, jsx_runtime_1.jsx)("button", { onClick: handleExport, disabled: exporting || deductions.length === 0, children: "Export CSV" }), error && (0, jsx_runtime_1.jsx)("div", { style: { color: 'red' }, children: error })] }));
};
exports.default = DeductionsImportExport;
