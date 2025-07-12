/**
 * FAQ Component
 * Frequently Asked Questions with accordion interface and PDF export
 */

import React from 'react';
import { Accordion } from '../../../shared/components/ui/Accordion';
import jsPDF from 'jspdf';

const faqData = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    content: (
      <div>
        <h4>How do I get started with Cheetah Payroll?</h4>
        <p>To get started:</p>
        <ol>
          <li>Sign up for an account using your email address</li>
          <li>Create or join a company</li>
          <li>Set up your company's basic information and tax settings</li>
          <li>Add your staff members with their employment details</li>
          <li>Configure salary structures and deductions</li>
          <li>Run your first payroll</li>
        </ol>
        
        <h4>What information do I need to provide for my company?</h4>
        <p>You'll need:</p>
        <ul>
          <li>Company name and address</li>
          <li>Tax identification numbers</li>
          <li>Bank account details for salary disbursements</li>
          <li>Employee information and contracts</li>
        </ul>
      </div>
    )
  },
  {
    id: 'staff-management',
    title: 'Staff Management',
    content: (
      <div>
        <h4>How do I add new employees?</h4>
        <p>Navigate to the Staff section and click "Add Staff". Fill in the required information including personal details, employment information, and bank details.</p>
        
        <h4>Can I import employee data from Excel?</h4>
        <p>Yes! Use the Import/Export feature in the Staff section to upload employee data via CSV or Excel files. Make sure your file follows the required format.</p>
        
        <h4>How do I update employee information?</h4>
        <p>Click on any employee in the Staff list to view and edit their details. Changes are automatically saved and reflected in future payroll calculations.</p>
        
        <h4>What happens when an employee leaves?</h4>
        <p>You can deactivate employees rather than deleting them to maintain historical payroll records. Set their end date in the employment details.</p>
      </div>
    )
  },
  {
    id: 'payroll-processing',
    title: 'Payroll Processing',
    content: (
      <div>
        <h4>How often can I run payroll?</h4>
        <p>You can run payroll as frequently as needed - monthly, bi-weekly, weekly, or even daily. The system calculates taxes and deductions automatically based on your configured settings.</p>
        
        <h4>How are Rwanda taxes calculated?</h4>
        <p>The system automatically calculates:</p>
        <ul>
          <li>PAYE (Pay As You Earn) tax using current Rwanda tax brackets</li>
          <li>Pension contributions (6% employee, 8% employer)</li>
          <li>Maternity leave insurance (0.3% each for employee and employer)</li>
          <li>CBHI (Community Based Health Insurance) - 0.5% employee contribution</li>
          <li>RAMA (Rwanda Medical Association) - 7.5% each for employee and employer</li>
        </ul>
        
        <h4>Can I customize deductions?</h4>
        <p>Yes! You can add custom deductions for loans, advances, insurance, or any other items specific to your organization.</p>
        
        <h4>How do I handle salary advances?</h4>
        <p>Use the Deductions section to record salary advances, which will be automatically deducted from future payrolls until fully recovered.</p>
      </div>
    )
  },
  {
    id: 'payments-allowances',
    title: 'Payments & Allowances',
    content: (
      <div>
        <h4>What types of payments can I manage?</h4>
        <p>The system supports:</p>
        <ul>
          <li>Basic salary</li>
          <li>Transport allowances</li>
          <li>Housing allowances</li>
          <li>Overtime payments</li>
          <li>Bonuses and commissions</li>
          <li>Medical allowances</li>
          <li>Any custom allowances you define</li>
        </ul>
        
        <h4>How do I set up recurring allowances?</h4>
        <p>In the Payments section, you can configure allowances to be automatically included in every payroll run for specific employees or departments.</p>
        
        <h4>Can I backdate payments?</h4>
        <p>Yes, you can specify effective dates for payments and allowances to handle backdated salary adjustments or corrections.</p>
      </div>
    )
  },
  {
    id: 'deductions-loans',
    title: 'Deductions & Loans',
    content: (
      <div>
        <h4>How do I set up employee loans?</h4>
        <p>In the Deductions section:</p>
        <ol>
          <li>Select "Loan" as the deduction type</li>
          <li>Enter the total loan amount</li>
          <li>Set the monthly installment amount</li>
          <li>The system will automatically calculate remaining balance and payments</li>
        </ol>
        
        <h4>Can I track loan payments?</h4>
        <p>Yes! The system tracks all loan payments automatically and shows progress bars for each loan. You can also manually record additional payments.</p>
        
        <h4>What other deductions can I manage?</h4>
        <p>You can set up:</p>
        <ul>
          <li>Insurance premiums</li>
          <li>Union dues</li>
          <li>Uniform costs</li>
          <li>Equipment deductions</li>
          <li>Any custom deductions</li>
        </ul>
      </div>
    )
  },
  {
    id: 'reports-compliance',
    title: 'Reports & Compliance',
    content: (
      <div>
        <h4>What reports can I generate?</h4>
        <p>The system provides:</p>
        <ul>
          <li>Individual payslips</li>
          <li>Payroll summary reports</li>
          <li>Tax reports for RRA submission</li>
          <li>RSSB contributions reports</li>
          <li>Custom reports by date range or employee groups</li>
        </ul>
        
        <h4>Are the reports compliant with Rwanda regulations?</h4>
        <p>Yes! All reports are designed to meet Rwanda Revenue Authority (RRA) and Social Security Board (RSSB) requirements for tax and social security reporting.</p>
        
        <h4>Can I export reports to different formats?</h4>
        <p>Reports can be exported as PDF, Excel, or CSV files for easy sharing with accountants, auditors, or regulatory bodies.</p>
      </div>
    )
  },
  {
    id: 'troubleshooting',
    title: 'Troubleshooting',
    content: (
      <div>
        <h4>What if my tax calculations seem incorrect?</h4>
        <p>First, verify your tax settings in the Admin panel. Ensure that:</p>
        <ul>
          <li>Tax brackets are current for the payroll period</li>
          <li>Employee personal details are accurate (including dependents)</li>
          <li>Pension and other contribution rates are correct</li>
        </ul>
        
        <h4>How do I fix data import errors?</h4>
        <p>Common import issues:</p>
        <ul>
          <li>Check that all required fields are included</li>
          <li>Verify date formats (YYYY-MM-DD)</li>
          <li>Ensure numeric fields don't contain text</li>
          <li>Remove any special characters from names and addresses</li>
        </ul>
        
        <h4>What if I can't access my account?</h4>
        <p>Use the "Forgot Password" link on the login page to reset your password. If you're still unable to access your account, contact your system administrator or support team.</p>
        
        <h4>How do I back up my data?</h4>
        <p>Use the Utilities section to export all your data regularly. This creates backup files that can be imported if needed for data recovery.</p>
      </div>
    )
  },
  {
    id: 'security-privacy',
    title: 'Security & Privacy',
    content: (
      <div>
        <h4>How is my data protected?</h4>
        <p>Cheetah Payroll uses enterprise-grade security measures:</p>
        <ul>
          <li>All data is encrypted in transit and at rest</li>
          <li>Regular security audits and updates</li>
          <li>Role-based access controls</li>
          <li>Audit trails for all system changes</li>
        </ul>
        
        <h4>Who can access employee data?</h4>
        <p>Access is controlled through user roles:</p>
        <ul>
          <li>Primary Admin: Full system access</li>
          <li>Company Admin: Company-specific data access</li>
          <li>Payroll Preparer: Can create payrolls but not approve</li>
          <li>Payroll Approver: Can review and approve payrolls</li>
        </ul>
        
        <h4>Is my financial data safe?</h4>
        <p>Yes! We use bank-level encryption and security protocols. Financial data is never stored in plain text and access is logged for audit purposes.</p>
      </div>
    )
  }
];

