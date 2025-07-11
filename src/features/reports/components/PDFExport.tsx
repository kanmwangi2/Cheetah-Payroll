import React from 'react';
import jsPDF from 'jspdf';

export default function PDFExport({ data, type }: { data: any[]; type: 'report' | 'payroll' }) {
  const handleExport = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text(type === 'report' ? 'Report PDF Export' : 'Payroll PDF Export', 10, 15);

    if (!data || data.length === 0) {
      doc.setFontSize(12);
      doc.text('No data to export.', 10, 30);
    } else {
      // Render table headers
      const keys = Object.keys(data[0]);
      let y = 30;
      doc.setFontSize(10);
      doc.text(keys.join(' | '), 10, y);
      y += 8;
      // Render table rows
      data.forEach((row: any) => {
        const rowText = keys.map(k => String(row[k] ?? '')).join(' | ');
        doc.text(rowText, 10, y);
        y += 8;
        if (y > 270) {
          doc.addPage();
          y = 20;
        }
      });
    }
    doc.save(`${type}_export.pdf`);
  };
  return (
    <button onClick={handleExport} className="pdf-export-btn">
      Export {type === 'report' ? 'Report' : 'Payroll'} as PDF
    </button>
  );
}
