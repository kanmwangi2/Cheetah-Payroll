import React, { useState, useEffect } from 'react';
import AdvancedCharts from '../../dashboard/components/AdvancedCharts';
import {
  generatePayeReturn,
  generatePensionReport,
  generateMaternityReport,
  generateCBHIReport,
  generateRAMAReport,
  generateBankPaymentFile,
  generatePayrollCostAnalysis,
  getAvailableReportPeriods,
  StatutoryReportType
} from '../services/reports.service';
import { PDFReportGenerator } from '../services/pdf.service';
import { getPayrolls, getStaffPayrollData } from '../../payroll/services/payroll.service';
import { Company, Payroll } from '../../../shared/types';
import Papa from 'papaparse';

// Report type definitions
type ReportFormat = 'pdf' | 'csv' | 'excel';
type BankFileFormat = 'csv' | 'txt' | 'excel';

const STATUTORY_REPORTS = [
  { key: 'paye', label: 'PAYE Tax Return', description: 'Monthly PAYE tax report for RRA submission' },
  { key: 'pension', label: 'Pension Contributions', description: 'RSSB pension contribution report' },
  { key: 'maternity', label: 'Maternity Fund', description: 'Maternity fund contribution report' },
  { key: 'cbhi', label: 'CBHI Contributions', description: 'Community Based Health Insurance report' },
  { key: 'rama', label: 'RAMA Contributions', description: 'Rwanda Medical Aid report' },
] as const;

