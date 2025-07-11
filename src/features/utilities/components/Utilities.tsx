import React, { useState } from 'react';
import SystemNotifications from '../../../shared/components/SystemNotifications';
import BulkOperations from './BulkOperations';
import AdvancedUtilities from './AdvancedUtilities';

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

const Utilities: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'faq' | 'tutorials' | 'docs' | 'support' | 'system'>('faq');
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);
  const [expandedTutorial, setExpandedTutorial] = useState<string | null>(null);

  const toggleFaq = (category: string) => {
    setExpandedFaq(expandedFaq === category ? null : category);
  };

  const toggleTutorial = (title: string) => {
    setExpandedTutorial(expandedTutorial === title ? null : title);
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
            <h3>Documentation</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
              <div style={{ padding: '16px', border: '1px solid #e9ecef', borderRadius: '8px', background: 'white' }}>
                <h4 style={{ margin: '0 0 12px 0', color: '#1976d2' }}>Product Blueprint</h4>
                <p style={{ margin: '0 0 16px 0', color: '#666' }}>Complete product specification and business requirements.</p>
                <a href="./Blueprint.md" target="_blank" rel="noopener noreferrer" style={{ color: '#1976d2', textDecoration: 'none' }}>View Blueprint →</a>
              </div>
              
              <div style={{ padding: '16px', border: '1px solid #e9ecef', borderRadius: '8px', background: 'white' }}>
                <h4 style={{ margin: '0 0 12px 0', color: '#1976d2' }}>Tax Calculations</h4>
                <p style={{ margin: '0 0 16px 0', color: '#666' }}>Detailed explanation of Rwanda tax calculations and compliance.</p>
                <button style={{ color: '#1976d2', background: 'none', border: 'none', cursor: 'pointer' }}>Learn More →</button>
              </div>
              
              <div style={{ padding: '16px', border: '1px solid #e9ecef', borderRadius: '8px', background: 'white' }}>
                <h4 style={{ margin: '0 0 12px 0', color: '#1976d2' }}>API Documentation</h4>
                <p style={{ margin: '0 0 16px 0', color: '#666' }}>Integration guide for developers and system administrators.</p>
                <button style={{ color: '#1976d2', background: 'none', border: 'none', cursor: 'pointer' }}>View API Docs →</button>
              </div>
              
              <div style={{ padding: '16px', border: '1px solid #e9ecef', borderRadius: '8px', background: 'white' }}>
                <h4 style={{ margin: '0 0 12px 0', color: '#1976d2' }}>Deployment Guide</h4>
                <p style={{ margin: '0 0 16px 0', color: '#666' }}>Instructions for setting up and deploying the system.</p>
                <a href="./Deployment.md" target="_blank" rel="noopener noreferrer" style={{ color: '#1976d2', textDecoration: 'none' }}>View Guide →</a>
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

      case 'system':
        return (
          <div className="system-content">
            <h3>System Information</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
              <div style={{ padding: '16px', border: '1px solid #e9ecef', borderRadius: '8px', background: 'white' }}>
                <h4 style={{ margin: '0 0 12px 0', color: '#1976d2' }}>Application Version</h4>
                <div style={{ marginBottom: '8px' }}><strong>Version:</strong> 1.0.0</div>
                <div style={{ marginBottom: '8px' }}><strong>Build:</strong> 2025.07.001</div>
                <div><strong>Last Updated:</strong> July 11, 2025</div>
              </div>
              
              <div style={{ padding: '16px', border: '1px solid #e9ecef', borderRadius: '8px', background: 'white' }}>
                <h4 style={{ margin: '0 0 12px 0', color: '#1976d2' }}>Technology Stack</h4>
                <div style={{ marginBottom: '8px' }}><strong>Frontend:</strong> React 18 + TypeScript</div>
                <div style={{ marginBottom: '8px' }}><strong>Backend:</strong> Firebase + Express.js</div>
                <div><strong>Database:</strong> Google Cloud Firestore</div>
              </div>
              
              <div style={{ padding: '16px', border: '1px solid #e9ecef', borderRadius: '8px', background: 'white' }}>
                <h4 style={{ margin: '0 0 12px 0', color: '#1976d2' }}>Security & Compliance</h4>
                <div style={{ marginBottom: '8px' }}><strong>Encryption:</strong> AES-256</div>
                <div style={{ marginBottom: '8px' }}><strong>Authentication:</strong> Firebase Auth</div>
                <div><strong>Compliance:</strong> Rwanda Tax Law</div>
              </div>
            </div>
            
            <div style={{ marginTop: '24px' }}>
              <h4>Advanced Utilities</h4>
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
    <div className="utilities-module">
      <h2>Utilities & Support</h2>
      
      {/* Tab Navigation */}
      <div className="tab-navigation" style={{ 
        borderBottom: '1px solid #e0e0e0',
        marginBottom: '24px'
      }}>
        {[
          { key: 'faq', label: 'FAQ', icon: '❓' },
          { key: 'tutorials', label: 'Tutorials', icon: '📚' },
          { key: 'docs', label: 'Documentation', icon: '📄' },
          { key: 'support', label: 'Support', icon: '🆘' },
          { key: 'system', label: 'System Info', icon: '⚙️' }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            style={{
              padding: '12px 24px',
              border: 'none',
              background: 'none',
              borderBottom: activeTab === tab.key ? '2px solid #1976d2' : '2px solid transparent',
              color: activeTab === tab.key ? '#1976d2' : '#666',
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
