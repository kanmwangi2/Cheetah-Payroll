/**
 * Documentation Component
 * Comprehensive user documentation with accordion interface and PDF export
 */

import React from 'react';
import { Accordion } from '../../../shared/components/ui/Accordion';
import jsPDF from 'jspdf';

const documentationData = [
  {
    id: 'system-overview',
    title: 'System Overview',
    content: (
      <div>
        <h4>Introduction to Cheetah Payroll</h4>
        <p>Cheetah Payroll is a comprehensive payroll management system designed specifically for Rwanda's business environment. It handles all aspects of payroll processing, from employee management to tax calculations and compliance reporting.</p>
        
        <h4>Key Features</h4>
        <ul>
          <li><strong>Employee Management:</strong> Complete staff database with personal, employment, and bank details</li>
          <li><strong>Payroll Processing:</strong> Automated calculations for salaries, taxes, and deductions</li>
          <li><strong>Tax Compliance:</strong> Rwanda-specific PAYE, pension, and social security calculations</li>
          <li><strong>Deductions Management:</strong> Loans, advances, and custom deductions tracking</li>
          <li><strong>Payments & Allowances:</strong> Flexible payment structures and allowance management</li>
          <li><strong>Reporting:</strong> Comprehensive reports for management and compliance</li>
          <li><strong>Data Import/Export:</strong> Bulk operations and backup capabilities</li>
          <li><strong>Multi-user Support:</strong> Role-based access control and approval workflows</li>
        </ul>
        
        <h4>System Requirements</h4>
        <p>Cheetah Payroll is a web-based application that works on:</p>
        <ul>
          <li>Modern web browsers (Chrome, Firefox, Safari, Edge)</li>
          <li>Desktop and mobile devices</li>
          <li>Internet connection for real-time synchronization</li>
        </ul>
      </div>
    )
  },
  {
    id: 'user-roles',
    title: 'User Roles & Permissions',
    content: (
      <div>
        <h4>Role Hierarchy</h4>
        <p>The system supports five distinct user roles, each with specific permissions:</p>
        
        <h4>1. Primary Admin</h4>
        <ul>
          <li>Full system access across all companies</li>
          <li>User management and role assignment</li>
          <li>System configuration and tax settings</li>
          <li>Global reporting and analytics</li>
          <li>Data backup and restore operations</li>
        </ul>
        
        <h4>2. App Admin</h4>
        <ul>
          <li>Administrative access within assigned companies</li>
          <li>Company settings configuration</li>
          <li>User management for their companies</li>
          <li>All payroll operations and approvals</li>
        </ul>
        
        <h4>3. Company Admin</h4>
        <ul>
          <li>Full access to company-specific data</li>
          <li>Employee management and configuration</li>
          <li>Payroll processing and approval</li>
          <li>Report generation and export</li>
          <li>Company settings management</li>
        </ul>
        
        <h4>4. Payroll Approver</h4>
        <ul>
          <li>Review and approve payroll runs</li>
          <li>View all payroll data and reports</li>
          <li>Cannot create or modify employee data</li>
          <li>Can generate reports for approved payrolls</li>
        </ul>
        
        <h4>5. Payroll Preparer</h4>
        <ul>
          <li>Create and calculate payroll runs</li>
          <li>Manage employee payments and deductions</li>
          <li>Cannot approve payrolls (requires approval)</li>
          <li>View payroll data and basic reports</li>
        </ul>
        
        <h4>Role Assignment</h4>
        <p>Users are assigned roles when their accounts are created. Role changes require Primary Admin or App Admin privileges. Each user can have different roles in different companies.</p>
      </div>
    )
  },
  {
    id: 'employee-management',
    title: 'Employee Management',
    content: (
      <div>
        <h4>Adding New Employees</h4>
        <p>To add a new employee:</p>
        <ol>
          <li>Navigate to the Staff section</li>
          <li>Click "Add Staff" button</li>
          <li>Fill in the required information in three sections:</li>
        </ol>
        
        <h4>Personal Details</h4>
        <ul>
          <li><strong>First Name & Last Name:</strong> Required fields</li>
          <li><strong>ID/Passport Number:</strong> Unique identifier for the employee</li>
          <li><strong>RSSB Number:</strong> Rwanda Social Security Board number</li>
          <li><strong>Date of Birth:</strong> Used for age-related calculations</li>
          <li><strong>Gender:</strong> Male, Female, or Other</li>
          <li><strong>Marital Status:</strong> Single, Married, or Divorced</li>
          <li><strong>Contact Information:</strong> Phone and email (email required)</li>
          <li><strong>Address:</strong> Physical address</li>
          <li><strong>Emergency Contact:</strong> Emergency contact information</li>
        </ul>
        
        <h4>Employment Details</h4>
        <ul>
          <li><strong>Start Date:</strong> Employment commencement date</li>
          <li><strong>Position:</strong> Job title or position</li>
          <li><strong>Department:</strong> Organizational department</li>
          <li><strong>Employment Type:</strong> Full-time, Part-time, Contract, etc.</li>
        </ul>
        
        <h4>Bank Details</h4>
        <ul>
          <li><strong>Bank Name:</strong> Employee's bank</li>
          <li><strong>Account Number:</strong> Bank account for salary payments</li>
        </ul>
        
        <h4>Bulk Import</h4>
        <p>For adding multiple employees:</p>
        <ol>
          <li>Click the "Import/Export" button to open the unified modal</li>
          <li>Download the CSV template with complete field specifications</li>
          <li>Fill in employee data following the template format</li>
          <li>Upload the completed file and monitor real-time progress</li>
          <li>Review detailed validation results and error messages</li>
          <li>Check import history for audit trail</li>
        </ol>
        
        <h4>Employee Status Management</h4>
        <p>Employees can be:</p>
        <ul>
          <li><strong>Active:</strong> Currently employed and included in payroll</li>
          <li><strong>Inactive:</strong> Temporarily suspended from payroll</li>
          <li><strong>Terminated:</strong> No longer employed (maintains historical data)</li>
        </ul>
      </div>
    )
  },
  {
    id: 'payroll-processing',
    title: 'Payroll Processing',
    content: (
      <div>
        <h4>Payroll Calculation Process</h4>
        <p>The payroll system automatically calculates all required deductions and taxes based on Rwanda's current regulations:</p>
        
        <h4>Dynamic Tax Configuration</h4>
        <p>All tax calculations use configurable rates that administrators can modify in real-time through the Admin panel:</p>
        
        <h4>Tax Calculations</h4>
        <p><strong>PAYE (Pay As You Earn):</strong></p>
        <ul>
          <li>Calculated using configurable progressive tax brackets</li>
          <li>Default brackets: 0% (0-60,000), 10% (60,001-100,000), 20% (100,001-200,000), 30% (200,001+)</li>
          <li>Administrators can add, remove, or modify brackets as needed</li>
          <li>Applied to taxable income after pension deductions</li>
        </ul>
        
        <h4>Social Security Contributions</h4>
        <p><strong>Pension (RSSB):</strong></p>
        <ul>
          <li>Employee contribution: Configurable rate (default: 6% of gross salary)</li>
          <li>Employer contribution: Configurable rate (default: 8% of gross salary)</li>
          <li>Deducted from taxable income</li>
        </ul>
        
        <p><strong>Maternity Leave Insurance:</strong></p>
        <ul>
          <li>Employee contribution: Configurable rate (default: 0.3% of gross salary)</li>
          <li>Employer contribution: Configurable rate (default: 0.3% of gross salary)</li>
        </ul>
        
        <p><strong>CBHI (Community Based Health Insurance):</strong></p>
        <ul>
          <li>Employee contribution: Configurable rate (default: 0.5% of net salary before CBHI)</li>
          <li>Employer contribution: Configurable rate (default: 0%)</li>
        </ul>
        
        <p><strong>RAMA (Rwanda Medical Association):</strong></p>
        <ul>
          <li>Employee contribution: Configurable rate (default: 7.5% of basic pay only)</li>
          <li>Employer contribution: Configurable rate (default: 7.5% of basic pay only)</li>
          <li>Calculated on basic pay only (excludes allowances)</li>
        </ul>
        
        <p><strong>Administrative Control:</strong></p>
        <ul>
          <li>All tax rates and brackets are configurable via Admin → Tax Configuration</li>
          <li>Changes take effect immediately for all new payroll calculations</li>
          <li>Configuration is stored securely in the database</li>
          <li>Fallback to default values ensures system reliability</li>
        </ul>
        
        <h4>Running Payroll</h4>
        <ol>
          <li>Go to the Payroll section</li>
          <li>Click "Create New Payroll"</li>
          <li>Select payroll period using the date picker</li>
          <li>System automatically includes all active staff with their payments and deductions</li>
          <li>Review calculated tax breakdowns for each employee</li>
          <li>Submit for approval (if workflow enabled) or save directly</li>
        </ol>
        
        <h4>Payroll Import/Export</h4>
        <p>Use the unified Import/Export modal for payroll data management:</p>
        <ul>
          <li>Access through single "Import/Export" button</li>
          <li>Download CSV template for payroll metadata</li>
          <li>Real-time validation and progress tracking</li>
          <li>Complete import history and error reporting</li>
          <li>Export payroll summaries and detailed breakdowns</li>
        </ul>
        
        <h4>Payroll Approval Workflow</h4>
        <p>If approval workflow is enabled:</p>
        <ol>
          <li>Payroll Preparer creates the payroll</li>
          <li>System shows "Pending Approval" status</li>
          <li>Payroll Approver reviews and approves/rejects</li>
          <li>Approved payrolls can be processed for payment</li>
        </ol>
      </div>
    )
  },
  {
    id: 'payments-allowances',
    title: 'Payments & Allowances',
    content: (
      <div>
        <h4>Payment Types</h4>
        <p>The system supports various payment types to accommodate different compensation structures:</p>
        
        <h4>Regular Payments</h4>
        <ul>
          <li><strong>Basic Salary:</strong> Core monthly salary amount</li>
          <li><strong>Transport Allowance:</strong> Travel and transportation compensation</li>
          <li><strong>Housing Allowance:</strong> Accommodation support payments</li>
          <li><strong>Medical Allowance:</strong> Healthcare-related payments</li>
        </ul>
        
        <h4>Variable Payments</h4>
        <ul>
          <li><strong>Overtime:</strong> Additional hours compensation</li>
          <li><strong>Bonuses:</strong> Performance or seasonal bonuses</li>
          <li><strong>Commissions:</strong> Sales or target-based payments</li>
          <li><strong>Allowances:</strong> Custom allowance types</li>
        </ul>
        
        <h4>Adding Payments</h4>
        <ol>
          <li>Navigate to the Payments section</li>
          <li>Click "Add Payment"</li>
          <li>Select payment type and employee</li>
          <li>Enter amount and effective date</li>
          <li>Choose if payment is recurring</li>
          <li>Save the payment</li>
        </ol>
        
        <h4>Recurring Payments</h4>
        <p>Set up recurring allowances that automatically appear in every payroll:</p>
        <ul>
          <li>Monthly transport allowances</li>
          <li>Regular housing allowances</li>
          <li>Fixed overtime payments</li>
          <li>Department-specific allowances</li>
        </ul>
        
        <h4>Payment Import/Export</h4>
        <p>Use the unified Import/Export modal for bulk operations:</p>
        <ul>
          <li>Access through single "Import/Export" button</li>
          <li>Download CSV template with complete field specifications</li>
          <li>Real-time progress tracking during upload</li>
          <li>Detailed validation with line-by-line error reporting</li>
          <li>Complete import history and audit trail</li>
          <li>Export payment reports in multiple formats</li>
        </ul>
        
        <h4>Tax Implications</h4>
        <p>Understanding how different payments affect taxes:</p>
        <ul>
          <li><strong>Taxable Payments:</strong> Basic salary, bonuses, commissions</li>
          <li><strong>Non-taxable (up to limits):</strong> Transport allowances</li>
          <li><strong>Partially Taxable:</strong> Some allowances have tax-free thresholds</li>
        </ul>
      </div>
    )
  },
  {
    id: 'deductions-loans',
    title: 'Deductions & Loans',
    content: (
      <div>
        <h4>Deduction Types</h4>
        <p>The system manages various deduction types to handle all common salary deductions:</p>
        
        <h4>Loan Management</h4>
        <p><strong>Setting up Employee Loans:</strong></p>
        <ol>
          <li>Go to Deductions section</li>
          <li>Click "Add Deduction"</li>
          <li>Select "Loan" as deduction type</li>
          <li>Enter loan details:
            <ul>
              <li>Total loan amount</li>
              <li>Monthly installment amount</li>
              <li>Start date for deductions</li>
              <li>Loan description/purpose</li>
            </ul>
          </li>
          <li>System automatically calculates remaining installments</li>
        </ol>
        
        <p><strong>Loan Tracking Features:</strong></p>
        <ul>
          <li>Real-time balance tracking</li>
          <li>Progress bars showing repayment status</li>
          <li>Automatic completion when fully paid</li>
          <li>Manual payment recording for extra payments</li>
          <li>Loan payment history</li>
        </ul>
        
        <h4>Other Deduction Types</h4>
        <ul>
          <li><strong>Advance Salary:</strong> Prepaid salary deductions</li>
          <li><strong>Insurance:</strong> Health, life, or other insurance premiums</li>
          <li><strong>Union Dues:</strong> Labor union membership fees</li>
          <li><strong>Equipment:</strong> Company equipment purchase deductions</li>
          <li><strong>Uniform:</strong> Work uniform or clothing costs</li>
          <li><strong>Training:</strong> Professional development costs</li>
          <li><strong>Other:</strong> Custom deduction types</li>
        </ul>
        
        <h4>Deduction Processing</h4>
        <p>How deductions are applied:</p>
        <ul>
          <li>Automatic deduction during payroll processing</li>
          <li>Priority order for multiple deductions</li>
          <li>Maximum deduction limits to ensure minimum take-home pay</li>
          <li>Temporary suspension of deductions if needed</li>
        </ul>
        
        <h4>Recording Manual Payments</h4>
        <p>For loans, you can record additional payments:</p>
        <ol>
          <li>Find the loan in the Deductions list</li>
          <li>Click "Record Payment"</li>
          <li>Enter the payment amount</li>
          <li>System updates remaining balance automatically</li>
        </ol>
        
        <h4>Bulk Deduction Operations</h4>
        <p>Use the unified Import/Export modal for efficient bulk operations:</p>
        <ul>
          <li>Access through single "Import/Export" button</li>
          <li>Download CSV template with all required fields</li>
          <li>Real-time progress tracking and validation</li>
          <li>Row-by-row error reporting with specific guidance</li>
          <li>Complete import history tracking</li>
          <li>Export deduction data for external analysis</li>
        </ul>
        
        <h4>Deduction Reports</h4>
        <ul>
          <li>Individual loan statements</li>
          <li>Deduction summary by employee</li>
          <li>Monthly deduction totals</li>
          <li>Outstanding loan balances</li>
        </ul>
      </div>
    )
  },
  {
    id: 'reports-compliance',
    title: 'Reports & Compliance',
    content: (
      <div>
        <h4>Available Reports</h4>
        <p>Cheetah Payroll provides comprehensive reporting to meet both management and regulatory requirements:</p>
        
        <h4>Payroll Reports</h4>
        <ul>
          <li><strong>Individual Payslips:</strong> Detailed breakdown for each employee</li>
          <li><strong>Payroll Summary:</strong> Company-wide payroll totals</li>
          <li><strong>Department Reports:</strong> Payroll costs by department</li>
          <li><strong>Monthly Summaries:</strong> Historical payroll data</li>
        </ul>
        
        <h4>Tax and Compliance Reports</h4>
        <ul>
          <li><strong>PAYE Tax Report:</strong> For Rwanda Revenue Authority submission</li>
          <li><strong>RSSB Contributions:</strong> Pension and social security reports</li>
          <li><strong>Withholding Tax Summary:</strong> Monthly tax withholdings</li>
          <li><strong>Annual Tax Certificate:</strong> Employee tax certificates</li>
        </ul>
        
        <h4>Management Reports</h4>
        <ul>
          <li><strong>Labor Cost Analysis:</strong> Cost trends and analytics</li>
          <li><strong>Employee Statistics:</strong> Headcount and demographics</li>
          <li><strong>Overtime Reports:</strong> Overtime hours and costs</li>
          <li><strong>Allowance Reports:</strong> Allowance distribution analysis</li>
        </ul>
        
        <h4>Generating Reports</h4>
        <ol>
          <li>Navigate to the Reports section</li>
          <li>Select the desired report type</li>
          <li>Choose date range and filters:
            <ul>
              <li>Specific payroll periods</li>
              <li>Employee groups or departments</li>
              <li>Payment or deduction types</li>
            </ul>
          </li>
          <li>Preview the report</li>
          <li>Export in desired format (PDF, Excel, CSV)</li>
        </ol>
        
        <h4>Compliance Features</h4>
        <p><strong>Rwanda Revenue Authority (RRA) Compliance:</strong></p>
        <ul>
          <li>Automatic PAYE calculations using current tax brackets</li>
          <li>Monthly tax return data in required format</li>
          <li>Employee tax certificate generation</li>
          <li>Withholding tax reports</li>
        </ul>
        
        <p><strong>Social Security Board (RSSB) Compliance:</strong></p>
        <ul>
          <li>Monthly contribution calculations</li>
          <li>Employee registration data</li>
          <li>Contribution payment schedules</li>
          <li>Annual contribution summaries</li>
        </ul>
        
        <h4>Audit Trail</h4>
        <p>The system maintains detailed audit logs:</p>
        <ul>
          <li>All payroll calculations and changes</li>
          <li>User actions and approvals</li>
          <li>Data modifications with timestamps</li>
          <li>Report generation history</li>
        </ul>
        
        <h4>Data Export Options</h4>
        <ul>
          <li><strong>PDF:</strong> Formatted reports for printing and sharing</li>
          <li><strong>Excel:</strong> Spreadsheet format for further analysis</li>
          <li><strong>CSV:</strong> Data format for importing into other systems</li>
          <li><strong>Custom Formats:</strong> Integration with accounting software</li>
        </ul>
      </div>
    )
  },
  {
    id: 'system-administration',
    title: 'System Administration',
    content: (
      <div>
        <h4>Company Setup</h4>
        <p>Initial company configuration requires:</p>
        
        <h4>Basic Company Information</h4>
        <ul>
          <li><strong>Company Name:</strong> Official business name</li>
          <li><strong>Registration Number:</strong> Business registration details</li>
          <li><strong>Tax Identification:</strong> RRA tax ID number</li>
          <li><strong>Address:</strong> Physical and postal addresses</li>
          <li><strong>Contact Information:</strong> Phone and email</li>
        </ul>
        
        <h4>Tax Configuration</h4>
        <ul>
          <li><strong>PAYE Settings:</strong> Tax brackets and rates</li>
          <li><strong>Pension Rates:</strong> Employee and employer contribution percentages</li>
          <li><strong>Social Security:</strong> CBHI, maternity, and other contribution rates</li>
          <li><strong>Professional Associations:</strong> RAMA and other specialized contributions</li>
        </ul>
        
        <h4>User Management</h4>
        <p><strong>Adding Users:</strong></p>
        <ol>
          <li>Navigate to User Management (Admin users only)</li>
          <li>Click "Add User"</li>
          <li>Enter user details and email address</li>
          <li>Assign appropriate role and permissions</li>
          <li>Send invitation email to user</li>
        </ol>
        
        <p><strong>Role Management:</strong></p>
        <ul>
          <li>Assign roles based on job responsibilities</li>
          <li>Multiple roles per user across different companies</li>
          <li>Regular review and update of permissions</li>
          <li>Deactivate users when they leave</li>
        </ul>
        
        <h4>System Settings</h4>
        <ul>
          <li><strong>Company Settings:</strong> Basic company information updates</li>
          <li><strong>Tax Settings:</strong> Rate changes and bracket updates</li>
          <li><strong>Notification Settings:</strong> Email alerts and reminders</li>
          <li><strong>Backup Settings:</strong> Automatic backup schedules</li>
        </ul>
        
        <h4>Data Management</h4>
        <p><strong>Backup and Restore:</strong></p>
        <ul>
          <li>Regular automated backups</li>
          <li>Manual backup generation</li>
          <li>Data export for external storage</li>
          <li>Point-in-time recovery options</li>
        </ul>
        
        <p><strong>Data Migration:</strong></p>
        <ul>
          <li>Import from existing payroll systems</li>
          <li>Template-based data import</li>
          <li>Data validation and error checking</li>
          <li>Rollback capabilities for failed imports</li>
        </ul>
        
        <h4>Security Administration</h4>
        <ul>
          <li><strong>Password Policies:</strong> Complexity and expiration rules</li>
          <li><strong>Access Controls:</strong> IP restrictions and login monitoring</li>
          <li><strong>Session Management:</strong> Timeout and concurrent session limits</li>
          <li><strong>Audit Logging:</strong> Comprehensive activity tracking</li>
        </ul>
        
        <h4>System Monitoring</h4>
        <ul>
          <li>User activity monitoring</li>
          <li>System performance tracking</li>
          <li>Error log review</li>
          <li>Usage statistics and analytics</li>
        </ul>
      </div>
    )
  }
];

