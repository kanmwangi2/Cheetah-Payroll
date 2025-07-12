import React, { useState } from 'react';
import SystemNotifications from '../../../shared/components/SystemNotifications';
import BulkOperations from './BulkOperations';
import AdvancedUtilities from './AdvancedUtilities';
import AuditTrail from '../../../shared/components/AuditTrail';
import { Accordion } from '../../../shared/components/ui/Accordion';
import jsPDF from 'jspdf';

const faqData = [
  {
    category: 'Staff Management',
    items: [
      { q: 'How do I add a new staff member?', a: 'Navigate to the Staff page and click "Add Staff". Fill in the required information including personal details, employment details, and bank information. All fields marked with * are required.' },
      { q: 'How do I edit staff information?', a: 'Go to the Staff page, find the employee in the list, and click the edit button. You can modify any information except the Employee ID.' },
      { q: 'Can I import multiple staff members at once?', a: 'Yes, use the Import/Export section on the Staff page. Download the template first, fill it with your data, then upload the CSV or Excel file.' },
      { q: 'What happens when I delete a staff member?', a: 'Deleting a staff member will also remove all their associated payments, deductions, and payroll records. This action cannot be undone.' }
    ]
  },
  {
    category: 'Payments & Deductions',
    items: [
      { q: 'What payment types are supported?', a: 'The system supports Basic Salary, Transport Allowance, Overtime Allowance, Bonus, Commission, and Other Allowances. Each can be set as gross or net, and as recurring or one-time.' },
      { q: 'How do loan deductions work?', a: 'Loans can be set up with automatic installment calculations. Specify the loan amount and number of installments, and the system will calculate monthly deductions automatically.' },
      { q: 'Can I record partial loan payments?', a: 'Yes, you can record payments of any amount against loans. The system will update the remaining balance and remaining installments accordingly.' },
      { q: 'What happens to deductions when payroll is deleted?', a: 'When a payroll is deleted, any loan payments recorded in that payroll are automatically reversed to maintain accurate balances.' }
    ]
  },
  {
    category: 'Payroll Processing',
    items: [
      { q: 'How is payroll calculated?', a: 'Payroll follows Rwanda tax law: PAYE on gross pay, Pension (6% employee + 8% employer), Maternity (0.3% each), RAMA (7.5% each on basic pay), then CBHI (0.5% on net before CBHI).' },
      { q: 'What is the approval workflow?', a: 'Payroll Preparers create payrolls in draft status. They can submit for approval, then Payroll Approvers can approve or reject. Only approved payrolls can be processed.' },
      { q: 'Can I modify payroll after approval?', a: 'No, once approved, payrolls cannot be modified. If changes are needed, the payroll must be rejected and recreated.' },
      { q: 'How do I handle gross-up calculations?', a: 'The system includes a gross-up calculator that uses binary search to find the gross amount needed to achieve a target net pay.' }
    ]
  },
  {
    category: 'Reports',
    items: [
      { q: 'What statutory reports are available?', a: 'The system generates PAYE returns, Pension contributions, Maternity fund reports, CBHI reports, and RAMA reports - all required for Rwanda compliance.' },
      { q: 'Can I generate payslips in bulk?', a: 'Yes, you can generate individual payslips or bulk payslips for entire payroll runs. All payslips are professionally formatted PDFs.' },
      { q: 'How do I generate bank payment files?', a: 'Select a processed payroll and choose your bank file format (CSV, TXT, or Excel). The system will generate payment instructions with employee bank details.' },
      { q: 'Can I export data for external analysis?', a: 'Yes, most data can be exported to CSV, Excel, or PDF formats for further analysis or record keeping.' }
    ]
  },
  {
    category: 'System & Security',
    items: [
      { q: 'Who can access what features?', a: 'Access is role-based: Primary Admin (full access), App Admin (all companies), Company Admin (assigned companies), Payroll Approver (approve only), Payroll Preparer (create only).' },
      { q: 'Is my data secure?', a: 'Yes, the system uses Firebase security rules, authentication, and encryption. All financial transactions are logged for audit purposes.' },
      { q: 'Can I switch between companies?', a: 'Yes, users with access to multiple companies can switch using the "Switch Company" option in the user menu.' },
      { q: 'How do I change my password?', a: 'Use the "User Profile" link in the user dropdown menu to access account settings and change your password.' }
    ]
  }
];

