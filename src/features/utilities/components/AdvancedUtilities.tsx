import React, { useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../../core/config/firebase.config';
import { useAuthContext } from '../../../core/providers/AuthProvider';
import * as XLSX from 'xlsx';
import Button from '../../../shared/components/ui/Button';

interface BackupData {
  staff: any[];
  payments: any[];
  deductions: any[];
  payrolls: any[];
  company: any;
  exportDate: string;
}

interface AdvancedUtilitiesProps {
  companyId?: string;
  companyName?: string;
}

export default function AdvancedUtilities({ companyId, companyName }: AdvancedUtilitiesProps) {
  const { user } = useAuthContext();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const getAllData = async (): Promise<BackupData> => {
    if (!companyId) {
      throw new Error('No company selected');
    }
    
    // Get all collections for the company
    const [staffSnap, paymentsSnap, deductionsSnap, payrollsSnap] = await Promise.all([
      getDocs(collection(db, 'companies', companyId, 'staff')),
      getDocs(collection(db, 'companies', companyId, 'payments')),
      getDocs(collection(db, 'companies', companyId, 'deductions')),
      getDocs(collection(db, 'companies', companyId, 'payrolls'))
    ]);

    const staff = staffSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const payments = paymentsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const deductions = deductionsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const payrolls = payrollsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    return {
      staff,
      payments,
      deductions,
      payrolls,
      company: { id: companyId, name: companyName },
      exportDate: new Date().toISOString()
    };
  };

  const handleJSONBackup = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      const data = await getAllData();
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${companyName || 'company'}_backup_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      
      setSuccess('JSON backup downloaded successfully!');
    } catch (e: unknown) {
      setError((e as Error).message || 'Backup failed');
    } finally {
      setLoading(false);
    }
  };

  const handleXLSXBackup = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      const data = await getAllData();
      
      // Create workbook with multiple sheets
      const workbook = XLSX.utils.book_new();
      
      // Add company info sheet
      const companySheet = XLSX.utils.json_to_sheet([{
        'Company Name': data.company.name,
        'Email': data.company.email,
        'Phone': data.company.phone,
        'Address': data.company.address,
        'Tax ID': data.company.taxId,
        'Sector': data.company.sector,
        'Export Date': data.exportDate
      }]);
      XLSX.utils.book_append_sheet(workbook, companySheet, 'Company Info');
      
      // Add staff sheet
      if (data.staff.length > 0) {
        const staffSheet = XLSX.utils.json_to_sheet(data.staff);
        XLSX.utils.book_append_sheet(workbook, staffSheet, 'Staff');
      }
      
      // Add payments sheet
      if (data.payments.length > 0) {
        const paymentsSheet = XLSX.utils.json_to_sheet(data.payments);
        XLSX.utils.book_append_sheet(workbook, paymentsSheet, 'Payments');
      }
      
      // Add deductions sheet
      if (data.deductions.length > 0) {
        const deductionsSheet = XLSX.utils.json_to_sheet(data.deductions);
        XLSX.utils.book_append_sheet(workbook, deductionsSheet, 'Deductions');
      }
      
      // Add payrolls sheet
      if (data.payrolls.length > 0) {
        const payrollsSheet = XLSX.utils.json_to_sheet(data.payrolls);
        XLSX.utils.book_append_sheet(workbook, payrollsSheet, 'Payrolls');
      }
      
      // Save the file
      XLSX.writeFile(workbook, `${companyName || 'company'}_backup_${new Date().toISOString().split('T')[0]}.xlsx`);
      
      setSuccess('XLSX backup downloaded successfully!');
    } catch (e: unknown) {
      setError((e as Error).message || 'XLSX backup failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (file: File) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      const text = await file.text();
      const data = JSON.parse(text) as BackupData;
      
      // Validate backup data structure
      if (!data.company || !data.exportDate) {
        throw new Error('Invalid backup file format');
      }
      
      // Here you would implement the restore logic
      // For now, just show success
      setSuccess(`Backup file validated successfully. Contains ${data.staff?.length || 0} staff, ${data.payments?.length || 0} payments, ${data.deductions?.length || 0} deductions, and ${data.payrolls?.length || 0} payrolls from ${data.company.name}.`);
      
    } catch (e: unknown) {
      setError((e as Error).message || 'Restore failed');
    } finally {
      setLoading(false);
    }
  };

  if (!companyId) {
    return (
      <div style={{
        padding: '24px',
        textAlign: 'center',
        color: 'var(--color-text-secondary)'
      }}>
        Please select a company to access backup and restore features.
      </div>
    );
  }

  return (
    <div style={{
      display: 'grid',
      gap: '32px'
    }}>
      {/* Company Info */}
      <div style={{
        background: 'var(--color-bg-secondary)',
        border: '1px solid var(--color-border-primary)',
        borderRadius: '8px',
        padding: '20px'
      }}>
        <h4 style={{ 
          margin: '0 0 16px 0', 
          fontSize: '1.1rem', 
          fontWeight: 600, 
          color: 'var(--color-text-primary)' 
        }}>
          Current Company: {companyName || 'Unknown'}
        </h4>
        <p style={{ 
          margin: 0, 
          color: 'var(--color-text-secondary)', 
          fontSize: '0.9rem' 
        }}>
          All backup and restore operations will be performed for this company's data.
        </p>
      </div>

      {/* Backup Section */}
      <div style={{
        background: 'var(--color-bg-secondary)',
        border: '1px solid var(--color-border-primary)',
        borderRadius: '8px',
        padding: '20px'
      }}>
        <h4 style={{ 
          margin: '0 0 16px 0', 
          fontSize: '1.1rem', 
          fontWeight: 600, 
          color: 'var(--color-text-primary)' 
        }}>
          Create Backup
        </h4>
        <p style={{ 
          margin: '0 0 20px 0', 
          color: 'var(--color-text-secondary)', 
          fontSize: '0.9rem' 
        }}>
          Export all company data including staff, payments, deductions, and payroll records.
        </p>
        
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <Button
            variant="primary"
            size="md"
            onClick={handleJSONBackup}
            loading={loading}
            disabled={loading}
          >
            📄 Export as JSON
          </Button>
          
          <Button
            variant="secondary"
            size="md"
            onClick={handleXLSXBackup}
            loading={loading}
            disabled={loading}
          >
            📊 Export as Excel (XLSX)
          </Button>
        </div>
      </div>

      {/* Restore Section */}
      <div style={{
        background: 'var(--color-bg-secondary)',
        border: '1px solid var(--color-border-primary)',
        borderRadius: '8px',
        padding: '20px'
      }}>
        <h4 style={{ 
          margin: '0 0 16px 0', 
          fontSize: '1.1rem', 
          fontWeight: 600, 
          color: 'var(--color-text-primary)' 
        }}>
          Restore from Backup
        </h4>
        <p style={{ 
          margin: '0 0 20px 0', 
          color: 'var(--color-text-secondary)', 
          fontSize: '0.9rem' 
        }}>
          Upload a JSON backup file to restore company data.
        </p>
        
        <input
          type="file"
          accept=".json"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              handleRestore(file);
            }
          }}
          disabled={loading}
          style={{
            padding: '12px',
            border: '1px solid var(--color-border-primary)',
            borderRadius: '6px',
            backgroundColor: 'var(--color-bg-primary)',
            color: 'var(--color-text-primary)',
            fontSize: '0.9rem',
            width: '100%',
            maxWidth: '400px'
          }}
        />
      </div>

      {/* Messages */}
      {error && (
        <div style={{
          padding: '16px',
          background: 'var(--color-error-bg)',
          border: '1px solid var(--color-error-border)',
          borderRadius: '8px',
          color: 'var(--color-error-text)',
          fontSize: '0.9rem'
        }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {success && (
        <div style={{
          padding: '16px',
          background: 'var(--color-success-bg)',
          border: '1px solid var(--color-success-border)',
          borderRadius: '8px',
          color: 'var(--color-success-text)',
          fontSize: '0.9rem'
        }}>
          <strong>Success:</strong> {success}
        </div>
      )}
    </div>
  );
}