const FAQ: React.FC = () => {
  const exportToPDF = () => {
    const pdf = new jsPDF();
    const pageHeight = pdf.internal.pageSize.height;
    let currentY = 20;
    
    pdf.setFontSize(20);
    pdf.text('Cheetah Payroll - Frequently Asked Questions', 20, currentY);
    currentY += 15;
    
    pdf.setFontSize(10);
    pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, currentY);
    currentY += 20;
    
    faqData.forEach((section, index) => {
      // Check if we need a new page
      if (currentY > pageHeight - 30) {
        pdf.addPage();
        currentY = 20;
      }
      
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text(section.title, 20, currentY);
      currentY += 10;
      
      // Extract text content from React elements
      const textContent = extractTextFromReactElement(section.content);
      const lines = pdf.splitTextToSize(textContent, 170);
      
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      
      lines.forEach((line: string) => {
        if (currentY > pageHeight - 20) {
          pdf.addPage();
          currentY = 20;
        }
        pdf.text(line, 20, currentY);
        currentY += 5;
      });
      
      currentY += 10; // Extra space between sections
    });
    
    pdf.save('cheetah-payroll-faq.pdf');
  };
  
  const extractTextFromReactElement = (element: React.ReactNode): string => {
    if (typeof element === 'string') return element;
    if (typeof element === 'number') return element.toString();
    if (!element) return '';
    
    if (React.isValidElement(element)) {
      const props = element.props as any;
      if (element.type === 'h4') {
        return `\n${extractTextFromReactElement(props.children)}\n`;
      }
      if (element.type === 'p') {
        return `${extractTextFromReactElement(props.children)}\n`;
      }
      if (element.type === 'li') {
        return `• ${extractTextFromReactElement(props.children)}\n`;
      }
      if (element.type === 'ol' || element.type === 'ul') {
        return `${extractTextFromReactElement(props.children)}`;
      }
      if (props?.children) {
        return extractTextFromReactElement(props.children);
      }
    }
    
    if (Array.isArray(element)) {
      return element.map(extractTextFromReactElement).join('');
    }
    
    return '';
  };

  const accordionItems = faqData.map(item => ({
    id: item.id,
    title: item.title,
    children: item.content,
    defaultExpanded: false
  }));

  return (
    <div className="faq-container" style={{ padding: 'var(--spacing-xl)' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: 'var(--spacing-xl)' 
      }}>
        <h2 style={{ 
          color: 'var(--color-text-primary)', 
          fontSize: 'var(--font-size-3xl)', 
          fontWeight: 'var(--font-weight-bold)',
          margin: 0
        }}>
          Frequently Asked Questions
        </h2>
        <button 
          onClick={exportToPDF}
          className="export-pdf-btn"
          title="Export FAQ to PDF"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14,2 14,8 20,8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <polyline points="10,9 9,9 8,9" />
          </svg>
          Export to PDF
        </button>
      </div>
      
      <div style={{ 
        background: 'var(--color-info-bg)', 
        border: '1px solid var(--color-info-border)',
        borderRadius: 'var(--border-radius-md)',
        padding: 'var(--spacing-lg)',
        marginBottom: 'var(--spacing-xl)',
        color: 'var(--color-info-text)'
      }}>
        <p style={{ margin: 0 }}>
          <strong>Welcome to Cheetah Payroll!</strong> This FAQ covers the most common questions about using our payroll management system. 
          Click on any section below to expand it and find detailed answers. You can also export this entire FAQ as a PDF for offline reference.
        </p>
      </div>
      
      <Accordion items={accordionItems} allowMultiple={true} />
    </div>
  );
};

export default FAQ;