const tutorials = [
  {
    title: 'Getting Started with Cheetah Payroll',
    description: 'A complete guide to setting up your first payroll',
    steps: [
      'Set up your company information and tax configuration',
      'Add staff members with complete personal and employment details',
      'Configure payments (salary, allowances) and deductions',
      'Create your first payroll and review calculations',
      'Submit for approval and process once approved',
      'Generate payslips and statutory reports'
    ]
  },
  {
    title: 'Managing Employee Loans',
    description: 'How to set up and track employee loans',
    steps: [
      'Go to Deductions page and select "Loan" type',
      'Enter loan amount and number of installments',
      'System automatically calculates monthly installment',
      'Monitor loan progress through the visual indicators',
      'Record payments manually if needed',
      'Generate loan reports for management review'
    ]
  },
  {
    title: 'Processing Monthly Payroll',
    description: 'Step-by-step monthly payroll processing',
    steps: [
      'Review and update staff payments and deductions',
      'Create comprehensive payroll for the period',
      'Review all calculations and staff payroll details',
      'Submit payroll for approval (if you\'re a preparer)',
      'Approve payroll (if you\'re an approver)',
      'Process payroll and generate bank files',
      'Generate and distribute payslips',
      'Submit statutory reports to authorities'
    ]
  }
];

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
        </ul>
        
        <h4>4. Payroll Approver</h4>
        <ul>
          <li>Review and approve payroll runs</li>
          <li>View all payroll data and reports</li>
          <li>Cannot create or modify employee data</li>
        </ul>
        
        <h4>5. Payroll Preparer</h4>
        <ul>
          <li>Create and calculate payroll runs</li>
          <li>Manage employee payments and deductions</li>
          <li>Cannot approve payrolls (requires approval)</li>
        </ul>
      </div>
    )
  },
  {
    id: 'payroll-processing',
    title: 'Payroll Processing',
    content: (
      <div>
        <h4>Tax Calculations</h4>
        <p><strong>PAYE (Pay As You Earn):</strong></p>
        <ul>
          <li>Calculated using Rwanda's progressive tax brackets</li>
          <li>Current brackets: 0% (0-60,000), 10% (60,001-100,000), 20% (100,001-200,000), 30% (200,001+)</li>
          <li>Applied to taxable income after pension deductions</li>
        </ul>
        
        <h4>Social Security Contributions</h4>
        <p><strong>Pension (RSSB):</strong> Employee contribution: 6% of gross salary, Employer contribution: 8% of gross salary</p>
        <p><strong>Maternity Leave Insurance:</strong> Employee and employer contribution: 0.3% of gross salary each</p>
        <p><strong>CBHI:</strong> Employee contribution: 0.5% of gross salary</p>
        <p><strong>RAMA:</strong> Employee and employer contribution: 7.5% of gross salary each (medical professionals only)</p>
      </div>
    )
  }
];