const Reports: React.FC<{ companyId: string }> = ({ companyId }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<string>('');
  const [selectedPayroll, setSelectedPayroll] = useState<string>('');
  const [availablePeriods, setAvailablePeriods] = useState<string[]>([]);
  const [payrolls, setPayrolls] = useState<Payroll[]>([]);
  const [activeTab, setActiveTab] = useState<'statutory' | 'management' | 'payslips' | 'bank'>('statutory');

  // Mock company data - in real app, this would come from props or context
  const company: Company = {
    id: companyId,
    name: 'Sample Company',
    email: 'info@company.com',
    phone: '+250 123 456 789',
    address: 'Kigali, Rwanda'
  };

  useEffect(() => {
    loadPayrollData();
  }, [companyId]);

  const loadPayrollData = async () => {
    try {
      const payrollData = await getPayrolls(companyId);
      setPayrolls(payrollData);
      const periods = getAvailableReportPeriods(payrollData);
      setAvailablePeriods(periods);
      if (periods.length > 0) {
        setSelectedPeriod(periods[0]);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load payroll data');
    }
  };

  const handleStatutoryReport = async (reportType: StatutoryReportType, format: ReportFormat = 'pdf') => {
    if (!selectedPeriod) {
      setError('Please select a reporting period');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const pdfGenerator = new PDFReportGenerator(company);
      let blob: Blob;
      let filename: string;

      switch (reportType) {
        case 'paye': {
          const { data, totalPaye, totalGross } = await generatePayeReturn(companyId, selectedPeriod);
          if (format === 'pdf') {
            blob = pdfGenerator.generatePayeReturn(data, totalPaye, totalGross, selectedPeriod);
            filename = `PAYE_Return_${selectedPeriod}.pdf`;
          } else {
            const csv = Papa.unparse(data);
            blob = new Blob([csv], { type: 'text/csv' });
            filename = `PAYE_Return_${selectedPeriod}.csv`;
          }
          break;
        }
        case 'pension': {
          const { data, totalEmployee, totalEmployer, grandTotal } = await generatePensionReport(companyId, selectedPeriod);
          if (format === 'pdf') {
            blob = pdfGenerator.generatePensionReport(data, totalEmployee, totalEmployer, grandTotal, selectedPeriod);
            filename = `Pension_Report_${selectedPeriod}.pdf`;
          } else {
            const csv = Papa.unparse(data);
            blob = new Blob([csv], { type: 'text/csv' });
            filename = `Pension_Report_${selectedPeriod}.csv`;
          }
          break;
        }
        case 'maternity': {
          const { data } = await generateMaternityReport(companyId, selectedPeriod);
          const csv = Papa.unparse(data);
          blob = new Blob([csv], { type: 'text/csv' });
          filename = `Maternity_Report_${selectedPeriod}.csv`;
          break;
        }
        case 'cbhi': {
          const { data } = await generateCBHIReport(companyId, selectedPeriod);
          const csv = Papa.unparse(data);
          blob = new Blob([csv], { type: 'text/csv' });
          filename = `CBHI_Report_${selectedPeriod}.csv`;
          break;
        }
        case 'rama': {
          const { data } = await generateRAMAReport(companyId, selectedPeriod);
          const csv = Papa.unparse(data);
          blob = new Blob([csv], { type: 'text/csv' });
          filename = `RAMA_Report_${selectedPeriod}.csv`;
          break;
        }
        default:
          throw new Error('Invalid report type');
      }

      PDFReportGenerator.downloadBlob(blob, filename);
    } catch (err: any) {
      setError(err.message || 'Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  const handlePayslipGeneration = async (type: 'individual' | 'bulk') => {
    if (!selectedPayroll) {
      setError('Please select a payroll');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const staffPayrolls = await getStaffPayrollData(companyId, selectedPayroll);
      const selectedPayrollData = payrolls.find(p => p.id === selectedPayroll);
      const period = selectedPayrollData?.period || 'Unknown';
      
      const pdfGenerator = new PDFReportGenerator(company);
      
      if (type === 'individual' && staffPayrolls.length > 0) {
        // Generate for first employee as example - in real app, user would select specific employee
        const blob = pdfGenerator.generatePayslip(staffPayrolls[0], company, period);
        PDFReportGenerator.downloadBlob(blob, `Payslip_${staffPayrolls[0].staffName}_${period}.pdf`);
      } else if (type === 'bulk') {
        const blob = pdfGenerator.generateBulkPayslips(staffPayrolls, company, period);
        PDFReportGenerator.downloadBlob(blob, `Bulk_Payslips_${period}.pdf`);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to generate payslips');
    } finally {
      setLoading(false);
    }
  };

  const handleBankFileGeneration = async (format: BankFileFormat) => {
    if (!selectedPayroll) {
      setError('Please select a payroll');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const bankFile = await generateBankPaymentFile(companyId, selectedPayroll, format);
      const blob = new Blob([bankFile], { type: format === 'csv' ? 'text/csv' : 'text/plain' });
      const selectedPayrollData = payrolls.find(p => p.id === selectedPayroll);
      const filename = `Bank_Payment_File_${selectedPayrollData?.period || 'Unknown'}.${format}`;
      PDFReportGenerator.downloadBlob(blob, filename);
    } catch (err: any) {
      setError(err.message || 'Failed to generate bank file');
    } finally {
      setLoading(false);
    }
  };

  const processedPayrolls = payrolls.filter(p => p.status === 'processed');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'statutory':
        return (
          <div className="statutory-reports">
            <h3>Statutory Reports</h3>
            <p>Generate compliance reports required by Rwanda Revenue Authority and other government agencies.</p>
            
            <div className="report-controls" style={{ marginBottom: '24px' }}>
              <select 
                value={selectedPeriod} 
                onChange={(e) => setSelectedPeriod(e.target.value)}
                style={{ marginRight: '12px', padding: '8px' }}
              >
                <option value="">Select Period</option>
                {availablePeriods.map(period => (
                  <option key={period} value={period}>{period}</option>
                ))}
              </select>
            </div>

            <div className="reports-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
              {STATUTORY_REPORTS.map(report => (
                <div key={report.key} className="report-card" style={{ 
                  border: '1px solid var(--color-card-border)', 
                  borderRadius: '8px', 
                  padding: '16px',
                  background: 'var(--color-card-bg)'
                }}>
                  <h4 style={{ margin: '0 0 8px 0', color: 'var(--color-primary-600)' }}>{report.label}</h4>
                  <p style={{ margin: '0 0 16px 0', fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>{report.description}</p>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => handleStatutoryReport(report.key as StatutoryReportType, 'pdf')}
                      disabled={loading || !selectedPeriod}
                      style={{
                        padding: '6px 12px',
                        background: 'var(--color-button-primary)',
                        color: 'var(--color-text-inverse)',
                        border: 'none',
                        borderRadius: '4px',
                        fontSize: '0.8rem',
                        cursor: loading || !selectedPeriod ? 'not-allowed' : 'pointer'
                      }}
                    >
                      PDF
                    </button>
                    <button
                      onClick={() => handleStatutoryReport(report.key as StatutoryReportType, 'csv')}
                      disabled={loading || !selectedPeriod}
                      style={{
                        padding: '6px 12px',
                        background: 'var(--color-card-bg)',
                        color: 'var(--color-button-secondary)',
                        border: '1px solid var(--color-button-secondary)',
                        borderRadius: '4px',
                        fontSize: '0.8rem',
                        cursor: loading || !selectedPeriod ? 'not-allowed' : 'pointer'
                      }}
                    >
                      CSV
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'payslips':
        return (
          <div className="payslip-generation">
            <h3>Payslip Generation</h3>
            <p>Generate individual or bulk payslips for processed payrolls.</p>
            
            <div className="report-controls" style={{ marginBottom: '24px' }}>
              <select 
                value={selectedPayroll} 
                onChange={(e) => setSelectedPayroll(e.target.value)}
                style={{ marginRight: '12px', padding: '8px', minWidth: '200px' }}
              >
                <option value="">Select Payroll</option>
                {processedPayrolls.map(payroll => (
                  <option key={payroll.id} value={payroll.id}>
                    {payroll.period} - {payroll.staffCount} employees
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', gap: '16px' }}>
              <button
                onClick={() => handlePayslipGeneration('individual')}
                disabled={loading || !selectedPayroll}
                style={{
                  padding: '12px 24px',
                  background: 'var(--color-button-primary)',
                  color: 'var(--color-text-inverse)',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: loading || !selectedPayroll ? 'not-allowed' : 'pointer'
                }}
              >
                Generate Individual Payslip
              </button>
              <button
                onClick={() => handlePayslipGeneration('bulk')}
                disabled={loading || !selectedPayroll}
                style={{
                  padding: '12px 24px',
                  background: 'var(--color-success-500)',
                  color: 'var(--color-text-inverse)',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: loading || !selectedPayroll ? 'not-allowed' : 'pointer'
                }}
              >
                Generate Bulk Payslips
              </button>
            </div>
          </div>
        );

      case 'bank':
        return (
          <div className="bank-files">
            <h3>Bank Payment Files</h3>
            <p>Generate payment instruction files for bank transfers.</p>
            
            <div className="report-controls" style={{ marginBottom: '24px' }}>
              <select 
                value={selectedPayroll} 
                onChange={(e) => setSelectedPayroll(e.target.value)}
                style={{ marginRight: '12px', padding: '8px', minWidth: '200px' }}
              >
                <option value="">Select Payroll</option>
                {processedPayrolls.map(payroll => (
                  <option key={payroll.id} value={payroll.id}>
                    {payroll.period} - {payroll.staffCount} employees
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', gap: '16px' }}>
              <button
                onClick={() => handleBankFileGeneration('csv')}
                disabled={loading || !selectedPayroll}
                style={{
                  padding: '12px 24px',
                  background: 'var(--color-button-primary)',
                  color: 'var(--color-text-inverse)',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: loading || !selectedPayroll ? 'not-allowed' : 'pointer'
                }}
              >
                Generate CSV
              </button>
              <button
                onClick={() => handleBankFileGeneration('txt')}
                disabled={loading || !selectedPayroll}
                style={{
                  padding: '12px 24px',
                  background: 'var(--color-warning-500)',
                  color: 'var(--color-text-inverse)',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: loading || !selectedPayroll ? 'not-allowed' : 'pointer'
                }}
              >
                Generate TXT
              </button>
            </div>
          </div>
        );

      case 'management':
        return (
          <div className="management-reports">
            <h3>Management Reports</h3>
            <p>Analytical reports for management decision making.</p>
            <AdvancedCharts data={{}} />
            <p style={{ color: 'var(--color-text-secondary)', fontStyle: 'italic' }}>Advanced analytics and management reports coming soon...</p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="reports-module">
      <h2>Reports & Analytics</h2>
      
      {/* Tab Navigation */}
      <div className="tab-navigation" style={{ 
        borderBottom: '1px solid var(--color-border-primary)',
        marginBottom: '24px'
      }}>
        {[
          { key: 'statutory', label: 'Statutory Reports' },
          { key: 'payslips', label: 'Payslips' },
          { key: 'bank', label: 'Bank Files' },
          { key: 'management', label: 'Management Reports' }
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
              fontSize: '0.9rem'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {renderTabContent()}

      {/* Loading and Error States */}
      {loading && (
        <div style={{ 
          padding: '20px', 
          textAlign: 'center', 
          color: 'var(--color-primary-600)',
          background: 'var(--color-bg-secondary)',
          borderRadius: '4px',
          margin: '16px 0'
        }}>
          Generating report...
        </div>
      )}

      {error && (
        <div className="reports-error" role="alert" style={{
          padding: '12px',
          background: 'var(--color-error-bg)',
          color: 'var(--color-error-text)',
          border: '1px solid var(--color-error-border)',
          borderRadius: '4px',
          margin: '16px 0'
        }}>
          {error}
        </div>
      )}
    </div>
  );
};

export default Reports;