const Documentation: React.FC = () => {
  const exportToPDF = () => {
    const pdf = new jsPDF();
    const pageHeight = pdf.internal.pageSize.height;
    let currentY = 20;
    
    pdf.setFontSize(20);
    pdf.text('Cheetah Payroll - User Documentation', 20, currentY);
    currentY += 15;
    
    pdf.setFontSize(10);
    pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, currentY);
    currentY += 20;
    
    documentationData.forEach((section) => {
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
    
    pdf.save('cheetah-payroll-documentation.pdf');
  };
  
  const extractTextFromReactElement = (element: React.ReactNode): string => {
    if (typeof element === 'string') {return element;}
    if (typeof element === 'number') {return element.toString();}
    if (!element) {return '';}
    
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

  const accordionItems = documentationData.map(item => ({
    id: item.id,
    title: item.title,
    children: item.content,
    defaultExpanded: false
  }));

  return (
    <div className="documentation-container" style={{ padding: 'var(--spacing-xl)' }}>
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
          User Documentation
        </h2>
        <button 
          onClick={exportToPDF}
          className="export-pdf-btn"
          title="Export Documentation to PDF"
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
        background: 'var(--color-success-bg)', 
        border: '1px solid var(--color-success-border)',
        borderRadius: 'var(--border-radius-md)',
        padding: 'var(--spacing-lg)',
        marginBottom: 'var(--spacing-xl)',
        color: 'var(--color-success-text)'
      }}>
        <p style={{ margin: 0 }}>
          <strong>Comprehensive User Guide:</strong> This documentation provides detailed instructions for all features of Cheetah Payroll. 
          Each section covers specific functionality with step-by-step instructions, best practices, and troubleshooting tips. 
          Use the export button to save this documentation as a PDF for offline reference.
        </p>
      </div>
      
      <Accordion items={accordionItems} allowMultiple={true} />
    </div>
  );
};

export default Documentation;