const Utilities: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'faq' | 'tutorials' | 'docs' | 'support' | 'audit' | 'system'>('faq');
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);
  const [expandedTutorial, setExpandedTutorial] = useState<string | null>(null);
  const [expandedDoc, setExpandedDoc] = useState<string | null>(null);

  const toggleFaq = (category: string) => {
    setExpandedFaq(expandedFaq === category ? null : category);
  };

  const toggleTutorial = (title: string) => {
    setExpandedTutorial(expandedTutorial === title ? null : title);
  };

  const toggleDoc = (id: string) => {
    setExpandedDoc(expandedDoc === id ? null : id);
  };

  const exportToPDF = () => {
    const pdf = new jsPDF();
    const pageHeight = pdf.internal.pageSize.height;
    let currentY = 20;
    
    pdf.setFontSize(20);
    pdf.text('Cheetah Payroll - Documentation & FAQ', 20, currentY);
    currentY += 15;
    
    pdf.setFontSize(10);
    pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, currentY);
    currentY += 20;
    
    // Add FAQ content
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Frequently Asked Questions', 20, currentY);
    currentY += 15;
    
    faqData.forEach((category) => {
      if (currentY > pageHeight - 30) {
        pdf.addPage();
        currentY = 20;
      }
      
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text(category.category, 20, currentY);
      currentY += 10;
      
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      
      category.items.forEach((item) => {
        const qLines = pdf.splitTextToSize(`Q: ${item.q}`, 170);
        qLines.forEach((line: string) => {
          if (currentY > pageHeight - 20) {
            pdf.addPage();
            currentY = 20;
          }
          pdf.text(line, 20, currentY);
          currentY += 5;
        });
        
        const aLines = pdf.splitTextToSize(`A: ${item.a}`, 170);
        aLines.forEach((line: string) => {
          if (currentY > pageHeight - 20) {
            pdf.addPage();
            currentY = 20;
          }
          pdf.text(line, 20, currentY);
          currentY += 5;
        });
        currentY += 5;
      });
      currentY += 10;
    });
    
    // Add Documentation content
    if (currentY > pageHeight - 50) {
      pdf.addPage();
      currentY = 20;
    }
    
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('User Documentation', 20, currentY);
    currentY += 15;
    
    documentationData.forEach((section) => {
      if (currentY > pageHeight - 30) {
        pdf.addPage();
        currentY = 20;
      }
      
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text(section.title, 20, currentY);
      currentY += 10;
      
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
      
      currentY += 10;
    });
    
    pdf.save('cheetah-payroll-complete-guide.pdf');
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

  const renderTabContent = () => {
    switch (activeTab) {
      case 'faq':
        return (
          <div className="faq-content">
            <h3>Frequently Asked Questions</h3>
            <p style={{ marginBottom: '24px', color: '#666' }}>Find answers to common questions about using Cheetah Payroll.</p>
            
            {faqData.map((category) => (
              <div key={category.category} style={{ marginBottom: '24px' }}>
                <button
                  onClick={() => toggleFaq(category.category)}
                  style={{
                    width: '100%',
                    padding: '16px',
                    background: '#f8f9fa',
                    border: '1px solid #e9ecef',
                    borderRadius: '8px',
                    fontSize: '1.1rem',
                    fontWeight: '600',
                    color: '#1976d2',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  {category.category}
                  <span>{expandedFaq === category.category ? '−' : '+'}</span>
                </button>
                
                {expandedFaq === category.category && (
                  <div style={{ marginTop: '8px', padding: '0 16px' }}>
                    {category.items.map((item, index) => (
                      <div key={index} style={{ marginBottom: '16px', padding: '12px', background: 'white', border: '1px solid #e9ecef', borderRadius: '4px' }}>
                        <h5 style={{ margin: '0 0 8px 0', color: '#333' }}>{item.q}</h5>
                        <p style={{ margin: 0, color: '#666', lineHeight: '1.5' }}>{item.a}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        );

      case 'tutorials':
        return (
          <div className="tutorials-content">
            <h3>Video Tutorials & Guides</h3>
            <p style={{ marginBottom: '24px', color: '#666' }}>Step-by-step guides to help you master Cheetah Payroll.</p>
            
            {tutorials.map((tutorial) => (
              <div key={tutorial.title} style={{ marginBottom: '24px' }}>
                <button
                  onClick={() => toggleTutorial(tutorial.title)}
                  style={{
                    width: '100%',
                    padding: '16px',
                    background: '#e3f2fd',
                    border: '1px solid #1976d2',
                    borderRadius: '8px',
                    fontSize: '1.1rem',
                    fontWeight: '600',
                    color: '#1976d2',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  {tutorial.title}
                  <span>{expandedTutorial === tutorial.title ? '−' : '+'}</span>
                </button>
                
                {expandedTutorial === tutorial.title && (
                  <div style={{ marginTop: '8px', padding: '16px', background: 'white', border: '1px solid #e9ecef', borderRadius: '4px' }}>
                    <p style={{ marginBottom: '16px', color: '#666' }}>{tutorial.description}</p>
                    <ol style={{ paddingLeft: '20px' }}>
                      {tutorial.steps.map((step, index) => (
                        <li key={index} style={{ marginBottom: '8px', color: '#333' }}>{step}</li>
                      ))}
                    </ol>
                  </div>
                )}
              </div>
            ))}
          </div>
        );

      case 'docs':
        return (
          <div className="docs-content">
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              marginBottom: '24px' 
            }}>
              <h3>User Documentation</h3>
              <button 
                onClick={exportToPDF}
                className="export-pdf-btn"
                title="Export Complete Guide to PDF"
                style={{
                  background: 'var(--color-error-500)',
                  color: 'var(--color-text-inverse)',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14,2 14,8 20,8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                  <polyline points="10,9 9,9 8,9" />
                </svg>
                Export Guide to PDF
              </button>
            </div>
            
            <p style={{ marginBottom: '24px', color: 'var(--color-text-secondary)' }}>Comprehensive documentation for all features of Cheetah Payroll with step-by-step instructions and best practices.</p>
            
            {documentationData.map((doc) => (
              <div key={doc.id} style={{ marginBottom: '24px' }}>
                <button
                  onClick={() => toggleDoc(doc.id)}
                  style={{
                    width: '100%',
                    padding: '16px',
                    background: 'var(--color-success-bg)',
                    border: '1px solid var(--color-success-border)',
                    borderRadius: '8px',
                    fontSize: '1.1rem',
                    fontWeight: '600',
                    color: 'var(--color-success-text)',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  {doc.title}
                  <span>{expandedDoc === doc.id ? '−' : '+'}</span>
                </button>
                
                {expandedDoc === doc.id && (
                  <div style={{ 
                    marginTop: '8px', 
                    padding: '16px', 
                    background: 'var(--color-card-bg)', 
                    border: '1px solid var(--color-card-border)', 
                    borderRadius: '4px',
                    color: 'var(--color-text-primary)'
                  }}>
                    {doc.content}
                  </div>
                )}
              </div>
            ))}
            
            <div style={{ marginTop: '32px', padding: '16px', background: 'var(--color-info-bg)', border: '1px solid var(--color-info-border)', borderRadius: '8px' }}>
              <h4 style={{ margin: '0 0 12px 0', color: 'var(--color-info-text)' }}>Additional Resources</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
                <div style={{ padding: '12px', background: 'var(--color-card-bg)', border: '1px solid var(--color-card-border)', borderRadius: '6px' }}>
                  <h5 style={{ margin: '0 0 8px 0', color: 'var(--color-primary-600)' }}>Product Blueprint</h5>
                  <p style={{ margin: '0 0 12px 0', fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>Complete business requirements and specifications</p>
                  <a href="./Blueprint.md" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-primary-600)', textDecoration: 'none', fontSize: '0.9rem' }}>View Blueprint →</a>
                </div>
                
                <div style={{ padding: '12px', background: 'var(--color-card-bg)', border: '1px solid var(--color-card-border)', borderRadius: '6px' }}>
                  <h5 style={{ margin: '0 0 8px 0', color: 'var(--color-primary-600)' }}>Deployment Guide</h5>
                  <p style={{ margin: '0 0 12px 0', fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>Setup and deployment instructions</p>
                  <a href="./Deployment.md" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-primary-600)', textDecoration: 'none', fontSize: '0.9rem' }}>View Guide →</a>
                </div>
              </div>
            </div>
          </div>
        );

      case 'support':
        return (
          <div className="support-content">
            <h3>Support & Contact</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
              <div style={{ padding: '24px', border: '1px solid #e9ecef', borderRadius: '8px', background: 'white' }}>
                <h4 style={{ margin: '0 0 16px 0', color: '#1976d2' }}>📞 Contact Information</h4>
                <div style={{ marginBottom: '12px' }}>
                  <strong>Email:</strong> support@cheetahpayroll.com
                </div>
                <div style={{ marginBottom: '12px' }}>
                  <strong>Phone:</strong> +250 123 456 789
                </div>
                <div style={{ marginBottom: '12px' }}>
                  <strong>WhatsApp:</strong> +250 123 456 789
                </div>
                <div>
                  <strong>Support Hours:</strong> Mon-Fri, 8AM-6PM (EAT)
                </div>
              </div>
              
              <div style={{ padding: '24px', border: '1px solid #e9ecef', borderRadius: '8px', background: 'white' }}>
                <h4 style={{ margin: '0 0 16px 0', color: '#1976d2' }}>🏢 Office Location</h4>
                <div style={{ marginBottom: '12px' }}>
                  <strong>Address:</strong><br />
                  Cheetah Payroll Ltd<br />
                  KG 123 St, Kigali<br />
                  Rwanda
                </div>
                <div>
                  <strong>Business Hours:</strong> Mon-Fri, 8AM-5PM
                </div>
              </div>
              
              <div style={{ padding: '24px', border: '1px solid #e9ecef', borderRadius: '8px', background: 'white' }}>
                <h4 style={{ margin: '0 0 16px 0', color: '#1976d2' }}>💬 Online Support</h4>
                <div style={{ marginBottom: '12px' }}>
                  <strong>Live Chat:</strong> Available 24/7
                </div>
                <div style={{ marginBottom: '12px' }}>
                  <strong>Help Desk:</strong> support.cheetahpayroll.com
                </div>
                <div>
                  <strong>Response Time:</strong> Within 2 hours
                </div>
              </div>
            </div>
          </div>
        );

      case 'audit':
        return (
          <div className="audit-content">
            <h3>Audit Trail</h3>
            <p style={{ marginBottom: '24px', color: 'var(--color-text-secondary)' }}>Complete audit log of all system activities, user actions, and data changes.</p>
            <AuditTrail />
          </div>
        );

      case 'system':
        return (
          <div className="system-content">
            <h3>System Information & Utilities</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px', marginBottom: '24px' }}>
              <div style={{ padding: '16px', border: '1px solid var(--color-card-border)', borderRadius: '8px', background: 'var(--color-card-bg)' }}>
                <h4 style={{ margin: '0 0 12px 0', color: 'var(--color-primary-600)' }}>Application Version</h4>
                <div style={{ marginBottom: '8px', color: 'var(--color-text-primary)' }}><strong>Version:</strong> 1.0.0</div>
                <div style={{ marginBottom: '8px', color: 'var(--color-text-primary)' }}><strong>Build:</strong> 2025.07.001</div>
                <div style={{ color: 'var(--color-text-primary)' }}><strong>Last Updated:</strong> July 12, 2025</div>
              </div>
              
              <div style={{ padding: '16px', border: '1px solid var(--color-card-border)', borderRadius: '8px', background: 'var(--color-card-bg)' }}>
                <h4 style={{ margin: '0 0 12px 0', color: 'var(--color-primary-600)' }}>Technology Stack</h4>
                <div style={{ marginBottom: '8px', color: 'var(--color-text-primary)' }}><strong>Frontend:</strong> React 18 + TypeScript</div>
                <div style={{ marginBottom: '8px', color: 'var(--color-text-primary)' }}><strong>Backend:</strong> Firebase + Express.js</div>
                <div style={{ color: 'var(--color-text-primary)' }}><strong>Database:</strong> Google Cloud Firestore</div>
              </div>
              
              <div style={{ padding: '16px', border: '1px solid var(--color-card-border)', borderRadius: '8px', background: 'var(--color-card-bg)' }}>
                <h4 style={{ margin: '0 0 12px 0', color: 'var(--color-primary-600)' }}>Security & Compliance</h4>
                <div style={{ marginBottom: '8px', color: 'var(--color-text-primary)' }}><strong>Encryption:</strong> AES-256</div>
                <div style={{ marginBottom: '8px', color: 'var(--color-text-primary)' }}><strong>Authentication:</strong> Firebase Auth</div>
                <div style={{ color: 'var(--color-text-primary)' }}><strong>Compliance:</strong> Rwanda Tax Law</div>
              </div>
            </div>
            
            <div>
              <h4 style={{ color: 'var(--color-text-primary)', marginBottom: '16px' }}>Advanced Utilities</h4>
              <AdvancedUtilities />
              <BulkOperations type="staff" />
              <BulkOperations type="payroll" />
              <SystemNotifications />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="utilities-module" style={{ padding: 'var(--spacing-xl)' }}>
      <h2 style={{ color: 'var(--color-text-primary)', marginBottom: 'var(--spacing-xl)' }}>Utilities & Support</h2>
      
      {/* Tab Navigation */}
      <div className="tab-navigation" style={{ 
        borderBottom: '1px solid var(--color-border-primary)',
        marginBottom: '24px'
      }}>
        {[
          { key: 'faq', label: 'FAQ', icon: '❓' },
          { key: 'tutorials', label: 'Tutorials', icon: '📚' },
          { key: 'docs', label: 'Documentation', icon: '📄' },
          { key: 'support', label: 'Support', icon: '🆘' },
          { key: 'audit', label: 'Audit Trail', icon: '📊' },
          { key: 'system', label: 'System Info', icon: '⚙️' }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            style={{
              padding: '12px 24px',
              border: 'none',
              background: 'none',
              borderBottom: activeTab === tab.key ? '2px solid var(--color-primary-600)' : '2px solid transparent',
              color: activeTab === tab.key ? 'var(--color-primary-600)' : 'var(--color-text-secondary)',
              fontWeight: activeTab === tab.key ? '600' : 'normal',
              cursor: 'pointer',
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {renderTabContent()}
    </div>
  );
};

export default Utilities;
